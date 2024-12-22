// MixedChart.js
import React, { memo } from 'react';
import {
  Chart,
  registerables,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { createDatasetForGraph, options } from './MixedChartUtils';
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
  const { allData, labels, reactData, logData, totalRenderTime } =
    formatDataForGraph({
      csvData,
      reactEvents,
      logtEvents,
    });
  const data = createDatasetForGraph(
    allData,
    labels,
    reactData,
    logData,
    totalRenderTime
  );

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
