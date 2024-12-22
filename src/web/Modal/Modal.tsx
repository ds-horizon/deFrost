import React, { useState } from 'react';
import Modal from 'react-modal';
import './Modal.css';
import Dropdown from '../Dropdown/Dropdown';
import type { ModalDataType } from '../AppInterface';

const ModalDescription = ({
  modalIsOpen,
  modalData,
  setModalIsOpen,
}: {
  modalIsOpen: boolean;
  modalData: ModalDataType[];
  setModalIsOpen: (value: boolean) => void;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const componentList: string[] = [];
  let onSelect = (element: string) => {
    const index = options.indexOf(element);
    if (index >= 0) {
      setSelectedIndex(index);
    }
  };
  const options = modalData.map((ele) => {
    return ele.label || '';
  });
  modalData[selectedIndex]?.data?.forEach((component) => {
    componentList.push(component.componentName || '');
  });
  const onClose = () => {
    setSelectedIndex(0);
    setModalIsOpen(false);
  };
  return (
    <Modal
      isOpen={modalIsOpen as boolean}
      onRequestClose={onClose}
      contentLabel="Point Details"
      overlayClassName="ReactModal__Overlay"
    >
      <div className="modal-header">Point Details</div>
      <div>
        <Dropdown
          options={options}
          onSelect={onSelect}
          placeholder={options[0] || ''}
        />
      </div>
      <div className="modal-body">
        {modalData.length > 0 ? (
          <div>
            <div className="title">{`Component Name - ${modalData[selectedIndex]?.label}`}</div>
            <div className="list-of-components">
              <p>{`List of Components - [`}</p>
              <div className="margin10">
                {componentList.reverse().map((compStr: string) => {
                  return (
                    <>
                      {compStr ? compStr : 'Unable to find name'} <br />
                    </>
                  );
                })}
              </div>
              {']'}
            </div>
          </div>
        ) : (
          <p>No data available.</p>
        )}
      </div>
      <button className="close-button" onClick={() => setModalIsOpen(false)}>
        Close
      </button>
    </Modal>
  );
};

export default ModalDescription;
