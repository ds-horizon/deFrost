// MixedChart.js
import React, { memo, useContext, useCallback, useMemo, useState } from 'react';
import { Chart, registerables, type ChartData } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { createDatasetForGraph, options, colors } from './MixedChartUtils';
import './MixedChart.css';
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';
import { formatDataForGraph } from './MixedChartUtils';
import ChartLegend from './ChartLegend';
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

// Define legend items manually to match chart datasets
const legendItems = [
  {
    label: 'Misc',
    color: colors.misc.backgroundColor,
    borderColor: colors.misc.borderColor,
  },
  {
    label: 'Input',
    color: colors.input.backgroundColor,
    borderColor: colors.input.borderColor,
  },
  {
    label: 'Animations',
    color: colors.animations.backgroundColor,
    borderColor: colors.animations.borderColor,
  },
  {
    label: 'Measure',
    color: colors.measure.backgroundColor,
    borderColor: colors.measure.borderColor,
  },
  {
    label: 'Draw',
    color: colors.draw.backgroundColor,
    borderColor: colors.draw.borderColor,
  },
  {
    label: 'Sync',
    color: colors.sync.backgroundColor,
    borderColor: colors.sync.borderColor,
  },
  {
    label: 'GPU',
    color: colors.gpu.backgroundColor,
    borderColor: colors.gpu.borderColor,
  },
  {
    label: 'React',
    color: 'rgba(255, 99, 132, 0.5)',
    borderColor: 'rgba(255, 99, 132, 1)',
  },
  {
    label: 'Log',
    color: 'rgba(100, 100, 100, 0.5)',
    borderColor: 'rgba(100, 100, 100, 1)',
  },
];

const MixedChart = ({
  openModal,
  csvData,
  reactEvents,
  logtEvents,
  barThickness,
}: MixedChartType) => {
  const { theme } = useContext(ThemeContext);
  const [hiddenDatasets, setHiddenDatasets] = useState<number[]>([]);

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

  // Handle legend item click (toggle visibility)
  const handleLegendItemClick = useCallback((index: number) => {
    setHiddenDatasets((prev) => {
      if (prev.includes(index)) {
        // Remove from hidden datasets (make visible)
        return prev.filter((i) => i !== index);
      } else {
        // Add to hidden datasets (hide it)
        return [...prev, index];
      }
    });
  }, []);

  // Memoize chart options - disable built-in legend
  const chartOptions = useMemo(() => {
    const opts = options(handleOnClick, theme);
    if (opts.plugins && opts.plugins.legend) {
      opts.plugins.legend.display = false; // Disable built-in legend
    }
    return opts;
  }, [handleOnClick, theme]);

  // Filter visible datasets
  const visibleData = useMemo(() => {
    if (hiddenDatasets.length === 0) {
      // All datasets are visible
      return data;
    }

    // Clone the data and filter out hidden datasets
    return {
      ...data,
      datasets: data.datasets.filter(
        (_, index) => !hiddenDatasets.includes(index)
      ),
    };
  }, [data, hiddenDatasets]);

  // Update legend items with current visibility state
  const currentLegendItems = useMemo(() => {
    return legendItems.map((item, index) => ({
      ...item,
      hidden: hiddenDatasets.includes(index),
    }));
  }, [hiddenDatasets]);

  return (
    <div className="chart-container-main">
      <ChartLegend
        items={currentLegendItems}
        onItemClick={handleLegendItemClick}
      />
      <div className="chart-wrapper">
        <div></div>
        <div
          className="chart"
          style={{
            width: `${data.widthOfScreen}px`,
            backgroundColor: theme === 'dark' ? '#2d2d2d' : '#ffffff',
          }}
        >
          <Bar
            data={
              visibleData as ChartData<
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
