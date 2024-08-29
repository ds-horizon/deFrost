#!/usr/bin/env ts-node

const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
function checkRowExistence(csvFile: string, rowToCheck: number[]): boolean {
  console.log('row_to_check');
  console.log(rowToCheck);
  const strList = rowToCheck.map(String);
  if (!fs.existsSync(csvFile)) {
    return false;
  }
  const file = fs.readFileSync(csvFile, 'utf-8');
  const rows = file.split('\n').map((row: any) => row.split(','));
  return rows.some(
    (row: any) => JSON.stringify(row) === JSON.stringify(strList)
  );
}

function ensureDirectoryExists(directory: string): void {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
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
    sync = ((framestats[11] as number) - (framestats[10] as number)) / 1000000;
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

// Globals
let hasHeader = false;
let inProfileSection = true;
let inActivity = false;
let inTable = false;
let inFramestats = false;
const csvPath = 'data.csv';
const pathDir = './data/';
let gfxinfo: string[] = [];
let framestats: string[] = [];

let numCols = 0;

const inputString = process.argv[2] || '';

const decodedInputString = inputString.replace(/\\n/g, '\n');
const profileData = inputString.split('---PROFILEDATA---');

if (profileData.length < 2) process.exit(0);

// console.log('----------------profileData?.[1]', profileData?.[1]);

const allLines =
  profileData?.[1]?.split('\n').filter((str) => str.trim() !== '') || [];
framestats = allLines;
const fileExists = fs.existsSync(path.join(pathDir, csvPath));
ensureDirectoryExists(pathDir);

const framestatsPath = path.join(pathDir, `framestats_${csvPath}`);
const filePath = path.join(pathDir, csvPath);

const fileStream = fs.createWriteStream(filePath, { flags: 'a' });
const fileFramestatsStream = fs.createWriteStream(framestatsPath, {
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
