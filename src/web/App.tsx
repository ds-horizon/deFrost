import React, {
  useCallback,
  useEffect,
  useState,
  createContext,
  useContext,
} from 'react';
import MixedChart from './MixedChart/MixedChart';
import ModalDescription from './Modal/Modal';
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

// Theme toggle button component
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '8px 16px',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: 'var(--button-bg)',
        color: 'var(--text-color)',
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

const App = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalDataType[]>([]);
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

  const openModal = useCallback((data: ModalDataType[]) => {
    if (data.length > 0) {
      setModalData(data);
      setModalIsOpen(true);
    }
  }, []);

  return (
    <ThemeProvider>
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
        <ThemeToggle />
        <MixedChart
          openModal={openModal}
          csvData={csvData}
          reactEvents={reactEvents}
          logtEvents={logtEvents}
        />
        {modalIsOpen && (
          <ModalDescription
            modalIsOpen={modalIsOpen}
            setModalIsOpen={setModalIsOpen}
            modalData={modalData}
          />
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;
