// MixedChart.js
import React, { memo, useContext, useState, useCallback, useMemo } from 'react';
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
import Slider from '../Slider/Slider';
import debounce from 'lodash/debounce';

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
  const { theme } = useContext(ThemeContext);
  const [barThickness, setBarThickness] = useState(14);

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

  // Create debounced setter for bar thickness
  const debouncedSetBarThickness = useMemo(
    () =>
      debounce((value: number) => {
        setBarThickness(value);
      }, 100),
    []
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        height: '100vh',
      }}
    >
      <Slider value={barThickness} onChange={debouncedSetBarThickness} />
      <div
        style={{
          overflowX: 'auto',
          width: `${data.widthOfScreen}px`,
          height: '600px',
          backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
          borderRadius: '8px',
          padding: '20px',
          position: 'relative',
        }}
      >
        <div style={{ width: '100%', height: '100%' }}>
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
