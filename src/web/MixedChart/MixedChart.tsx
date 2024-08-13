// MixedChart.js
import React, { memo, useEffect, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Scatter, Bar } from 'react-chartjs-2';
import Papa from 'papaparse';
import { colors, options } from '../utils';
import './MixedChart.css';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register the necessary Chart.js components
Chart.register(...registerables);
Chart.register(zoomPlugin);
Chart.register(annotationPlugin);
const MixedChart = () => {
  const [csvData, setcsvData] = useState<any[]>([]);
  const [reactEvents, setReactEvents] = useState<any[]>([]);
  useEffect(() => {
    fetch('data/data.csv')
      .then((res) => res.text())
      .then((text) => {
        Papa.parse(text, {
          header: true,
          complete: (result) => {
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
        setReactEvents(allEvents);
      });
  }, []);

  let allData: any = {};
  let reactData: any[] = [];
  let indexReact = 0;
  const labels: any[] = [];
  let maxSum = 0;
  const csvSortedData = csvData.sort((a, b) => a.timestamp - b.timestamp);

  csvSortedData.forEach((element, index) => {
    const elementKeys = Object.keys(element);
    let sum = 0;
    elementKeys.forEach((eleKey) => {
      if (eleKey === 'timestamp') return;
      if (eleKey in allData) {
        allData[eleKey].push(element[eleKey]);
      } else {
        allData[eleKey] = [];
        allData[eleKey].push(element[eleKey]);
      }
      sum = sum + +element[eleKey];
    });

    while (
      reactEvents.length > 0 &&
      indexReact < reactEvents.length &&
      element['timestamp'] > reactEvents[indexReact].timestamp
    ) {
      console.log('---------', reactEvents[indexReact].event?.change?.name);
      reactData.push({
        x: `${index}`,
        y: 200,
        label: `${reactEvents[indexReact].event?.change?.name}`,
      });
      indexReact++;
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
      },
    ],
  };

  return (
    <div>
      <Bar data={data} options={options} />
    </div>
  );
};

export default memo(MixedChart);
