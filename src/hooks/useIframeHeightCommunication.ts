import { useEffect, useCallback, useRef } from 'react';

export const useIframeHeightCommunication = () => {
  const lastHeightRef = useRef<number>(0);
  
  const sendHeightToParent = useCallback(() => {
    // Get the actual content height
    const height = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    
    // Only send if height has changed significantly (avoid spam)
    if (Math.abs(height - lastHeightRef.current) > 10) {
      lastHeightRef.current = height;
      
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'resize',
            height: height,
            source: 'project-synergy-studio'
          }, '*');
          
          console.log('Height sent to parent:', height);
        }
      } catch (error) {
        console.error('Failed to send height to parent:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Send initial height when component mounts
    const sendInitialHeight = () => {
      setTimeout(sendHeightToParent, 100); // Small delay to ensure DOM is ready
    };

    // Send height when page loads
    if (document.readyState === 'complete') {
      sendInitialHeight();
    } else {
      window.addEventListener('load', sendInitialHeight);
    }

    // Create ResizeObserver to watch for content changes
    const resizeObserver = new ResizeObserver(() => {
      sendHeightToParent();
    });

    // Observe the document body
    resizeObserver.observe(document.body);

    // Create MutationObserver to watch for DOM changes
    const mutationObserver = new MutationObserver(() => {
      // Debounce the height sending
      setTimeout(sendHeightToParent, 50);
    });

    // Observe DOM changes
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class'] // Watch for style/class changes that might affect height
    });

    // Send height on window resize
    const handleResize = () => {
      setTimeout(sendHeightToParent, 100);
    };
    window.addEventListener('resize', handleResize);

    // Listen for parent requesting height tracking
    const handleParentMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'startHeightTracking') {
        sendHeightToParent();
      }
    };
    window.addEventListener('message', handleParentMessage);

    // Send height periodically as a fallback (every 2 seconds)
    const intervalId = setInterval(sendHeightToParent, 2000);

    // Cleanup
    return () => {
      window.removeEventListener('load', sendInitialHeight);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('message', handleParentMessage);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      clearInterval(intervalId);
    };
  }, [sendHeightToParent]);

  return {
    sendHeightToParent,
    forceHeightUpdate: sendHeightToParent
  };
};
