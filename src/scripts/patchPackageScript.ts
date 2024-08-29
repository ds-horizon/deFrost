#!/usr/bin/env ts-node
// import fs from 'fs';
// import path from 'path';
// import { execSync } from 'child_process';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let isPatchPackageInstalled = false;
const checkAndInstallPatchPackage = () => {
  const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');
  const packageJsonPath = path.resolve(process.cwd(), 'package.json');
  const hasPatchPackage = fs.existsSync(
    path.join(nodeModulesPath, 'patch-package')
  );

  if (!hasPatchPackage) {
    console.log('patch-package is not installed. Installing...');

    if (!fs.existsSync(packageJsonPath)) {
      console.error('package.json not found. Are you in a Node.js project?');
      return false;
    }

    try {
      execSync('yarn add patch-package', { stdio: 'inherit' });
      console.log('patch-package has been installed.');
      return true;
    } catch (error) {
      console.error('Error installing patch-package:', error);
      return false;
    }
  } else {
    isPatchPackageInstalled = true;
    console.log('patch-package is already installed.');
    return true;
  }
};

const moveReactNativePatch = () => {
  const nodeModulesPath = path.resolve(process.cwd(), 'node_modules');
  const patchLocation = path.resolve(
    nodeModulesPath,
    '@sarthak-d11/de-frost/src/patches_to_ship/react-native+0.72.5.patch'
  );
  const mainPatchLocation = path.resolve(process.cwd(), 'patches');
  if (!fs.existsSync(mainPatchLocation)) {
    execSync('mkdir patches');
  }
  execSync(`cp ${patchLocation} ${mainPatchLocation}`);
};

const createBuild = () => {
  const androidBuild = path.resolve(
    process.cwd(),
    'android/app/build/outputs/apk/release/app-release.apk'
  );
  execSync('yarn');
  execSync('cd android && ./gradlew app:assembleProStagingDebug && cd ..');
  execSync('mkdir ff_apks');
  execSync(`cp ${androidBuild} ff_apks`);
};

const cleanUp = () => {
  if (!isPatchPackageInstalled) {
    try {
      execSync('yarn remove patch-package', { stdio: 'inherit' });
      execSync('rm -rf patches');
    } catch (error) {}
  } else {
    execSync('rm -rf patches/react-native+0.72.5.patch');
  }
};

checkAndInstallPatchPackage();
moveReactNativePatch();
createBuild();
cleanUp();
