// Utility functions for iframe detection and postMessage communication

export interface IframeMessage {
  type: 'OPEN_GUEST_MODAL' | 'OPEN_PAYMENT_MODAL' | 'OPEN_CONFIRMATION_MODAL' | 'CLOSE_MODAL' | 
        'GUEST_DETAILS_SUBMITTED' | 'MODAL_CLOSED' | 'GO_BACK_TO_GUEST_DETAILS' | 'MAKE_ANOTHER_BOOKING';
  data?: any;
}

// Check if running inside an iframe
export const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};

// Send message to parent window
export const sendMessageToParent = (message: IframeMessage): void => {
  if (isInIframe() && window.parent) {
    window.parent.postMessage(message, '*');
  }
};

// Setup message listener for parent responses
export const setupParentMessageListener = (callback: (message: IframeMessage) => void): (() => void) => {
  const handleMessage = (event: MessageEvent) => {
    // Add origin validation in production
    if (event.data && typeof event.data === 'object' && event.data.type) {
      callback(event.data);
    }
  };

  window.addEventListener('message', handleMessage);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('message', handleMessage);
  };
};

// Generate unique modal ID
export const generateModalId = (): string => {
  return `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};