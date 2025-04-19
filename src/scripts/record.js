#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
let packageName = 'com.app.dream11staging';

const port = 3001;

const adbReverseCommand = `adb reverse tcp:${port} tcp:${port}`;

const nodeModulesRepo = './node_modules/@d11/de-frost';
const serverPath = `${nodeModulesRepo}/src/scripts/record/reactCommitsAndUserLogs.js`;
const removeData = `rm -rf ./data && rm -rf ${nodeModulesRepo}/web/data`;
const removeCommand = 'adb shell rm /sdcard/DefrostLog/userLogs.txt';
const removeCommand2 = 'adb shell rm /sdcard/DefrostLog/reactCommits.txt';

const pullEventsTxt = 'adb pull /sdcard/DefrostLog/userLogs.txt ./data/';
const pullChangesTxt = 'adb pull /sdcard/DefrostLog/reactCommits.txt ./data/';
const copyToWeb = `cp -r ./data ${nodeModulesRepo}/web/data`;

const intervalSeconds = 1.5;
const processedData = new Set();
const rawDataForFile = new Set();
const timestampsDump = new Set();
let flag = true;
let framestatsHeaderIndexes = {};
const dataCsvHeader = [
  'misc',
  'input',
  'animations',
  'measure',
  'draw',
  'sync',
  'gpu',
  'timestamp',
];
const FrameStatsHeader = Object.freeze({
  Flags: 'Flags',
  IntendedVsync: 'IntendedVsync',
  Vsync: 'Vsync',
  OldestInputEvent: 'OldestInputEvent',
  NewestInputEvent: 'NewestInputEvent',
  HandleInputStart: 'HandleInputStart',
  AnimationStart: 'AnimationStart',
  PerformTraversalsStart: 'PerformTraversalsStart',
  DrawStart: 'DrawStart',
  SyncQueued: 'SyncQueued',
  SyncStart: 'SyncStart',
  IssueDrawCommandsStart: 'IssueDrawCommandsStart',
  SwapBuffers: 'SwapBuffers',
  FrameCompleted: 'FrameCompleted',
  DequeueBufferDuration: 'DequeueBufferDuration',
  QueueBufferDuration: 'QueueBufferDuration',
  GpuCompleted: 'GpuCompleted',
});

const framestatsHeader = [...Object.keys(FrameStatsHeader)];
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
    writer.write(dataCsvHeader);
    writerFramestats.write(framestatsHeader);
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

const insertFrameStatsHeaderIndexes = (line) => {
  if (Object.keys(framestatsHeaderIndexes).length > 0) return;
  const deviceFrameStatsHeader = line
    .replaceAll(' ', '')
    .split(',')
    .filter((str) => str !== '');
  framestatsHeader.map((value, index) => {
    const newIndex = deviceFrameStatsHeader.indexOf(value);
    if (newIndex != -1) {
      framestatsHeaderIndexes[value] = newIndex;
    } else {
      console.log('-------------value', value);
    }
  });
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
      start =
        (framestats[framestatsHeaderIndexes.HandleInputStart] -
          framestats[framestatsHeaderIndexes.IntendedVsync]) /
        1000000;
      handleInput =
        (framestats[framestatsHeaderIndexes.AnimationStart] -
          framestats[framestatsHeaderIndexes.HandleInputStart]) /
        1000000;
      animations =
        (framestats[framestatsHeaderIndexes.PerformTraversalsStart] -
          framestats[framestatsHeaderIndexes.AnimationStart]) /
        1000000;
      traversals =
        (framestats[framestatsHeaderIndexes.DrawStart] -
          framestats[framestatsHeaderIndexes.PerformTraversalsStart]) /
        1000000;
      draw =
        (framestats[framestatsHeaderIndexes.SyncStart] -
          framestats[framestatsHeaderIndexes.DrawStart]) /
        1000000;
      sync =
        (framestats[framestatsHeaderIndexes.IssueDrawCommandsStart] -
          framestats[framestatsHeaderIndexes.SyncStart]) /
        1000000;
      gpu =
        (framestats[framestatsHeaderIndexes.FrameCompleted] -
          framestats[framestatsHeaderIndexes.IssueDrawCommandsStart]) /
        1000000;
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
      insertFrameStatsHeaderIndexes(line);
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
};

const pullDocs = () => {
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

const startNetworkWorker = () => {
  runCommandWithExceptionHandling(adbReverseCommand);
  const { Worker } = require('worker_threads');
  const worker = new Worker(serverPath);
  worker.on('message', (message) => {
    console.log('Worker:', message);
  });
  return worker;
};

const collectAndAnalyzePerformanceData = (packageNameLocal) => {
  packageName = packageNameLocal;
  const worker = startNetworkWorker();
  process.on('SIGINT', () => {
    console.log('Received SIGINT (Ctrl + C)');
    stopTrace();
    worker.terminate();
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
};

module.exports = { collectAndAnalyzePerformanceData };
collectAndAnalyzePerformanceData('com.app.dream11staging');
