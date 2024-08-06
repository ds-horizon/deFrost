#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';

function checkRowExistence(csvFile: string, rowToCheck: number[]): boolean {
  console.log('row_to_check');
  console.log(rowToCheck);
  const strList = rowToCheck.map(String);
  if (!fs.existsSync(csvFile)) {
    return false;
  }
  const file = fs.readFileSync(csvFile, 'utf-8');
  const rows = file.split('\n').map((row) => row.split(','));
  return rows.some((row) => JSON.stringify(row) === JSON.stringify(strList));
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
let inProfileSection = false;
let inActivity = false;
let inTable = false;
let inFramestats = false;
const csvPath = 'data.csv';
const pathDir = './data/';
let gfxinfo: string[] = [];
let framestats: string[] = [];

let numCols = 0;

const inputString = process.argv[2] || '';

const allLines = inputString.split('\n');

for (const line of allLines) {
  const strippedLine = line.trim();

  if (inProfileSection) {
    if (strippedLine === 'View hierarchy:') {
      inProfileSection = false;
      inActivity = false;
      inTable = false;

      if (gfxinfo.length === 0 && framestats.length > 0) {
        if (!hasHeader) {
          console.log(
            'misc',
            'input',
            'animations',
            'measure',
            'draw',
            'sync',
            'gpu',
            'timestamp'
          );
          hasHeader = true;
        }

        framestats.forEach((frame) => console.log(...parseFramestats(frame)));
      } else if (gfxinfo.length > 0 && framestats.length === 0) {
        if (!hasHeader) {
          if ((gfxinfo[0] as string).split('\t').length === 3) {
            console.log('draw', 'execute', 'process');
          } else if ((gfxinfo[0] as string).split('\t').length === 4) {
            console.log('draw', 'prepare', 'execute', 'process');
          }
          hasHeader = true;
        }

        gfxinfo.forEach((info) => console.log(info));
      } else if (gfxinfo.length > 0 && gfxinfo.length === framestats.length) {
        if (!hasHeader) {
          console.log(
            'misc',
            'input',
            'animations',
            'measure',
            'draw',
            'sync',
            'execute',
            'process'
          );
          hasHeader = true;
        }

        gfxinfo.forEach((gfx, index) => {
          try {
            const cpu = framestats[index];
            console.log(
              ...parseFramestats(cpu ?? '')
                .slice(0, -2)
                .concat(gfx.split('\t').slice(-3).map(Number))
            );
          } catch (e) {
            console.log(...[0, 0, 0, 0].concat(gfx.split('\t').map(Number)));
          }
        });
      }

      gfxinfo = [];
    } else {
      if (strippedLine.includes('/') && strippedLine.split('/').length === 3) {
        if (inActivity) {
          inActivity = false;
        } else if (
          strippedLine.includes('visibility=') ||
          !strippedLine.includes('visibility')
        ) {
          inActivity = true;
        }
      } else if (inActivity) {
        const tableCols = strippedLine.split('\t').length;

        if (
          inTable &&
          tableCols === numCols &&
          !strippedLine.includes('Execute')
        ) {
          gfxinfo.push(strippedLine);
        } else if (strippedLine.includes('Execute')) {
          inTable = true;
          numCols = tableCols;
        } else if (strippedLine === '---PROFILEDATA---') {
          inFramestats = !inFramestats;
        } else if (inFramestats && !strippedLine.includes('Flags')) {
          framestats.push(strippedLine);
        }
      }
    }
  } else if (strippedLine === 'Profile data in ms:') {
    inProfileSection = true;
  }
}

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
