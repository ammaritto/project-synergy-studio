import React, { createContext, useContext, ReactNode } from 'react';
import { useIframeHeightCommunication } from './useIframeHeightCommunication';

interface IframeHeightContextType {
  sendHeightToParent: () => void;
  forceHeightUpdate: () => void;
}

const IframeHeightContext = createContext<IframeHeightContextType | null>(null);

export const useIframeHeight = () => {
  const context = useContext(IframeHeightContext);
  if (!context) {
    throw new Error('useIframeHeight must be used within an IframeHeightProvider');
  }
  return context;
};

interface IframeHeightProviderProps {
  children: ReactNode;
  disabled?: boolean; // Allow disabling when not in iframe
}

export const IframeHeightProvider: React.FC<IframeHeightProviderProps> = ({ 
  children, 
  disabled = false 
}) => {
  const heightCommunication = useIframeHeightCommunication();

  // Check if we're actually in an iframe
  const isInIframe = window.parent !== window;

  // Don't provide height communication if disabled or not in iframe
  const contextValue = (disabled || !isInIframe) ? {
    sendHeightToParent: () => {},
    forceHeightUpdate: () => {}
  } : heightCommunication;

  return (
    <IframeHeightContext.Provider value={contextValue}>
      {children}
    </IframeHeightContext.Provider>
  );
};
