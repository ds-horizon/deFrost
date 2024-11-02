#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const args = process.argv.slice(2);
let dataPath = '';
const buildWebCommand = 'yarn web';
const webPath = path.resolve(process.cwd(), 'web/');
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-d' || args[i] === '--directory') {
    dataPath = args[i + 1];
    i++;
  }
}

if (dataPath) {
  const copyDataToWeb = `cp -r ${dataPath} ${webPath}`;
  execSync(copyDataToWeb, { stdio: 'inherit' });
}

try {
  execSync(buildWebCommand, { stdio: 'inherit' });
} catch (exc) {
  console.log('Exception - ', exc);
}
