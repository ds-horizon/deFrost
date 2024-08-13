import Modal from 'react-modal';

const ModalDescription = ({ modalIsOpen, modalData, setModalIsOpen }: any) => {
  return (
    <Modal
      isOpen={modalIsOpen as boolean}
      onRequestClose={() => setModalIsOpen(false)}
      contentLabel="Point Details"
      className="modal-content"
      overlayClassName="ReactModal__Overlay"
    >
      <div className="modal-header">Point Details</div>
      <div className="modal-body">
        {modalData ? (
          <div>
            <p>{modalData}</p>
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
