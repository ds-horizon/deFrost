# @d11/defrost: How It Works

## **Internals of @d11/defrost: How It Works**

### **Overview**

The `@d11/defrost` tool is designed to analyze **frozen frames** and **performance bottlenecks** in **React Native** applications by collecting data from the native Android layer (via **gfxinfo framestats**) and correlating it with **React commit information**.

Here's a breakdown of how these components are connected and work together to provide insights into app performance, specifically around frame rendering and React component updates.

---

### **Key Components and Data Sources**

1. **gfxinfo framestats**:

   - The Android tool `gfxinfo` provides detailed performance metrics for each frame rendered by the application. The specific data comes from `adb shell dumpsys gfxinfo <package-name>`.
   - The **framestats** data includes various timestamps and durations that detail the time spent in different stages of frame processing.

2. **React Commit Tracking**:
   - React Native’s internal rendering system sends commit data for each component that updates its state.
   - The commit data includes information about which component's state changed and which other components are affected, along with the timestamp when the commit is sent to native.

---

### **How Data is Collected and Correlated**

1. **Data Collection**:

   - The `@d11/defrost` tool collects two primary types of data:
     - **Frame Data**: Extracted using `adb shell dumpsys gfxinfo` to gather information about frame rendering, such as when input events are handled, when animations start, and when frames are drawn.
     - **React Commit Data**: The React Native system reports which components updated and when the update was sent to native (via timestamps).

2. **Mapping Epoch to Uptime**:

   - The timestamps in the **React Commit Data** are in **epoch time** (milliseconds since January 1, 1970).
   - However, the **gfxinfo framestats** data is timestamped in terms of **uptime** (time elapsed since the device was powered on). This means that directly comparing React commit times to frame data would be difficult.
   - To solve this, a separate **mapping thread** is used to map **epoch time to uptime** over the past 3 seconds. This map is updated every second, allowing us to convert React commit times (epoch) to the corresponding uptime values.

3. **Data Correlation**:
   - Once the **epoch timestamp** from the React commit data is converted to **uptime**, it can be compared against the **frame data** (which is in uptime format).
   - This allows us to analyze the **timing relationship** between React component state updates and frame rendering events, helping us pinpoint **frozen frames** and **performance bottlenecks**.

---

### **React Native Reconciliation Process**

To understand how the tool tracks **React commit information**, we need to explore the **React Native reconciliation cycle**:

#### **1. Triggering State Changes and Reconciliation**

Whenever a component’s state changes in a React Native application, the following process occurs:

- **`scheduleUpdateOnFiber`** is called, which triggers the React update cycle for the affected component. This function essentially marks the component as needing an update and schedules it for re-rendering.
- **React Reconciliation** is the process where React compares the **new virtual DOM** (or component tree) with the **previous virtual DOM** to determine which components or nodes need to be updated.

#### **2. The `beginWork` and `completeWork` Phases**

- **`beginWork`**: This phase is where React starts the reconciliation for each node in the component tree. During this phase, React checks if the component’s state or props have changed, and determines if there is any need for rendering work for the component (e.g., update, delete, or insert elements).
- **`completeWork`**: Once React has completed the reconciliation work for all nodes, it proceeds to the `completeWork` phase. This phase is crucial because it helps determine which nodes actually require updates. The **flags** in the `completeWork` phase indicate whether any **rendering work** was actually done for the node (e.g., whether the node was updated or not).

#### **3. Commit to Native (Shadow Node)**

After the reconciliation cycle (involving `beginWork` and `completeWork`), the information regarding which components have been updated is sent to the **shadow nodes** in the React Native runtime. This is when React Native commits the updates to the native side, which will eventually trigger UI changes on the screen.

- **React Commit Data**: During this phase, React sends commit data that includes:
  - **Which component’s state changed**.
  - **Which other components are affected by the state change**.
  - **Timestamp**: The **timestamp when React sends the commit to the native side** is recorded and used in the tool for correlation with frame rendering data.

