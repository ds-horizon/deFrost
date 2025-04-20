#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function checkAndRemovePatch() {
  const patchPath = path.resolve(process.cwd(), 'patches/');
  const patchesList = fs.readdirSync(patchPath);
  const reactNativePatch = patchesList.filter((singlePatch) => {
    return singlePatch.includes('react-native+');
  });
  if (reactNativePatch.length > 0) {
    if (patchesList.length > 0) {
      execSync('rm -rf patches');
    } else {
      execSync(`rm -rf patches/${reactNativePatch[0]}`);
    }
  }
}

function cleanNodeModules() {
  execSync(`rm -rf node_modules && yarn`);
}

function removeBabelPlugin() {
  const appBabelConfigPath = path.resolve(process.cwd(), 'babel.config.js');
  const pluginPath = path.resolve(
    process.cwd(),
    'node_modules/@d11/de-frost/plugins/babel-plugin-transform-memo-component.js'
  );
  if (fs.existsSync(appBabelConfigPath)) {
    const babelConfig = require(appBabelConfigPath);
    if (!babelConfig.plugins) {
      return;
    }

    if (JSON.stringify(babelConfig.plugins).includes(pluginPath)) {
      babelConfig.plugins.forEach((element, index) => {
        if (JSON.stringify(element).includes(pluginPath)) {
          babelConfig.plugins.splice(index, 1);
        }
      });

      fs.writeFileSync(
        appBabelConfigPath,
        `module.exports = ${JSON.stringify(babelConfig, null, 2)};\n`
      );
      console.log('Custom Babel plugin added to babel.config.js');
    } else {
      console.log('Custom Babel plugin is already applied.');
    }
  } else {
    console.error('babel.config.js not found in the current directory.');
  }
}

function cleanUpPackage() {
  checkAndRemovePatch();
  cleanNodeModules();
  removeBabelPlugin();
}
module.exports = { cleanUpPackage };
