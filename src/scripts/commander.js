#!/usr/bin/env node
const { Command } = require('commander');
const path = require('path');
const scriptsPath = path.resolve(
  process.cwd(),
  'node_modules/@d11/de-frost/src/scripts/'
);
const createBuild = require(path.resolve(scriptsPath, 'createBuild.js'));
const record = require(path.resolve(scriptsPath, 'record.js'));
const showWeb = require(path.resolve(scriptsPath, 'showDashboard.js'));

const program = new Command();

program
  .name('@d11/defrost') // Name of the package
  .version('0.1.1') // Version of the package
  .description(
    'A powerful npm package to detect and analyze frozen frames in mobile applications. Includes tools for extracting frozen frame data, recording React commit information, and visualizing the data in a web dashboard.'
  );

program
  .command('create-build')
  .description(
    'Create a build with React commit data tracking for the specified APK flavour and variant'
  )
  .option(
    '-f, --flavour <flavour>',
    'Specify the flavour of the APK (e.g., staging, prod)',
    ''
  )
  .option(
    '-v, --variant <variant>',
    'Specify the variant of the APK (e.g., debug, release)',
    'debug'
  )
  .action((cmdObj) => {
    const { flavour, variant } = cmdObj;

    if (!flavour) {
      console.log('Creating APK with default flavour (empty string)');
    }
    console.log(
      `Creating build with flavour: ${flavour} and variant: ${variant}`
    );
    createBuild.configureAndBuildProject(flavour, variant);
  });

program
  .command('record')
  .description('Record frame and React commit data from the connected device')
  .option(
    '-p, --package-name <package-name>',
    'The package name of the app to record data from (e.g., com.example.myapp)',
    ''
  )
  .action((cmdObj) => {
    const { packageName } = cmdObj;
    if (!packageName) {
      console.error('Error: --packageName is required.');
      process.exit(1);
    }
    console.log(`Recording data for package: ${packageName}`);
    record.collectAndAnalyzePerformanceData(packageName);
  });

program
  .command('show-dashboard')
  .description(
    'Show the web dashboard to visualize the recorded frame and React commit data'
  )
  .option(
    '-d, --directory <directory>',
    'The directory containing the recorded data (e.g., ./data)',
    './data'
  )
  .action((cmdObj) => {
    const { directory } = cmdObj;
    console.log(`Opening web dashboard for data in directory: ${directory}`);
    showWeb.setupAndBuildWeb(directory);
  });

program.parse(process.argv);
