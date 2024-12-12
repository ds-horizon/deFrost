#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const args = process.argv.slice(2);
let packageName = 'com.app.dream11staging';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '-p' || args[i] === '--packageName') {
    packageName = args[i + 1];
    i++;
  }
}
const nodeModulesRepo = './node_modules/@d11/de-frost';
const removeData = `rm -rf ./data && rm -rf ${nodeModulesRepo}/web/data`;
const removeCommand = 'adb shell rm /sdcard/DefrostLog/userLogs.txt';
const removeCommand2 = 'adb shell rm /sdcard/DefrostLog/reactCommits.txt';
const removeCommand3 = 'adb shell rm /sdcard/DefrostLog/log.txt';

const pullLogTxt = 'adb pull /sdcard/DefrostLog/log.txt ./data/';
const pullEventsTxt = 'adb pull /sdcard/DefrostLog/userLogs.txt ./data/';
const pullChangesTxt = 'adb pull /sdcard/DefrostLog/reactCommits.txt ./data/';
const copyToWeb = `cp -r ./data ${nodeModulesRepo}/web/data`;

const intervalSeconds = 1.5;
const processedData = new Set();
const rawDataForFile = new Set();
const timestampsDump = new Set();
let flag = true;

const writeValuesInFiles = () => {
  const csv = require('fast-csv');
  const csvPath = 'data.csv';
  const pathDir = './data/';
  const fileExists = fs.existsSync(path.join(pathDir, csvPath));
  ensureDirectoryExists(pathDir);

  const framestatsPath = path.join(pathDir, `framestats_${csvPath}`);
  const filePath = path.join(pathDir, csvPath);
  const fileStream = fs.createWriteStream(filePath);
  const fileFramestatsStream = fs.createWriteStream(framestatsPath);

  const writer = csv.format({ headers: !fileExists });
  const writerFramestats = csv.format({ headers: !fileExists });

  writer.pipe(fileStream);
  writerFramestats.pipe(fileFramestatsStream).on('end', () => {});

  if (!fileExists) {
    writer.write([
      'misc',
      'input',
      'animations',
      'measure',
      'draw',
      'sync',
      'gpu',
      'timestamp',
    ]);
    writerFramestats.write([
      'Flags',
      'IntendedVsync',
      'Vsync',
      'OldestInputEvent',
      'NewestInputEvent',
      'HandleInputStart',
      'AnimationStart',
      'PerformTraversalsStart',
      'DrawStart',
      'SyncQueued',
      'SyncStart',
      'IssueDrawCommandsStart',
      'SwapBuffers',
      'FrameCompleted',
      'DequeueBufferDuration',
      'QueueBufferDuration',
      'GpuCompleted',
    ]);
  }

  for (let row of processedData) {
    writer.write(row.split(','));
  }
  for (let row of rawDataForFile) {
    writerFramestats.write(row.split(','));
  }

  writer.end();
  writerFramestats.end();
};

const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Directory '${directory}' created.`);
  } else {
    console.log(`Directory '${directory}' already exists.`);
  }
};

const frameRecording = (inputString = '') => {
  const parseFramestats = (line, validOnly = false) => {
    const framestats = line.slice(0, -1).split(',').map(Number);
    let start = 0;
    let handleInput = 0;
    let animations = 0;
    let traversals = 0;
    let draw = 0;
    let sync = 0;
    let gpu = 0;

    if (framestats.length >= 16) {
      start = (framestats[5] - framestats[1]) / 1000000;
      handleInput = (framestats[6] - framestats[5]) / 1000000;
      animations = (framestats[7] - framestats[6]) / 1000000;
      traversals = (framestats[8] - framestats[7]) / 1000000;
      draw = (framestats[10] - framestats[8]) / 1000000;
      sync = (framestats[11] - framestats[10]) / 1000000;
      gpu = (framestats[13] - framestats[11]) / 1000000;
    } else if (validOnly) {
      throw new Error('Invalid frame.');
    }

    return [
      start,
      handleInput,
      animations,
      traversals,
      draw,
      sync,
      gpu,
      framestats[1],
    ];
  };

  const decodedInputString = inputString.replace(/\\n/g, '\n');
  const profileData = decodedInputString.split('---PROFILEDATA---');
  if (profileData.length < 2) return;

  const allLines = profileData[1]
    .split('\n')
    .filter((str) => str.trim() !== '');
  allLines.forEach((line) => {
    if (line.includes('Flags')) {
      return;
    }
    const values = parseFramestats(line);
    const rawValues = line.slice(0, -1).split(',').map(Number);
    const hasNegative = values.some((x) => x < 0);

    if (!hasNegative && !timestampsDump.has(values[7] + '')) {
      timestampsDump.add(values[7] + '');
      rawDataForFile.add(rawValues.join(','));
      processedData.add(values.join(','));
    }
  });
};

const recordFrameRate = (packageName) => {
  const output = execSync(
    `adb shell dumpsys gfxinfo ${packageName} framestats`,
    {
      encoding: 'utf-8',
    }
  );
  frameRecording(output);
};

const runBashCommandInterval = (intervalSeconds) => {
  console.log('---  Record FrameRate Starting ---');
  setInterval(() => {
    try {
      if (flag) recordFrameRate(packageName);
    } catch (exception) {
      console.log('----ex', exception);
    }
  }, intervalSeconds * 1000);
};

const startTrace = () => {
  execSync('adb shell atrace --async_start -c -b 4096 sched gfx view');
};

const stopTrace = () => {
  runCommandWithExceptionHandling(
    'adb shell atrace --async_stop > ./data/my_trace.trace'
  );
};

const runCommandWithExceptionHandling = (command) => {
  try {
    execSync(command);
  } catch (exception) {
    console.log('Exception occurred while cleanup');
  }
};

const cleanUpRecord = () => {
  runCommandWithExceptionHandling(removeCommand);
  runCommandWithExceptionHandling(removeCommand2);
  runCommandWithExceptionHandling(removeCommand3);
};

const pullDocs = () => {
  runCommandWithExceptionHandling(pullLogTxt);
  runCommandWithExceptionHandling(pullEventsTxt);
  runCommandWithExceptionHandling(pullChangesTxt);
};

const moveToWebDir = () => {
  execSync(copyToWeb);
};

const exitAfterDelay = (delay) => {
  setTimeout(() => {
    console.log('Exiting the program...');
    moveToWebDir();
    process.exit(0);
  }, delay);
};

const removeDataFolderLocal = () => {
  execSync(removeData);
};

process.on('SIGINT', () => {
  console.log('Received SIGINT (Ctrl + C)');
  stopTrace();
  if (flag) writeValuesInFiles();
  flag = false;
  pullDocs();
  cleanUpRecord();
  exitAfterDelay(1000);
});
cleanUpRecord();
removeDataFolderLocal();
startTrace();
runBashCommandInterval(intervalSeconds);