---

### **Detailed Breakdown of `gfxinfo framestats`**

The `gfxinfo framestats` command provides a series of **timing metrics** that represent various stages in the frame rendering lifecycle. These stages include input handling, animation, layout traversals, drawing, synchronization, and GPU processing. Here's a closer look at the data and how it's used in **@d11/defrost**:

#### **Key Fields in `gfxinfo framestats`**:

- **Flags**: Indicates the frame’s status (e.g., whether the frame was processed or skipped).
- **IntendedVsync**: The timestamp (in nanoseconds) of when the system intended to begin the VSync period for this frame.
- **Vsync**: The actual timestamp of when the system started the VSync period for this frame.
- **OldestInputEvent**: The timestamp of the oldest input event received during the frame rendering.
- **NewestInputEvent**: The timestamp of the most recent input event.
- **HandleInputStart**: The timestamp when input handling begins.
- **AnimationStart**: The timestamp when the animation phase starts.
- **PerformTraversalsStart**: The timestamp when layout traversal starts (calculating the layout and preparing the view for drawing).
- **DrawStart**: The timestamp when the drawing phase starts.
- **SyncQueued**: The timestamp when the frame was queued for synchronization.
- **SyncStart**: The timestamp when synchronization with the display hardware started.
- **IssueDrawCommandsStart**: The timestamp when the GPU was given the drawing commands.
- **SwapBuffers**: The timestamp when the frame is swapped to the display.
- **FrameCompleted**: The timestamp when the frame is fully rendered and ready to display.
- **DequeueBufferDuration**: Time (in nanoseconds) taken to dequeue the buffer for rendering.
- **QueueBufferDuration**: Time (in nanoseconds) taken to queue the buffer for display.
- **GpuCompleted**: The timestamp when the GPU completes rendering the frame.

These timings are all in nanoseconds

#### **Frame Time Intervals (Your Formulas)**

The following intervals are calculated by subtracting timestamps from different stages of the frame lifecycle:

1. **Vsync / Misc Duration**:

   - **Formula**: `start = (framestats[5] - framestats[1]) / 1000000`
   - This calculates the time from **IntendedVsync** to **HandleInputStart**, representing how long the system waited before starting to handle input events.

2. **Input Handling Duration**:

   - **Formula**: `handle_input = (framestats[6] - framestats[5]) / 1000000`
   - This measures the time between **HandleInputStart** and **AnimationStart**, showing the duration spent handling input events before the animation phase begins.

3. **Animation Duration**:

   - **Formula**: `animations = (framestats[7] - framestats[6]) / 1000000`
   - This measures the time between **AnimationStart** and **PerformTraversalsStart**, indicating how long animations took before layout traversal started.

4. **Measure / Layout Duration**:

   - **Formula**: `traversals = (framestats[8] - framestats[7]) / 1000000`
   - This measures the time from **PerformTraversalsStart** to **DrawStart**, representing the duration of layout traversal and preparation for drawing.

5. **Draw Duration**:

   - **Formula**: `draw = (framestats[10] - framestats[8]) / 1000000`
   - This measures the time between **DrawStart** and **SyncStart**, showing how long the system spent synchronizing with the display hardware.

6. **Synchronization Duration**:

   - **Formula**: `sync = (framestats[11] - framestats[10]) / 1000000`
   - This measures the time between **IssueDrawCommandsStart** and **SyncStart**, reflecting the time spent issuing commands to the GPU and syncing the frame.

7. **GPU rendering Duration**:
   - **Formula**: `gpu = (framestats[13] - framestats[11]) / 1000000`
   - This calculates the time between **IssueDrawCommandsStart** and **FrameCompleted**, representing the GPU processing time to finish rendering the frame.

Each of these times is in **milliseconds** and provides detailed insights into the time spent at each stage of the frame lifecycle. These insights help identify areas where performance improvements can be made, such as reducing GPU time or improving synchronization with the display.
