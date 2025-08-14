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
    console.log('[IFRAME MODAL] useEffect triggered:', { isOpen, isInIframe: isInIframe(), modalType });
    
    if (isOpen && isInIframe()) {
      console.log('[IFRAME MODAL] Sending message to parent:', modalType, data);
      // Send message to parent to open modal
      sendMessageToParent({
        type: modalType,
        data
      });
      
      // Don't close immediately - let the parent handle it
      // The modal will remain open in iframe as fallback
    }
  }, [isOpen, modalType, data]);

  // Always render the modal - if in iframe, both will show but parent should overlay
  if (!isOpen) {
    return null;
  }

  // Add styling to hide the iframe modal when parent takes over
  const containerStyle = isInIframe() ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '16px'
  } : {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: '16px'
  };

  return (
    <div style={containerStyle}>
      {children}
    </div>
  );
};

export default IframeModal;