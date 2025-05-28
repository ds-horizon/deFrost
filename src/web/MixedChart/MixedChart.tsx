// MixedChart.js
import React, { memo, useContext, useCallback, useMemo } from 'react';
import { Chart, registerables, type ChartData } from 'chart.js';
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
import { ThemeContext } from '../App';

// Register the necessary Chart.js components
Chart.register(...registerables);
Chart.register(zoomPlugin);
Chart.register(annotationPlugin);

type MixedChartType = {
  openModal: (data: ModalDataType[]) => void;
  csvData: CsvDataType[];
  reactEvents: ReactEventType[];
  logtEvents: LogEvent[];
  barThickness: number;
};

const MixedChart = ({
  openModal,
  csvData,
  reactEvents,
  logtEvents,
  barThickness,
}: MixedChartType) => {
  const { theme } = useContext(ThemeContext);

  // Memoize the formatted data
  const { allData, labels, reactData, logData, totalRenderTime } = useMemo(
    () =>
      formatDataForGraph({
        csvData,
        reactEvents,
        logtEvents,
      }),
    [csvData, reactEvents, logtEvents]
  );

  // Memoize the chart data
  const data = useMemo(
    () =>
      createDatasetForGraph(
        allData,
        labels,
        reactData,
        logData,
        totalRenderTime,
        barThickness
      ),
    [allData, labels, reactData, logData, totalRenderTime, barThickness]
  );

  const handleOnClick = useCallback(
    (
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
    },
    [openModal, reactData]
  );

  // Memoize chart options
  const chartOptions = useMemo(
    () => options(handleOnClick, theme),
    [handleOnClick, theme]
  );

  return (
    <div className="chart-container">
      <div
        className="chart-wrapper"
        style={{
          width: `${data.widthOfScreen}px`,
          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
        }}
      >
        <div className="chart">
          <Bar
            data={
              data as ChartData<
                'bar',
                string[] | ReactItemType[] | LogItem[],
                string
              >
            }
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(MixedChart);
