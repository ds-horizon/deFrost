import { type ChartOptions } from 'chart.js';
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
  handleOnClick: (event: React.MouseEvent, elements: any[]) => void,
  aspectRatio: number,
  theme: 'light' | 'dark'
): ChartOptions<any> => {
  const textColor = theme === 'dark' ? '#ffffff' : '#333333';
  const gridColor = theme === 'dark' ? '#404040' : '#e0e0e0';
  const backgroundColor = theme === 'dark' ? '#2d2d2d' : '#ffffff';

  return {
    responsive: true,
    aspectRatio: aspectRatio ? aspectRatio : 1,
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
            const total = context.dataset.totalRenderTime[context.dataIndex];
            return `${label}: ${point}\n Total: ${total}`;
          },
        },
        backgroundColor: backgroundColor,
        titleColor: textColor,
        bodyColor: textColor,
      },
      legend: {
        position: 'top' as const,
        usePointStyle: true,
        labels: {
          color: textColor,
        },
      },
      title: {
        display: true,
        text: 'De-Frost',
        color: textColor,
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
    },
    scales: {
      x: {
        stacked: true,
        min: 0,
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        },
      },
      y: {
        stacked: true,
        min: 0,
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        },
      },
    },
  };
};

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
  const totalRenderTime: number[] = [];
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
    totalRenderTime.push(sum);
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
  return { allData, labels, reactData, logData, totalRenderTime, maxSum };
};

export const createDatasetForGraph = (
  allData: Record<string, string[]>,
  labels: string[],
  reactData: ReactItemType[],
  logData: LogItem[],
  totalRenderTime: number[],
  maxRenderTime: number
) => {
  let widthOfScreen: number = 0;
  const allDataSetName = Object.keys(allData);
  const dataSets = allDataSetName.map((datasetName) => {
    widthOfScreen = (allData[datasetName]?.length || 0) * 14;
    return {
      data: allData[datasetName],
      label: datasetName.charAt(0).toUpperCase() + datasetName.slice(1),
      totalRenderTime: totalRenderTime,
      borderWidth: 1,
      ...colors[datasetName as keyof typeof colors],
      stack: 'stack1',
      barThickness: 10,
    };
  });
  const data = {
    labels: labels,
    widthOfScreen,
    aspectRatioCalculated: widthOfScreen / maxRenderTime,
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
