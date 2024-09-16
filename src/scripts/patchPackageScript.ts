#!/usr/bin/env ts-node
// import fs from 'fs';
// import path from 'path';
// import { execSync } from 'child_process';

const fsPatchPackage = require('fs');
const pathPatchPackage = require('path');
const { execSync: execSyncPatchPackage } = require('child_process');

let isPatchPackageInstalled = false;
const checkAndInstallPatchPackage = () => {
  const nodeModulesPath = pathPatchPackage.resolve(
    process.cwd(),
    'node_modules'
  );
  const packageJsonPath = pathPatchPackage.resolve(
    process.cwd(),
    'package.json'
  );
  const hasPatchPackage = fsPatchPackage.existsSync(
    pathPatchPackage.join(nodeModulesPath, 'patch-package')
  );

  if (!hasPatchPackage) {
    console.log('patch-package is not installed. Installing...');

    if (!fsPatchPackage.existsSync(packageJsonPath)) {
      console.error('package.json not found. Are you in a Node.js project?');
      return false;
    }

    try {
      execSyncPatchPackage('yarn add patch-package', { stdio: 'inherit' });
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
  const nodeModulesPath = pathPatchPackage.resolve(
    process.cwd(),
    'node_modules'
  );
  const patchLocation = pathPatchPackage.resolve(
    nodeModulesPath,
    '@sarthak-d11/de-frost/src/patches_to_ship/react-native+0.72.5.patch'
  );
  const mainPatchLocation = pathPatchPackage.resolve(process.cwd(), 'patches');
  if (!fsPatchPackage.existsSync(mainPatchLocation)) {
    execSyncPatchPackage('mkdir patches');
  }
  execSyncPatchPackage(`cp ${patchLocation} ${mainPatchLocation}`);
};

const createBuild = () => {
  const androidBuild = pathPatchPackage.resolve(
    process.cwd(),
    'android/app/build/outputs/apk/release/app-release.apk'
  );
  const envVariable = `export DEFROST_ENABLE=true`;
  execSyncPatchPackage('yarn');

  execSyncPatchPackage(
    `cd android && ${envVariable} &&./gradlew app:assembleProStagingRelease && cd ..`
  );
  execSyncPatchPackage('mkdir ff_apks');
  execSyncPatchPackage(`cp ${androidBuild} ff_apks`);
};

const cleanUp = () => {
  if (!isPatchPackageInstalled) {
    try {
      execSyncPatchPackage('yarn remove patch-package', { stdio: 'inherit' });
      execSyncPatchPackage('rm -rf patches');
    } catch (error) {}
  } else {
    execSyncPatchPackage('rm -rf patches/react-native+0.72.5.patch');
  }
};

checkAndInstallPatchPackage();
moveReactNativePatch();
createBuild();
cleanUp();
