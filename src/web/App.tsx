import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useMemo,
} from 'react';
import MixedChart from './MixedChart/MixedChart';
import CommitPanel from './CommitPanel/CommitPanel';
import Navbar from './Navbar/Navbar';
import {
  CSV_TEXT,
  fetchFromCsv,
  getLogsTextFile,
  getReactChangesTextFile,
} from './AppUtils';
import type {
  CsvDataType,
  LogEvent,
  ModalDataType,
  ReactEventType,
} from './AppInterface';
import './styles.css';
import debounce from 'lodash/debounce';

// Theme context
type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

// Theme provider component
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const App = () => {
  const [commitPanelOpen, setCommitPanelOpen] = useState(false);
  const [commitData, setCommitData] = useState<ModalDataType[]>([]);
  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(
    null
  );
  const [csvData, setcsvData] = useState<CsvDataType[]>([]);
  const [reactEvents, setReactEvents] = useState<ReactEventType[]>([]);
  const [logtEvents, setLogEvents] = useState<LogEvent[]>([]);
  const [barThickness, setBarThickness] = useState(14);

  // First, create a stable function that updates the bar thickness
  const updateBarThickness = useCallback((value: number) => {
    setBarThickness(value);
  }, []);

  // Then create a memoized debounced version of that function
  const debouncedSetBarThickness = useMemo(
    () => debounce(updateBarThickness, 100),
    [updateBarThickness]
  );

  // Clean up the debounced function on component unmount
  useEffect(() => {
    return () => {
      debouncedSetBarThickness.cancel();
    };
  }, [debouncedSetBarThickness]);

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

  const openCommitPanel = useCallback(
    (data: ModalDataType[], pointIndex: number) => {
      if (data.length > 0) {
        setCommitData(data);
        setSelectedPointIndex(pointIndex);
        setCommitPanelOpen(true);
      }
    },
    []
  );

  const closeCommitPanel = useCallback(() => {
    setCommitPanelOpen(false);
    setSelectedPointIndex(null);
  }, []);

  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
        <Navbar
          barThickness={barThickness}
          onBarThicknessChange={debouncedSetBarThickness}
        />
        <div style={{ paddingTop: '70px' }}>
          <MixedChart
            openCommitPanel={openCommitPanel}
            csvData={csvData}
            reactEvents={reactEvents}
            logtEvents={logtEvents}
            barThickness={barThickness}
            selectedPointIndex={selectedPointIndex}
          />
        </div>

        <CommitPanel
          isOpen={commitPanelOpen}
          commitData={commitData}
          onClose={closeCommitPanel}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;
