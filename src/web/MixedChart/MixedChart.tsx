// MixedChart.js
import React, { memo, useEffect, useState } from 'react';
import {
  Chart,
  registerables,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Papa from 'papaparse';
import {
  colors,
  options,
  removeDefrost,
  removeDefrostFromList,
  type CsvDataType,
  type LogEvent,
  type LogItem,
  type ModalDataType,
  type ReactEventType,
  type ReactItemType,
} from '../utils';
import './MixedChart.css';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register the necessary Chart.js components
Chart.register(...registerables);
Chart.register(zoomPlugin);
Chart.register(annotationPlugin);
const MixedChart = ({
  openModal,
}: {
  openModal: (data: ModalDataType[]) => void;
}) => {
  const [csvData, setcsvData] = useState<CsvDataType[]>([]);
  const [reactEvents, setReactEvents] = useState<ReactEventType[]>([]);
  const [logtEvents, setLogEvents] = useState<LogEvent[]>([]);
  useEffect(() => {
    fetch('data/data.csv')
      .then((res) => res.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          complete: (result: Papa.ParseResult<CsvDataType>) => {
            setcsvData(result.data);
          },
        });
      });
    fetch('data/changes.txt')
      .then((res) => res.text())
      .then((textRes) => {
        const allEventString = textRes.split('---------------------');
        const allEvents = allEventString.map((event) => {
          const [timestamp, eventString] = event.split('$$$');
          return {
            timestamp: timestamp?.replaceAll(' ', '').replaceAll('\n', ''),
            event: JSON.parse(eventString ?? '{}'),
          };
        });
        setReactEvents(allEvents as ReactEventType[]);
      });
    fetch('data/ff.txt')
      .then((res) => res.text())
      .then((textRes) => {
        const allEventString = textRes.replaceAll(' ', '').trim().split('\n');
        const allEvents = allEventString.map((event) => {
          const [eventString, timestamp] = event.split(',');
          return {
            timestamp: timestamp?.replaceAll(' ', '').replaceAll('\n', ''),
            event: eventString?.replaceAll(' ', '').replaceAll('\n', ''),
          };
        });
        setLogEvents(allEvents as LogEvent[]);
      });
  }, []);

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
      element['timestamp'] > (reactEvents?.[indexReact]?.timestamp || 0)
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
      element['timestamp'] > (logtEvents?.[indexLog]?.timestamp || 0)
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
  const handleOnClick = (
    _: React.MouseEvent,
    elements: { datasetIndex: number; index: number }[]
  ) => {
    const dataToSend: ModalDataType[] = [];
    if (elements.length > 0) {
      elements.forEach((element) => {
        if (element.datasetIndex === 7) {
          dataToSend.push({
            label: reactData[element.index]?.label,
            data: reactData[element.index]?.data,
          });
        }
      });
      if (dataToSend.length > 0) {
        openModal(dataToSend);
      }
    }
  };
  return (
    <div>
      <Bar
        data={data as ChartData<any, any, any>}
        options={options(handleOnClick) as ChartOptions<any>}
      />
    </div>
  );
};

export default memo(MixedChart);
