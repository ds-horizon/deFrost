#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const dataPath = process.argv[2] || '';
const buildWebCommand = 'yarn web';
const webPath = path.resolve(process.cwd(), 'web/');

if (dataPath) {
  const copyDataToWeb = `cp -r ${dataPath} ${webPath}`;
  execSync(copyDataToWeb);
}

try {
  execSync(buildWebCommand);
} catch (exc) {
  console.log('Exception - ', exc);
}
