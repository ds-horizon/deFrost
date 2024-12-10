#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const runCommandWithOutput = (command) => {
  execSync(command, { stdio: 'inherit' });
};
const args = process.argv.slice(2);
const folderPath = path.resolve(
  process.cwd(),
  'node_modules/@d11/de-frost/web'
);
let dataPath = '';
const buildWebCommand = `cd ${folderPath} && npx http-server`;

const webPath = path.resolve(folderPath, 'web/');
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-d' || args[i] === '--directory') {
    dataPath = args[i + 1];
    i++;
  }
}

if (dataPath) {
  const copyDataToWeb = `cp -r ${dataPath} ${webPath}`;
  runCommandWithOutput(copyDataToWeb, { stdio: 'inherit' });
}

try {
  runCommandWithOutput(buildWebCommand, { stdio: 'inherit' });
} catch (exc) {
  console.log('Exception - ', exc);
}
