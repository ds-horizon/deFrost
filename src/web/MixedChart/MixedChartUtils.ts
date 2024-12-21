import { Chart, type ChartOptions, type Plugin } from 'chart.js';
import type {
  CsvDataType,
  LogEvent,
  LogItem,
  ReactEventType,
  ReactItemType,
} from '../AppInterface';
import { removeDefrost, removeDefrostFromList } from '../AppUtils';

export const colors = {
  misc: {
    backgroundColor: 'rgb(10, 99, 132, 0.5)',
    borderColor: 'rgb(10, 99, 132, 1)',
  },
  input: {
    backgroundColor: 'rgb(54, 162, 235, 0.5)',
    borderColor: 'rgb(54, 162, 235, 1)',
  },
  animations: {
    backgroundColor: 'rgb(255, 20, 86, 0.5)',
    borderColor: 'rgb(255, 20, 86, 1)',
  },
  measure: {
    backgroundColor: 'rgb(75, 192, 192, 0.5)',
    borderColor: 'rgb(75, 192, 192,1)',
  },
  draw: {
    backgroundColor: 'rgb(153, 102, 255, 0.5)',
    borderColor: 'rgb(153, 102, 255, 1)',
  },
  sync: {
    backgroundColor: 'rgb(255, 225, 64, 0.5)',
    borderColor: 'rgb(255, 225, 64, 1)',
  },
  gpu: {
    backgroundColor: 'rgb(122, 99, 71, 0.5)',
    borderColor: 'rgb(122, 99, 71, 1)',
  },
};

export const options = (
  handleOnClick: (event: React.MouseEvent, elements: any[]) => void
): ChartOptions<any> => ({
  responsive: true,
  onClick: handleOnClick,
  plugins: {
    annotation: {
      annotations: {
        line1: {
          type: 'line',
          yMin: 16,
          yMax: 16,
          borderColor: 'green',
          borderWidth: 1,
          label: {
            content: 'Line at 16',
            enabled: true,
            position: 'left',
            backgroundColor: 'green',
            color: 'white',
          },
        },
        line2: {
          type: 'line',
          yMin: 700,
          yMax: 700,
          borderColor: 'red',
          borderWidth: 1,
          borderDash: [5, 5],
          label: {
            content: 'Line at 700',
            enabled: true,
            position: 'left',
            backgroundColor: 'red',
            color: 'white',
          },
        },
      },
    },
    tooltip: {
      callbacks: {
        label: function (context: any) {
          const label = context.dataset.label || '';
          const point = context.raw;
          if (label === 'React') {
            return `componentName : ${point.label}`;
          }
          if (label === 'Log') {
            return `Log: ${point.label}`;
          }
          return `${label}: ${point}`;
        },
      },
    },

    legend: {
      position: 'top' as const,
      usePointStyle: true,
    },
    title: {
      display: true,
      text: 'De-Frost',
    },
    zoom: {
      zoom: {
        limits: {
          y: {
            min: 0,
            max: 100,
          },
        },
        drag: {
          enabled: true,
        },
      },
    },
    highlightBars: customHighlightPlugin,
  },
  scales: {
    x: {
      stacked: true,
      min: 0,
      beginAtZero: true,
    },
    y: {
      stacked: true,
      min: 0,
      beginAtZero: true,
    },
  },
});
export const formatDataForGraph = ({
  csvData,
  reactEvents,
  logtEvents,
}: {
  csvData: CsvDataType[];
  reactEvents: ReactEventType[];
  logtEvents: LogEvent[];
}) => {
  let allData: Record<string, string[]> = {};
  let reactData: ReactItemType[] = [];
  let indexReact = 0;
  let logData: LogItem[] = [];
  let indexLog = 0;
  const labels: string[] = [];
  let maxSum = 0;
  const csvSortedData = csvData.sort((a, b) => +a.timestamp - +b.timestamp);

  csvSortedData.forEach((element, index) => {
    const elementKeys = Object.keys(element);
    let sum = 0;
    elementKeys.forEach((eleKeyTemp) => {
      const eleKey = eleKeyTemp as keyof typeof element;
      if (eleKey === 'timestamp') return;
      if (eleKey in allData) {
        allData[eleKey]?.push(element[eleKey]);
      } else {
        allData[eleKey] = [];
        allData[eleKey].push(element[eleKey]);
      }
      sum = sum + +element[eleKey];
    });

    while (
      reactEvents.length > 0 &&
      indexReact < reactEvents.length &&
      element.timestamp > (reactEvents?.[indexReact]?.timestamp || 0)
    ) {
      reactData.push({
        x: `${index}`,
        y: 200,
        label: `${removeDefrost(reactEvents[indexReact]?.event.change?.name || '')}`,
        data: removeDefrostFromList(reactEvents[indexReact]?.event.list),
      });
      indexReact++;
    }

    while (
      logtEvents.length > 0 &&
      indexLog < logtEvents.length &&
      element.timestamp > (logtEvents?.[indexLog]?.timestamp || 0)
    ) {
      logData.push({
        x: `${index}`,
        y: 300,
        label: logtEvents[indexLog]?.event || '',
        data: logtEvents[indexLog]?.event || '',
      });
      indexLog++;
    }

    if (maxSum < sum) maxSum = sum;
    labels.push(`${index}`);
  });
  return { allData, labels, reactData, logData };
};

