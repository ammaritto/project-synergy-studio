(function() {
  // Get references to elements
  const iframe = document.getElementById('booking-iframe');
  const container = document.getElementById('booking-iframe-container');
  const loadingIndicator = document.getElementById('loading-indicator');
  const debugInfo = document.getElementById('debug-info');
  const heightDisplay = document.getElementById('height-display');
  
  // Enhanced configuration with separate min heights
  const MIN_HEIGHT_DESKTOP = 420;
  const MIN_HEIGHT_MOBILE = 520;
  const MAX_HEIGHT = 2100;
  const UPDATE_THRESHOLD = 15; // More sensitive to small changes
  const DEBOUNCE_DELAY = 30;   // Faster response
  
  let lastHeight = MIN_HEIGHT_DESKTOP;
  let updateTimer;
  let isStableHeight = false; // Track if height has stabilized
  
  // Debug mode (set to true for development)
  const DEBUG_MODE = false;
  if (DEBUG_MODE) {
    container.classList.add('debug-mode');
  }
  
  // Helper function to get appropriate min height based on screen size
  function getMinHeight() {
    const isMobile = window.innerWidth <= 768;
    return isMobile ? MIN_HEIGHT_MOBILE : MIN_HEIGHT_DESKTOP;
  }
  
  // Enhanced height update function with stability checking
  function updateIframeHeight(height, source = 'postMessage') {
    if (!height || isNaN(height)) {
      console.warn('Invalid height received:', height);
      return;
    }
    
    // Get appropriate minimum height based on device
    const isMobile = window.innerWidth <= 768;
    const currentMinHeight = getMinHeight();
    
    const newHeight = Math.min(Math.max(height, currentMinHeight), MAX_HEIGHT);
    const heightDiff = Math.abs(newHeight - lastHeight);
    
    // More aggressive threshold for mobile to prevent blank space
    const mobileThreshold = isMobile ? 10 : UPDATE_THRESHOLD;
    
    // Only update if difference is significant OR if this is an initial/content change
    const shouldUpdate = heightDiff > mobileThreshold || 
                        source === 'iframe-message' || 
                        source === 'initial-load' ||
                        source === 'state-change';
    
    if (shouldUpdate) {
      clearTimeout(updateTimer);
      
      updateTimer = setTimeout(() => {
        // Smooth height transition
        iframe.style.height = newHeight + 'px';
        container.style.minHeight = newHeight + 'px';
        
        // Force container height to match exactly on mobile
        if (isMobile) {
          container.style.height = newHeight + 'px';
        }
        
        // Update debug display
        if (DEBUG_MODE) {
          heightDisplay.textContent = `${newHeight}px (${source}) ${isMobile ? '[Mobile]' : '[Desktop]'} [MinH: ${currentMinHeight}px]`;
        }
        
        lastHeight = newHeight;
        isStableHeight = true;
        
        // Confirm update to iframe
        iframe.contentWindow.postMessage({ 
          type: 'height-updated',
          newHeight: newHeight,
          isMobile: isMobile,
          viewportWidth: window.innerWidth,
          minHeight: currentMinHeight
        }, '*');
        
        console.log(`Height updated to ${newHeight}px (source: ${source}, diff: ${heightDiff}px, mobile: ${isMobile}, minHeight: ${currentMinHeight}px)`);
        
        // Dispatch custom event for external listeners
        window.dispatchEvent(new CustomEvent('iframeHeightUpdate', {
          detail: { height: newHeight, source: source, isMobile: isMobile, minHeight: currentMinHeight }
        }));
      }, DEBOUNCE_DELAY);
    } else {
      console.log(`Height update skipped (diff: ${heightDiff}px < threshold: ${mobileThreshold}px, source: ${source})`);
    }
  }
  
  // Enhanced message handler with scroll filtering
  window.addEventListener('message', function(event) {
    const allowedOrigins = [
      'https://allihoop.webflow.io',
      'https://www.allihoopliving.com'
    ];
    if (!allowedOrigins.includes(event.origin)) {
      console.warn('Received message from unauthorized origin:', event.origin);
      return;
    }
    
    if (event.data && event.data.type === 'iframe-height') {
      // Filter out potential scroll-related updates if height is already stable
      if (isStableHeight && event.data.source === 'scroll-related') {
        console.log('Ignoring scroll-related height update - height is stable');
        return;
      }
      
      updateIframeHeight(event.data.height, event.data.source || 'iframe-message');
    }
    
    // Handle visibility change from iframe (but don't auto-request height)
    if (event.data && event.data.type === 'content-visibility-change') {
      console.log('Content visibility changed');
      // Only request height if we don't have a stable height yet
      if (!isStableHeight) {
        iframe.contentWindow.postMessage({ type: 'request-height' }, '*');
      }
    }
  });
  
  // DISABLED: Intersection Observer to prevent scroll-triggered height changes
  function setupVisibilityObserver() {
    // Commenting out intersection observer to prevent scroll-triggered updates
    /*
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Only request height on first visibility, not on scroll
            if (!isStableHeight) {
              iframe.contentWindow.postMessage({ 
                type: 'request-height',
                isVisible: true 
              }, '*');
            }
          }
        });
      }, { threshold: 0.1 });
      
      observer.observe(iframe);
    }
    */
    console.log('Visibility observer disabled to prevent scroll-triggered height changes');
  }
  
  // Enhanced load handler
  iframe.addEventListener('load', function() {
    console.log('Iframe loaded successfully');
    
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    iframe.style.opacity = '1';
    
    // Setup visibility observer (currently disabled)
    setupVisibilityObserver();
    
    // Set initial height based on device
    const initialHeight = getMinHeight();
    lastHeight = initialHeight;
    iframe.style.height = initialHeight + 'px';
    container.style.minHeight = initialHeight + 'px';
    
    // Request initial height with retry mechanism
    let retryCount = 0;
    const requestHeight = () => {
      iframe.contentWindow.postMessage({ 
        type: 'request-height',
        isInitial: true,
        minHeight: initialHeight
      }, '*');
      
      if (retryCount < 3 && lastHeight === initialHeight) {
        retryCount++;
        setTimeout(requestHeight, 500 * retryCount);
      }
    };
    
    setTimeout(requestHeight, 200);
  });
  
  // Enhanced error handler
  iframe.addEventListener('error', function(e) {
    console.error('Iframe failed to load:', e);
    if (loadingIndicator) {
      loadingIndicator.innerHTML = '<div style="color: #ef4444;">Failed to load booking system. <button onclick="location.reload()">Retry</button></div>';
    }
  });
  
  // Window resize handler for responsive behavior (with stability check)
  let resizeTimeout;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      isStableHeight = false; // Reset stability on resize
      
      // Update height based on new screen size
      const newMinHeight = getMinHeight();
      if (lastHeight < newMinHeight) {
        updateIframeHeight(newMinHeight, 'resize-adjustment');
      }
      
      iframe.contentWindow.postMessage({ 
        type: 'window-resize',
        minHeight: newMinHeight
      }, '*');
    }, 250);
  });
  
  // URL parameter support with enhanced routing
  const urlParams = new URLSearchParams(window.location.search);
  const inventoryId = urlParams.get('inventory');
  const checkIn = urlParams.get('checkin');
  const checkOut = urlParams.get('checkout');
  
  if (inventoryId || checkIn || checkOut) {
    let iframeSrc = 'https://project-synergy-studio.vercel.app/';
    
    if (inventoryId) {
      iframeSrc += inventoryId;
    }
    
    const params = new URLSearchParams();
    if (checkIn) params.set('checkin', checkIn);
    if (checkOut) params.set('checkout', checkOut);
    
    if (params.toString()) {
      iframeSrc += '?' + params.toString();
    }
    
    iframe.src = iframeSrc;
  }
  
  // Public API for external control
  window.bookingIframe = {
    updateHeight: (height) => updateIframeHeight(height, 'external-api'),
    requestHeight: () => iframe.contentWindow.postMessage({ type: 'request-height' }, '*'),
    reload: () => iframe.src = iframe.src,
    getHeight: () => lastHeight,
    getMinHeight: () => getMinHeight(),
    setDebugMode: (enabled) => {
      if (enabled) container.classList.add('debug-mode');
      else container.classList.remove('debug-mode');
    },
    // New method to reset height stability
    resetStability: () => {
      isStableHeight = false;
      console.log('Height stability reset');
    }
  };
})();