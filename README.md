# @d11/defrost

A powerful npm package to help you detect and analyze frozen frames in your mobile application. This package provides tools for extracting frozen frame data, recording React commit information, and visualizing the data in an interactive dashboard. Visit https://defrost.dreamsportslabs.com/ for more details

## Features

- **Frame Extraction**: Extracts frozen frame data during your mobile app's runtime.
- **React Commit Tracking**: Tracks React commit data for each rendered frame.
- **Data Recording**: Records frame data and React information in CSV format.
- **Visualization Dashboard**: View all extracted data in a comprehensive web dashboard.

## Installation

To install the package, use npm or yarn:

```sh
npm install @d11/de-frost
# or
yarn add @d11/de-frost
```

## Setup


### 1. Enable USB Debugging

- Go to **Settings** on your Android device.
- Scroll down to **About phone**.
- Tap **Build number** 7 times to enable Developer options.
- Go back to **Settings** and tap on **Developer options**.
- Enable **USB debugging**.

### 2. Enable "Profile HWUI Rendering"

In order to collect accurate frame rendering data, enable the "Profile HWUI Rendering" option in Developer Options:

- Go to **Settings** on your Android device.
- Scroll down and tap on **Developer options**.
- Locate and enable **Profile HWUI Rendering**.
- A pop-up window will appear with three options:
  - **Off**
  - **Screenbars**
  - `adb shell dumpsys gfxinfo`
- Select `adb shell dumpsys gfxinfo`.

This ensures your device captures detailed frame statistics, which will be used by the package for analysis.

### 3. Verify ADB Connection

- Connect your Android device to your laptop via USB.
- Open a terminal and verify that your device is recognized by ADB:

```sh
adb devices
```

If your device is listed, you're good to go.

## Commands

### 1. `yarn de-frost create-build`

This command prepares the APK with the necessary code to report React commit data. It takes two parameters:

- `-f`: The flavor of the APK (e.g., `staging` or `prod`). Default: `""`
- `-v`: The variant of the APK (e.g., `debug`, `release`, etc.). Default: `"debug"`

**Usage**:

```sh
yarn de-frost create-build -f <flavor> -v <variant>
```

This will:

- Add the code for reporting React commits.
- Generate the APK and store it in a folder named `ff-build` in your project directory.

### 2. `yarn de-frost record`

This command records the frame data from the APK running on your connected device and extracts React commit information. It will dump the data as a CSV file in the `data` folder on your laptop.

You need to connect your mobile device to your laptop using ADB (Android Debug Bridge).

**Usage**:

```sh
yarn de-frost record -p <package-name>
```

Where:

- `-p`: The package name of the app you want to record data from (e.g., `com.example.myapp`). Default value: `""`.

### 3. `yarn de-frost show-dashboard`

This command opens a web dashboard where you can visualize the frame data and React commit information. You need to specify the location of the data folder where the recorded data is stored.

**Usage**:

```sh
yarn de-frost show-dashboard -d <data-folder-location>
```

Where:

- `-d`: The directory where the frame data and React information have been dumped (the data folder). Default value: `"./data"`.

## Workflow Overview

The purpose of this npm package, `@d11/defrost`, is to help you **detect and analyze frozen frames** in your mobile application. This package is divided into two main parts: **extraction of frozen frame data** and **visualization** of that data.

### Step 1: Prepare the APK with the Necessary Code (`yarn de-frost create-build`)

The first step is to **add code to your APK that can report React commit data**, which is essential for detecting frozen frames. This is achieved by running the following command:

```sh
yarn de-frost create-build -f <flavor> -v <variant>
```

- `-f`: Specifies the flavor of the APK (e.g., `staging`, `prod`, etc.).
- `-v`: Specifies the variant of the APK (e.g., `debug`, `release`).

When this command is executed, it **modifies the APK code** to include tracking and reporting of React commit data, which will later be used for frame analysis. The modified APK will be placed in a folder named `ff-build` within your project directory. The APK now has the necessary hooks to track React commits as the app runs.

**Why this is important**: React commit data helps correlate frame rendering with the changes made in the React component tree. This allows us to identify any discrepancies or delays in rendering that might lead to frozen frames.

### Step 2: Install APK on a Mobile Device and Connect via ADB
Once the APK is generated, **install it on your mobile device**. After installation, allow Files and Media permissions to ensure the app can save logs and data for analysis. After this, you need to **connect the mobile device to your laptop via ADB (Android Debug Bridge)**. This is done to allow the laptop to interact with the mobile device and record relevant data during the app's execution.

### Step 3: Record Frame and React Commit Data (`yarn de-frost record`)

Now that the APK is installed and the device is connected, it's time to capture the frame rendering data and React commit information. This is done using the following command:

```sh
yarn de-frost record -p <package-name>
```

- `-p`: The package name of the app you want to record data from (e.g., `com.example.myapp`).

This command does the following:

1. **Records the frame rendering data** from the running APK on the connected device. This data includes information about how and when each frame is rendered, which can help identify performance bottlenecks or frozen frames.
2. **Extracts React commit data** during the app’s execution, which is used to understand which React component or action corresponds to each rendered frame.

Both the frame data and React commit information are **dumped into a `data` folder** on your laptop in CSV format. This data will be the foundation for visualizing frame performance and analyzing any issues related to frozen frames.

**Why this is important**: The `yarn de-frost record` command gives us all the raw data we need to analyze frame rendering behavior and correlate it with React component rendering. This is key to identifying and diagnosing frozen frames or UI performance issues in the app.

### Step 4: Visualize the Data (`yarn de-frost show-dashboard`)

Finally, after collecting all the frame and React commit data, you need a way to **visualize** it in an interactive and user-friendly manner. This is achieved using the following command:

```sh
yarn de-frost show-dashboard -d <data-folder-location>
```

- `-d`: The directory where the frame data and React commit information have been dumped (the `data` folder).

Running this command will open a **web dashboard** that provides a visual representation of the frame data and React commit information. The dashboard allows you to easily analyze and identify any issues, such as frozen frames, by providing interactive charts, graphs, and performance metrics.

**Why this is important**: The dashboard serves as the final step in this process. It takes the raw data and presents it in a visual format, making it much easier to spot trends, correlations, and potential issues with frame rendering and React commits.

## Example Workflow

Let’s walk through an example of how this package can be used in practice:

1. **Create the APK**: You start by generating an APK that has React commit tracking code added:

   ```sh
   yarn de-frost create-build -f Staging -v Release
   ```

2. **Record Frame and React Data**: Once the APK is ready, installed on your device and all permissions given, you can begin recording frame and React commit data:

   ```sh
   yarn de-frost record -p com.example.myapp
   ```

   This will start recording and will dump the data into the `data` folder.

3. **Visualize the Data**: Finally, you can open the web dashboard to analyze the data and identify any potential frozen frames:

   ```sh
   yarn de-frost show-dashboard -d ./data
   ```

---

## Requirements

- **Node.js**: v12 or higher.
- **Yarn**: For managing dependencies and running the commands.
- **ADB**: Ensure that your mobile device is connected and recognized via ADB for recording the frame data.

## Other Documents

- [Internals of Defrost](./documentation/internals.md)
- [Understanding of Frames Dashboard](./documentation/dashboard.md)
