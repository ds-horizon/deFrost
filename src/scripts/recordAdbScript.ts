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

const frameRecording = (inputString: string = '') => {
  const fsFilerData = require('fs');
  const pathFilterData = path;
  const csv = require('fast-csv');

  function checkRowExistence(csvFile: string, rowToCheck: number[]): boolean {
    console.log('row_to_check');
    console.log(rowToCheck);
    const strList = rowToCheck.map(String);
    if (!fsFilerData.existsSync(csvFile)) {
      return false;
    }
    const file = fsFilerData.readFileSync(csvFile, 'utf-8');
    const rows = file.split('\n').map((row: any) => row.split(','));
    return rows.some(
      (row: any) => JSON.stringify(row) === JSON.stringify(strList)
    );
  }

  function ensureDirectoryExists(directory: string): void {
    if (!fsFilerData.existsSync(directory)) {
      fsFilerData.mkdirSync(directory, { recursive: true });
      console.log(`Directory '${directory}' created.`);
    } else {
      console.log(`Directory '${directory}' already exists.`);
    }
  }

  function parseFramestats(line: string, validOnly = false): number[] {
    const framestats = line.slice(0, -1).split(',').map(Number) as number[];

    let start = 0;
    let handleInput = 0;
    let animations = 0;
    let traversals = 0;
    let draw = 0;
    let sync = 0;
    let gpu = 0;

    if (framestats.length === 17) {
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

  const csvPath = 'data.csv';
  const pathDir = './data/';
  let framestats: string[] = [];

  // const inputString = rawInput.replace(/\n/g, '\\n');
  const decodedInputString = inputString.replace(/\\n/g, '\n');
  const profileData = decodedInputString.split('---PROFILEDATA---');

  if (profileData.length < 2) process.exit(0);

  console.log('----------------profileData?.[1]', profileData?.[1]);

  const allLines =
    profileData?.[1]?.split('\n').filter((str) => str.trim() !== '') || [];
  framestats = allLines;
  console.log('-----------------------allLines', allLines);
  const fileExists = fsFilerData.existsSync(
    pathFilterData.join(pathDir, csvPath)
  );
  ensureDirectoryExists(pathDir);

  const framestatsPath = pathFilterData.join(pathDir, `framestats_${csvPath}`);
  const filePath = pathFilterData.join(pathDir, csvPath);
  console.log('------------reached Here 1');
  const fileStream = fsFilerData.createWriteStream(filePath, { flags: 'a' });
  const fileFramestatsStream = fsFilerData.createWriteStream(framestatsPath, {
    flags: 'a',
  });

  const writer = csv.format({ headers: !fileExists });
  const writerFramestats = csv.format({ headers: !fileExists });

  writer.pipe(fileStream);
  writerFramestats.pipe(fileFramestatsStream);

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
  console.log('------------reached Here 2', framestats.length);
  framestats.forEach((line) => {
    if (line.includes('Flags')) {
      return;
    }
    const values = parseFramestats(line);
    const rawValues = line.slice(0, -1).split(',').map(Number);
    const hasNegative = values.some((x) => x < 0);

    if (!checkRowExistence(framestatsPath, rawValues) && !hasNegative) {
      writer.write(values);
      writerFramestats.write(rawValues);
    }
  });

  writer.end();
  writerFramestats.end();
};

const recordFrameRate = (packageName: string) => {
  console.log('---------record Frames 1');
  const output = execSync(
    `adb shell dumpsys gfxinfo ${packageName} framestats`,
    {
      encoding: 'utf-8',
    }
  );
  console.log('---------record Frames 2');
  // const scriptPath = path.resolve(process.cwd(), 'src/scripts/filterData.ts');
  console.log('---------record Frames 3');
  frameRecording(output);
  console.log('---------record Frames 4');
};

const runBashCommandInterval = (intervalSeconds: number) => {
  console.log('---  Record FrameRate Starting ---');
  setInterval(() => {
    try {
      recordFrameRate(packageName);
    } catch (exception: any) {
      console.log('----ex', exception.stdout);
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
  runCommandWithExceptionHadling(pullLogTxt);
  runCommandWithExceptionHadling(pullEventsTxt);
  runCommandWithExceptionHadling(pullChangesTxt);
};

const moveToWebDir = () => {
  execSync(copyToWeb);
};
process.on('SIGINT', () => {
  console.log('Received SIGINT (Ctrl + C)');
  pullDocs();
  stopTrace();
  cleanUpRecord();
  moveToWebDir();
  process.exit(0); // Exit with a success code
});
startTrace();
runBashCommandInterval(intervalSeconds);
