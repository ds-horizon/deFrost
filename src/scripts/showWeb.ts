#!/usr/bin/env ts-node

const { execSync: execSyncWeb } = require('child_process');
const pathWeb = require('path');

const dataPath = process.argv[2] || '';
const buildWebCommand = 'yarn web';
const webPath = pathWeb.resolve(process.cwd(), 'web/');
if (dataPath) {
  const copyDataToWeb = `cp -r ${dataPath} ${webPath}`;
  execSyncWeb(copyDataToWeb);
}
try {
  execSyncWeb(buildWebCommand);
} catch (exc) {
  console.log('Exception - ', exc);
}
