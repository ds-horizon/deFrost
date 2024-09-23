import React, { useState } from 'react';
import Modal from 'react-modal';
import './Modal.css';
import Dropdown from '../Dropdown/Dropdown';

const ModalDescription = ({ modalIsOpen, modalData, setModalIsOpen }: any) => {
  const [state, setState] = useState(0);
  const componentString: any[] = [];
  let options: any[] = [];
  let onSelect = (element: any) => {
    const index = options.indexOf(element);
    if (index >= 0) {
      setState(index);
    }
  };
  if (modalData.length > 0) {
    options = modalData.map((ele: any) => {
      return ele.label;
    });
    modalData[state]?.data?.forEach((component: any) => {
      componentString.push(component.componentName);
    });
  }
  const onClose = () => {
    setState(0);
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
          placeholder={options[0]}
        />
      </div>
      <div className="modal-body">
        {modalData.length > 0 ? (
          <div>
            <div className="title">{`Component Name - ${modalData[state]?.label}`}</div>
            <div className="list-of-components">
              <p>{`List of Components - [`}</p>
              <div className="margin10">
                {componentString.reverse().map((compStr: string) => {
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
