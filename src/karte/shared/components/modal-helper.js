import Modal from 'react-modal';

Modal.setAppElement('#app');

export const modalStyle = {
  overlay: {
    zIndex: '10',
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  content: {
    top: '50%',
    left: '50%',
    right: '10%',
    bottom: 'auto',
    marginRight: '-50%',
    padding: '0',
    transform: 'translate(-50%, -50%)'
  }
};

export default Modal;