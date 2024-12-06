// MixedChart.js
import React, { memo, useEffect, useState } from 'react';
import {
  Chart,
  registerables,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {
  colors,
  options,
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
import {
  CSV_TEXT,
  fetchFromCsv,
  formatDataForGraph,
  getLogsTextFile,
  getReactChangesTextFile,
} from './MixedChartUtils';

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
    fetchFromCsv<CsvDataType>(CSV_TEXT).then((res) => {
      setcsvData(res);
    });
    getReactChangesTextFile<ReactEventType[]>().then((res) => {
      setReactEvents(res);
    });

    getLogsTextFile<LogEvent[]>().then((res) => {
      setLogEvents(res);
    });
  }, []);

  const { allData, labels, reactData, logData } = formatDataForGraph({
    csvData,
    reactEvents,
    logtEvents,
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
        data={
          data as ChartData<
            'bar',
            string[] | ReactItemType[] | LogItem[],
            string
          >
        }
        options={options(handleOnClick) as ChartOptions<any>}
      />
    </div>
  );
};

export default memo(MixedChart);
