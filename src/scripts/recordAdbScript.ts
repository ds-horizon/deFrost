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

const intervalSeconds = 1.5;
const processedData = new Set<string>();
const rawDataForFile = new Set<string>();
const timestampsDump = new Set<string>();
const fsFilerData = require('fs');
let flag = true;
const writeValuesInFiles = () => {
  const csv = require('fast-csv');
  const pathFilterData = path;
  const csvPath = 'data.csv';
  const pathDir = './data/';
  const fileExists = fsFilerData.existsSync(
    pathFilterData.join(pathDir, csvPath)
  );
  ensureDirectoryExists(pathDir);

  const framestatsPath = pathFilterData.join(pathDir, `framestats_${csvPath}`);
  const filePath = pathFilterData.join(pathDir, csvPath);
  const fileStream = fsFilerData.createWriteStream(filePath);
  const fileFramestatsStream = fsFilerData.createWriteStream(framestatsPath);

  const writer = csv.format({
    headers: !fileExists,
  });
  const writerFramestats = csv.format({
    headers: !fileExists,
  });

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
    console.log('--------------row1', row);
    writer.write(row.split(','));
  }
  for (let row of rawDataForFile) {
    console.log('--------------row2', row);
    writerFramestats.write(row.split(','));
  }
  writer.end();
  writerFramestats.end();
};
function ensureDirectoryExists(directory: string): void {
  if (!fsFilerData.existsSync(directory)) {
    fsFilerData.mkdirSync(directory, { recursive: true });
    console.log(`Directory '${directory}' created.`);
  } else {
    console.log(`Directory '${directory}' already exists.`);
  }
}
const frameRecording = (inputString: string = '') => {
  // function checkRowExistence(csvFile: string, rowToCheck: number[]): boolean {
  //   const strList = rowToCheck.map(String);
  //   if (!fsFilerData.existsSync(csvFile)) {
  //     return false;
  //   }
  //   const file = fsFilerData.readFileSync(csvFile, 'utf-8');
  //   const rows = file.split('\n').map((row: any) => row.split(','));
  //   return rows.some((row: any) => {
  //     console.log('---------------checkRowExistance1', row.join(','));
  //     console.log('---------------checkRowExistance2', strList.join(','));
  //     return row.join(',').slice(0, -1) === strList.join(',');
  //   });
  // }

  function parseFramestats(line: string, validOnly = false): number[] {
    const framestats = line.slice(0, -1).split(',').map(Number) as number[];

    let start = 0;
    let handleInput = 0;
    let animations = 0;
    let traversals = 0;
    let draw = 0;
    let sync = 0;
    let gpu = 0;

    if (framestats.length >= 16) {
      start = ((framestats[5] as number) - (framestats[1] as number)) / 1000000;
      handleInput =
        ((framestats[6] as number) - (framestats[5] as number)) / 1000000;
      animations =
        ((framestats[7] as number) - (framestats[6] as number)) / 1000000;
      traversals =
        ((framestats[8] as number) - (framestats[7] as number)) / 1000000;
      draw = ((framestats[10] as number) - (framestats[8] as number)) / 1000000;
      sync =
        ((framestats[11] as number) - (framestats[10] as number)) / 1000000;
      gpu = ((framestats[13] as number) - (framestats[11] as number)) / 1000000;
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
      framestats[1] as number,
    ];
  }

  let framestats: string[] = [];

  // const inputString = rawInput.replace(/\n/g, '\\n');
  const decodedInputString = inputString.replace(/\\n/g, '\n');
  const profileData = decodedInputString.split('---PROFILEDATA---');
  if (profileData.length < 2) return;

  const allLines =
    profileData?.[1]?.split('\n').filter((str) => str.trim() !== '') || [];
  framestats = allLines;
  framestats.forEach((line) => {
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

const recordFrameRate = (packageName: string) => {
  const output = execSync(
    `adb shell dumpsys gfxinfo ${packageName} framestats`,
    {
      encoding: 'utf-8',
    }
  );
  frameRecording(output);
};

const runBashCommandInterval = (intervalSeconds: number) => {
  console.log('---  Record FrameRate Starting ---');
  setInterval(() => {
    try {
      if (flag) recordFrameRate(packageName);
    } catch (exception: any) {
      console.log('----ex', exception);
    }
  }, intervalSeconds * 1000);
};

const startTrace = () => {
  execSync('adb shell atrace --async_start -c -b 4096 sched gfx view');
};

const stopTrace = () => {
  runCommandWithExceptionHadling(
    'adb shell atrace --async_stop > ./data/my_trace.trace'
  );
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
  runCommandWithExceptionHadling(pullLogTxt);
  runCommandWithExceptionHadling(pullEventsTxt);
  runCommandWithExceptionHadling(pullChangesTxt);
};

const moveToWebDir = () => {
  execSync(copyToWeb);
};
const exitAfterDelay = (delay: number) => {
  setTimeout(() => {
    console.log('Exiting the program...');
    moveToWebDir();
    process.exit(0);
  }, delay);
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
startTrace();
runBashCommandInterval(intervalSeconds);