export const createDatasetForGraph = (
  allData: Record<string, string[]>,
  labels: string[],
  reactData: ReactItemType[],
  logData: LogItem[]
) => {
  const allDataSetName = Object.keys(allData);
  const dataSets = allDataSetName.map((datasetName) => {
    return {
      data: allData[datasetName],
      label: datasetName,
      borderWidth: 1,
      ...colors[datasetName as keyof typeof colors],
      stack: 'stack1',
    };
  });
  const data = {
    labels: labels,
    datasets: [
      ...dataSets,
      {
        label: 'React',
        type: 'scatter',
        data: reactData,
        backgroundColor: 'rgb(10, 99, 132, 0.5)',
        stack: 'stack2',
      },
      {
        label: 'Log',
        type: 'scatter',
        data: logData,
        backgroundColor: 'rgb(132, 99, 10, 0.5)',
        stack: 'stack3',
      },
    ],
  };
  return data;
};

const customHighlightPlugin: Plugin = {
  id: 'highlightBars',
  beforeDraw: (chart) => {
    const ctx = chart.ctx;
    const datasets = chart.data.datasets;
    const indicesToHighlight = [1, 5, 10]; // Indices of bars you want to highlight
    const glowColor = 'rgba(255, 99, 132, 0.8)'; // The color of the glow

    // Loop through indices to highlight
    indicesToHighlight.forEach((index) => {
      let highestY = chart.chartArea.bottom; // Track the top bar in the stack
      let barWidth = 0; // Track bar width for the top bar
      let barColor: string | undefined;

      // Loop through datasets to find the top bar at the given index
      datasets.forEach((dataset, datasetIndex) => {
        const meta = chart.getDatasetMeta(datasetIndex);
        const bar = meta.data[index]; // Get the bar at the current index

        if (bar) {
          const properties = bar.getProps(['x', 'y', 'width', 'height'], true); // Get the bar properties

          // Update highestY, barWidth, and barColor for the topmost bar
          if (properties.y < highestY) {
            highestY = properties.y; // Top of the stack
            barWidth = properties.width + 2; // Use the bar's width property
            if (Array.isArray(dataset.backgroundColor)) {
              barColor = dataset.backgroundColor[index] as string;
            } else {
              barColor = dataset.backgroundColor as string;
            }
          }
        }
      });

      if (barColor && barWidth > 0) {
        // Apply glow to the top bar in the stack
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 6; // Adjust this for a tighter glow
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw the glow for the top bar
        const meta = chart.getDatasetMeta(0); // Use the first dataset for x-coordinates
        const bar = meta.data[index];
        const properties = bar?.getProps(['x', 'y'], true) || { x: 0, y: 0 };

        ctx.fillStyle = barColor;
        ctx.fillRect(
          properties.x - barWidth / 2,
          highestY,
          barWidth,
          chart.chartArea.bottom - highestY
        );

        // Reset shadow settings
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    });
  },
};

Chart.register(customHighlightPlugin);
