// MixedChart.js
import React, { memo } from 'react';
import {
  Chart,
  registerables,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { colors, options } from './MixedChartUtils';
import './MixedChart.css';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import { formatDataForGraph } from './MixedChartUtils';
import type {
  CsvDataType,
  LogEvent,
  LogItem,
  ModalDataType,
  ReactEventType,
  ReactItemType,
} from '../AppInterface';

// Register the necessary Chart.js components
Chart.register(...registerables);
Chart.register(zoomPlugin);
Chart.register(annotationPlugin);

type MixedChartType = {
  openModal: (data: ModalDataType[]) => void;
  csvData: CsvDataType[];
  reactEvents: ReactEventType[];
  logtEvents: LogEvent[];
};

const MixedChart = ({
  openModal,
  csvData,
  reactEvents,
  logtEvents,
}: MixedChartType) => {
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
    const dataToShowOnModal: ModalDataType[] = [];
    if (elements.length > 0) {
      elements.forEach((element) => {
        if (element.datasetIndex === 7) {
          dataToShowOnModal.push({
            label: reactData[element.index]?.label,
            data: reactData[element.index]?.data,
          });
        }
      });
      if (dataToShowOnModal.length > 0) {
        openModal(dataToShowOnModal);
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
