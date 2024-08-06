import { execSync } from 'child_process';

const packageName = process.argv[2] || '';

const recordFrameRate = (packageName: string) => {
  const output = execSync(
    `adb shell dumpsys gfxinfo ${packageName} framestats`
  );
  execSync(`ts-node filterData.ts ${output}`);
};

const runBashCommandInterval = (intervalSeconds: number) => {
  setInterval(() => {
    recordFrameRate(packageName);
  }, intervalSeconds * 1000);
};

const startTrace = () => {
  execSync('adb shell atrace --async_start -c -b 4096 sched gfx view');
};

const stopTrace = () => {
  execSync('adb shell atrace --async_stop > ./data/my_trace.trace');
};

const removeCommand = 'adb shell rm /sdcard/Dream11Log/ff.txt';
const removeCommand2 = 'adb shell rm /sdcard/Dream11Log/changes.txt';
const removeCommand3 = 'adb shell rm /sdcard/Dream11Log/log.txt';

const pullLogTxt = 'adb pull /sdcard/Dream11Log/log.txt ./data/';
const pullEventsTxt = 'adb pull /sdcard/Dream11Log/ff.txt ./data/';
const pullChangesTxt = 'adb pull /sdcard/Dream11Log/changes.txt ./data/';

const intervalSeconds = 1;

const cleanUp = () => {
  execSync(removeCommand);
  execSync(removeCommand2);
  execSync(removeCommand3);
};
const pullDocs = () => {
  execSync(pullLogTxt);
  execSync(pullEventsTxt);
  execSync(pullChangesTxt);
};

try {
  cleanUp();
  startTrace();
  runBashCommandInterval(intervalSeconds);
} catch (exception) {
  pullDocs();
  stopTrace();
  cleanUp();
}
