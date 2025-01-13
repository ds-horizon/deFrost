#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const runCommandWithOutput = (command) => {
  execSync(command, { stdio: 'inherit' });
};
const folderPath = path.resolve(
  process.cwd(),
  'node_modules/@d11/de-frost/web'
);
let dataPath = '';
const buildWebCommand = `cd ${folderPath} && npx http-server -c-1`;
const webPath = path.resolve(folderPath, 'data/');
const removeOldData = `rm -rf ${webPath}`;
const setupAndBuildWeb = (directoryLocal) => {
  dataPath = directoryLocal;
  if (dataPath) {
    const copyDataToWeb = `cp -r ${dataPath} ${webPath}`;
    runCommandWithOutput(removeOldData);
    runCommandWithOutput(copyDataToWeb);
  }

  try {
    runCommandWithOutput(buildWebCommand);
  } catch (exc) {
    console.log('Exception - ', exc);
  }
};
module.exports = { setupAndBuildWeb };
