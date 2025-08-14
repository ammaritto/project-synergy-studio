// Utility functions for iframe detection and postMessage communication

export interface IframeMessage {
  type: 'OPEN_GUEST_MODAL' | 'OPEN_PAYMENT_MODAL' | 'OPEN_CONFIRMATION_MODAL' | 'CLOSE_MODAL' | 
        'GUEST_DETAILS_SUBMITTED' | 'MODAL_CLOSED' | 'GO_BACK_TO_GUEST_DETAILS' | 'MAKE_ANOTHER_BOOKING';
  data?: any;
}

// Check if running inside an iframe
export const isInIframe = (): boolean => {
  try {
    const inIframe = window.self !== window.top;
    console.log('[IFRAME DEBUG] Is in iframe:', inIframe);
    console.log('[IFRAME DEBUG] window.self:', window.self);
    console.log('[IFRAME DEBUG] window.top:', window.top);
    return inIframe;
  } catch (e) {
    console.log('[IFRAME DEBUG] Error checking iframe, assuming true:', e);
    return true;
  }
};

// Send message to parent window
export const sendMessageToParent = (message: IframeMessage): void => {
  if (isInIframe() && window.parent) {
    console.log('[IFRAME DEBUG] Sending message to parent:', message);
    window.parent.postMessage(message, '*');
  } else {
    console.log('[IFRAME DEBUG] Not in iframe or no parent, skipping message:', message);
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