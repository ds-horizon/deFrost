import React, { useState } from 'react';
import MixedChart from './MixedChart/MixedChart';
import ModalDescription from './Modal/Modal';
import type { ModalDataType } from './utils';

const App = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalDataType[]>([]);
  const openModal = (data: ModalDataType[]) => {
    if (data.length > 0) {
      setModalData(data);
      setModalIsOpen(true);
    }
  };

  return (
    <div>
      <MixedChart openModal={openModal} />
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
