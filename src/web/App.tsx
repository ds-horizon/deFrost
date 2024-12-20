import React, { useEffect, useState } from 'react';
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
  const openModal = (data: ModalDataType[]) => {
    if (data.length > 0) {
      setModalData(data);
      setModalIsOpen(true);
    }
  };

  return (
    <div>
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
  );
};
export default App;
