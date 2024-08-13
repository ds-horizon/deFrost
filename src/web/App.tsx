import React, { useState } from 'react';
import MixedChart from './MixedChart/MixedChart';
import ModalDescription from './Modal/Modal';

const App = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalData, setModalData] = useState<any>({});
  return (
    <div>
      <MixedChart />
      {/* <ModalDescription
        modalIsOpen={modalIsOpen}
        setModalIsOpen={setModalIsOpen}
      /> */}
    </div>
  );
};
export default App;
