import React, { useState } from 'react';
import MixedChart from './MixedChart/MixedChart';
import ModalDescription from './Modal/Modal';

const App = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalData, setModalData] = useState<any>([]);
  const openModal = (data: any[]) => {
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
