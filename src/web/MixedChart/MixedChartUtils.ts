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
) => ({
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
    },
    title: {
      display: true,
      text: 'De',
    },
    zoom: {
      zoom: {
        limits: {
          y: { min: 0, max: 20, minRange: 'original' },
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
    },
    y: {
      stacked: true,
      min: 0,
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
