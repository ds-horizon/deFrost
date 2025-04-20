const adb = require('adbkit');
const inquirer = require('inquirer').default;

const client = adb.createClient();

// Function to get the list of connected devices
async function getConnectedDevices() {
  try {
    const devices = await client.listDevices();
    return devices;
  } catch (err) {
    console.error('Error listing devices:', err);
    return [];
  }
}

// Function to prompt user to select a device from the list
function selectDevice(devices) {
  return inquirer.prompt([
    {
      type: 'list',
      name: 'selectedDevice',
      message: 'Please select an ADB device:',
      choices: devices,
    },
  ]);
}

// Main function to check devices and perform the task
async function getSelectedID() {
  const devices = await getConnectedDevices();

  if (devices.length === 0) {
    console.log('No devices connected.');
    return;
  }

  let selectedDeviceId;
  if (devices.length === 1) {
    // If only one device is connected, automatically select it
    selectedDeviceId = devices[0].id;
    console.log('Only one device connected:', selectedDeviceId);
  } else {
    // If multiple devices are connected, prompt the user to select one
    const { selectedDevice } = await selectDevice(
      devices.map((device) => device.id)
    );
    selectedDeviceId = selectedDevice;
    console.log('You selected device:', selectedDeviceId);
  }
  return selectedDeviceId;
}
module.exports = { getSelectedID };
