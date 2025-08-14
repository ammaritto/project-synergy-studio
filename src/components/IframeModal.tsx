import React, { useEffect } from 'react';
import { isInIframe, sendMessageToParent, IframeMessage } from '../utils/iframeUtils';

interface IframeModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  modalType: 'OPEN_GUEST_MODAL' | 'OPEN_PAYMENT_MODAL' | 'OPEN_CONFIRMATION_MODAL';
  data?: any;
}

const IframeModal: React.FC<IframeModalProps> = ({
  children,
  isOpen,
  onClose,
  modalType,
  data
}) => {
  useEffect(() => {
    if (isOpen && isInIframe()) {
      // Send message to parent to open modal
      sendMessageToParent({
        type: modalType,
        data
      });
      
      // Close the local modal since parent will handle it
      onClose();
    }
  }, [isOpen, modalType, data, onClose]);

  // If in iframe and modal should be open, don't render anything
  // The parent will handle the modal
  if (isInIframe() && isOpen) {
    return null;
  }

  // If not in iframe or modal is closed, render normally
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {children}
    </div>
  );
};

export default IframeModal;