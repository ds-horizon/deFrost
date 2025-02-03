#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let flavour = '';
let variant = 'Debug';
let oldBabelConfig = null;
let isPatchPackageInstalled = false;

function addBabelPlugin() {
  const appBabelConfigPath = path.resolve(process.cwd(), 'babel.config.js');
  const pluginPath = path.resolve(
    process.cwd(),
    'node_modules/@d11/de-frost/plugins/babel-plugin-transform-memo-component.js'
  );
  if (fs.existsSync(appBabelConfigPath)) {
    const babelConfig = require(appBabelConfigPath);
    oldBabelConfig = JSON.parse(JSON.stringify(babelConfig));
    if (!babelConfig.plugins) {
      babelConfig.plugins = [];
    }

    if (!babelConfig.plugins.some((plugin) => plugin.includes('defrost'))) {
      babelConfig.plugins.push([pluginPath]);

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
function removeBablePlugin() {
  const appBabelConfigPath = path.resolve(process.cwd(), 'babel.config.js');

  if (fs.existsSync(appBabelConfigPath)) {
    fs.writeFileSync(
      appBabelConfigPath,
      `module.exports = ${JSON.stringify(oldBabelConfig, null, 2)};\n`
    );
  } else {
    console.error('babel.config.js not found in the current directory.');
  }
}
function capitalizeFirstLetter(str) {
  if (str.length === 0) return str; // Return empty string if input is empty
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function loweCaseFirstLetter(str) {
  if (str.length === 0) return str; // Return empty string if input is empty
  return str.charAt(0).toLowerCase() + str.slice(1);
}

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

const getReactNativeVersion = () => {
  const packageJSONPath = path.resolve(process.cwd(), 'package.json');
  const packageJson = require(packageJSONPath);
  const reactNativeVersion = packageJson.dependencies['react-native'];
  return reactNativeVersion;
};

const getReactNativePatchPath = (reactNativeVersion) => {
  const reactNativeMajorVersion = +reactNativeVersion.split('.')[1];
  const patchesDirPath = path.resolve(
    process.cwd(),
    'node_modules/@d11/de-frost/src/patches'
  );
  const patchesList = fs.readdirSync(patchesDirPath);
  const patchDistance = [];
  patchesList.forEach((patch, index) => {
    const patchVersion = +patch.split('.')[1];
    patchDistance.push({
      patchName: patch,
      distance: Math.abs(patchVersion - reactNativeMajorVersion),
    });
  });
  const minimumPatchDistance = patchDistance.reduce(
    (min, item) => (item.distance <= min.distance ? item : min),
    patchDistance[0]
  );
  return path.resolve(patchesDirPath, minimumPatchDistance.patchName);
};

const moveReactNativePatch = () => {
  const rnversion = getReactNativeVersion();
  const patchLocation = getReactNativePatchPath(rnversion);
  const mainPatchLocation = path.resolve(process.cwd(), 'patches');

  if (!fs.existsSync(mainPatchLocation)) {
    execSync('mkdir patches');
  }

  execSync(`cp ${patchLocation} ${mainPatchLocation}`);
};

const createBuild = () => {
  const flavourPath = flavour ? `${loweCaseFirstLetter(flavour)}/` : '';
  const variantPath = `${loweCaseFirstLetter(variant)}`;

  const flavourAppName = flavour ? `${loweCaseFirstLetter(flavour)}-` : '';
  const variantAppName = `${loweCaseFirstLetter(variant)}`;
  const androidBuild = path.resolve(
    process.cwd(),
    `android/app/build/outputs/apk/${flavourPath}${variantPath}/app-${flavourAppName}${variantAppName}.apk`
  );
  const envVariable = `export DEFROST_ENABLE=true`;

  execSync('yarn patch-package', { stdio: 'inherit' });

  try {
    execSync(
      `cd android && ${envVariable} && ./gradlew app:assemble${flavour}${variant} && cd ..`,
      { stdio: 'inherit' }
    );
  } catch (e) {
    console.log('-----------------e', e);
  }

  try {
    execSync('mkdir ff_apks');
  } catch (ex) {
    console.log('ff_apks already exists');
  }

  execSync(`cp ${androidBuild} ff_apks`);
};

const cleanUp = () => {
  const envVariable = `export DEFROST_ENABLE=false`;
  removeBablePlugin();
  const removeRNNodeModules = `rm -rf node_modules/react-native`;
  execSync(removeRNNodeModules);
  if (!isPatchPackageInstalled) {
    try {
      execSync('yarn remove patch-package', { stdio: 'inherit' });
      execSync('rm -rf patches');
    } catch (error) {}
  } else {
    execSync('rm -rf patches/react-native+0.72.5.patch');
  }
  execSync('yarn install --ignore-scripts --prefer-offline', {
    stdio: 'inherit',
  });
  execSync(envVariable);
};

const configureAndBuildProject = (flavourLocal, variantLocal) => {
  try {
    flavour = capitalizeFirstLetter(flavourLocal);
    variant = capitalizeFirstLetter(variantLocal);
    console.log(
      '-----------------Checking and Installing PatchPackage: Start -------------'
    );
    checkAndInstallPatchPackage();
    console.log(
      '-----------------Checking and Installing PatchPackage: Done -------------'
    );
    console.log('-----------------Applying RN Patch: Start -------------');
    moveReactNativePatch();
    console.log('-----------------Applying RN Patch: Done -------------');
    console.log(
      '-----------------Applying Babel Plugin for memo: Start -------------'
    );
    addBabelPlugin();
    console.log(
      '-----------------Applying Babel Plugin for memo: Done -------------'
    );
    console.log('-----------------Creating the build: Start -------------');
    createBuild();
    console.log('-----------------Creating the build: Done -------------');
  } catch (ex) {}
  cleanUp();
};
module.exports = { configureAndBuildProject };
