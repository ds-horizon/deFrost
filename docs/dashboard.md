# Visualization Tool for Frame Rendering and React Commits

## Overview

The visualization tool provides an interactive way to analyze frame rendering performance and correlate it with React commit data. It helps identify frozen frames and performance bottlenecks by visualizing the frame rendering time and React commit events.

<video width="640" height="360" controls>
  <source src="./media/Defrost.mov" type="video/quicktime">
  Your browser does not support the video tag.
</video>

## Key Features

1. **Bar Graph Representation**:

   - **X-Axis**: Represents the frame numbers.
   - **Y-Axis**: Represents the frame rendering time (in milliseconds).
   - Each bar is divided into **seven segments**, each corresponding to a specific stage of the frame rendering process:
     1. Vsync / Misc Duration
     2. Input Handling Duration
     3. Animation Duration
     4. Measure / Layout Duration
     5. Draw Duration
     6. Synchronization Duration
     7. GPU Rendering Duration
   - The height of each colored segment represents the duration of that specific stage.

2. **Scatter Plot of React Commits**:

   - A scatter plot is overlaid on the bar graph.
   - Each scatter point represents a **React commit event** placed according to its timestamp.

3. **Interactive Pop-Up**:
   - Clicking on a scatter point triggers a pop-up.
   - The pop-up displays:
     - **Component Name**: The name of the component that triggered the React commit.
     - **Affected Components**: A list of all components affected by this commit.

## Usage

1. Analyze the **bar graph** to understand the time taken by each stage of the frame rendering process.
2. Use the **scatter plot** to correlate React commits with frame rendering times.
3. Click on individual scatter points to view detailed information about React commit events and affected components.

## Benefits

- Quickly identify **frozen frames** by observing frames with high rendering times.
- Correlate **React component updates** with specific frames to pinpoint bottlenecks.
- Gain insights into which parts of the rendering pipeline can be optimized.

This tool is designed to make it easier for developers to debug and optimize performance in React Native applications.
