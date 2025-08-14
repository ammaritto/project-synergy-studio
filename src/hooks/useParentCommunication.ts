import { useCallback } from 'react';

export const useParentCommunication = () => {
  const sendToParent = useCallback((type: string, data: any) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type,
          data,
          source: 'project-synergy-studio'
        }, '*');
      }
    } catch (error) {
      console.error('Failed to send message to parent:', error);
    }
  }, []);

  const openFullScreenPopup = useCallback((content: any) => {
    sendToParent('openPopup', content);
  }, [sendToParent]);

  return {
    sendToParent,
    openFullScreenPopup
  };
};
