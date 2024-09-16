#!/usr/bin/env ts-node

const { execSync } = require('child_process');
const path = require('path');
const packageName = process.argv[2] || 'com.app.dream11staging';

const removeCommand = 'adb shell rm /sdcard/Dream11Log/ff.txt';
const removeCommand2 = 'adb shell rm /sdcard/Dream11Log/changes.txt';
const removeCommand3 = 'adb shell rm /sdcard/Dream11Log/log.txt';

const pullLogTxt = 'adb pull /sdcard/Dream11Log/log.txt ./data/';
const pullEventsTxt = 'adb pull /sdcard/Dream11Log/ff.txt ./data/';
const pullChangesTxt = 'adb pull /sdcard/Dream11Log/changes.txt ./data/';
const copyToWeb = 'cp -r ./data ./web/data';

const intervalSeconds = 1;

const recordFrameRate = (packageName: string) => {
  const output = execSync(
    `adb shell dumpsys gfxinfo ${packageName} framestats`,
    {
      encoding: 'utf-8',
    }
  );
  const scriptPath = path.resolve(process.cwd(), 'src/scripts/filterData.ts');

  execSync(
    `ts-node ${scriptPath} ${output.replace(/"/g, '\\"').replace(/\n/g, '\\n')}`,
    {
      encoding: 'utf-8',
    }
  );
};

const runBashCommandInterval = (intervalSeconds: number) => {
  setInterval(() => {
    try {
      recordFrameRate(packageName);
    } catch (exception) {
      pullDocs();
      stopTrace();
      cleanUpRecord();
      moveToWebDir();
    }
  }, intervalSeconds * 1000);
};

const startTrace = () => {
  execSync('adb shell atrace --async_start -c -b 4096 sched gfx view');
};

const stopTrace = () => {
  execSync('adb shell atrace --async_stop > ./data/my_trace.trace');
};
const runCommandWithExceptionHadling = (command: string) => {
  try {
    execSync(command);
  } catch (exception) {
    console.log('Exception Occured while cleanup ');
  }
};
const cleanUpRecord = () => {
  try {
    runCommandWithExceptionHadling(removeCommand);
    runCommandWithExceptionHadling(removeCommand2);
    runCommandWithExceptionHadling(removeCommand3);
  } catch (exception) {
    console.log('Exception Occured while cleanup ', exception);
  }
};
const pullDocs = () => {
  execSync(pullLogTxt);
  execSync(pullEventsTxt);
  execSync(pullChangesTxt);
};

const moveToWebDir = () => {
  execSync(copyToWeb);
};

cleanUpRecord();
startTrace();
runBashCommandInterval(intervalSeconds);
