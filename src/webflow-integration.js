// Webflow Integration Code
// Add this script to your Webflow project in the custom code section

(function() {
  'use strict';

  // Configuration
  const MODAL_Z_INDEX = 999999;
  const IFRAME_ORIGIN = 'https://your-app-domain.lovable.app'; // Update with your actual domain
  
  let currentModal = null;
  let modalData = null;

  // Create modal container
  function createModalContainer() {
    const container = document.createElement('div');
    container.id = 'iframe-modal-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: ${MODAL_Z_INDEX};
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    // Close on backdrop click
    container.addEventListener('click', function(e) {
      if (e.target === container) {
        closeModal();
      }
    });
    
    document.body.appendChild(container);
    
    // Trigger fade in
    setTimeout(() => {
      container.style.opacity = '1';
    }, 10);
    
    return container;
  }

  // Create modal content
  function createModalContent(type, data) {
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      transform: scale(0.95);
      transition: transform 0.3s ease;
    `;

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '×';
    closeBtn.style.cssText = `
      position: absolute;
      top: 16px;
      right: 16px;
      background: #f3f4f6;
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      color: #6b7280;
      cursor: pointer;
      z-index: 10;
      transition: background-color 0.2s;
    `;
    
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.backgroundColor = '#e5e7eb';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.backgroundColor = '#f3f4f6';
    });
    
    closeBtn.addEventListener('click', closeModal);
    
    content.appendChild(closeBtn);
    
    // Trigger scale animation
    setTimeout(() => {
      content.style.transform = 'scale(1)';
    }, 10);

    return content;
  }

  // Create guest details modal
  function createGuestDetailsModal(data) {
    const content = createModalContent('guest', data);
    content.innerHTML += `
      <div style="padding: 32px;">
        <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 24px;">Guest Details</h2>
        
        <!-- Booking Summary -->
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">Booking Summary</h3>
          <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">${data.unitName} - ${data.buildingName}</p>
          <p style="font-size: 14px; color: #6b7280; margin: 4px 0;"><strong>From:</strong> ${data.checkIn}</p>
          <p style="font-size: 14px; color: #6b7280; margin: 4px 0;"><strong>To:</strong> ${data.checkOut}</p>
          <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">(${data.nights} nights)</p>
          <p style="font-size: 14px; font-weight: 600; color: #1f2937; margin-top: 8px;"><strong>Total Amount:</strong> ${data.totalPrice}</p>
          <p style="font-size: 12px; color: #6b7280;">(VAT incl.)</p>
        </div>

        <!-- Guest Form -->
        <form id="guest-form" style="space-y: 16px;">
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">First Name *</label>
            <input type="text" id="firstName" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" placeholder="John">
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Last Name *</label>
            <input type="text" id="lastName" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" placeholder="Doe">
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Email Address *</label>
            <input type="email" id="email" required style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" placeholder="john@example.com">
          </div>
          
          <div style="margin-bottom: 24px;">
            <label style="display: block; font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">Phone Number</label>
            <input type="tel" id="phone" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;" placeholder="+46 70 123 4567">
          </div>
          
          <div style="display: flex; gap: 12px;">
            <button type="button" onclick="closeModal()" style="flex: 1; background: #d1d5db; color: #374151; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; transition: background-color 0.2s;">Back</button>
            <button type="submit" style="flex: 1; background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; transition: background-color 0.2s;">Continue to Payment</button>
          </div>
        </form>
      </div>
    `;

    // Handle form submission
    const form = content.querySelector('#guest-form');
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const guestDetails = {
        firstName: content.querySelector('#firstName').value,
        lastName: content.querySelector('#lastName').value,
        email: content.querySelector('#email').value,
        phone: content.querySelector('#phone').value
      };

      // Send guest details back to iframe
      sendMessageToIframe({
        type: 'GUEST_DETAILS_SUBMITTED',
        data: guestDetails
      });

      closeModal();
    });

    return content;
  }

  // Create payment modal
  function createPaymentModal(data) {
    const content = createModalContent('payment', data);
    content.innerHTML += `
      <div style="padding: 32px;">
        <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 24px;">Payment</h2>
        
        <!-- Booking Summary -->
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">Booking Summary</h3>
          <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">${data.propertyName}</p>
          <p style="font-size: 14px; color: #6b7280; margin: 4px 0;"><strong>Guest:</strong> ${data.guestName}</p>
          <p style="font-size: 14px; color: #6b7280; margin: 4px 0;"><strong>Dates:</strong> ${data.checkIn} - ${data.checkOut}</p>
          <p style="font-size: 14px; color: #6b7280; margin: 4px 0;">(${data.nights} nights)</p>
          <p style="font-size: 18px; font-weight: bold; color: #1f2937; margin-top: 8px;">Total: ${data.totalAmount}</p>
        </div>

        <!-- Payment will be handled by Stripe in iframe -->
        <div style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 16px; color: #6b7280; margin-bottom: 20px;">
            Processing payment...
          </div>
          <div style="margin-bottom: 20px;">
            <div style="display: inline-block; width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #2563eb; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          </div>
          <p style="font-size: 14px; color: #9ca3af;">
            You'll be redirected to complete the payment securely.
          </p>
        </div>

        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button type="button" onclick="goBackToGuestDetails()" style="flex: 1; background: #d1d5db; color: #374151; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">Back</button>
        </div>
      </div>
      
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;

    return content;
  }

  // Create confirmation modal
  function createConfirmationModal(data) {
    const content = createModalContent('confirmation', data);
    content.innerHTML += `
      <div style="padding: 32px; text-align: center;">
        <div style="width: 64px; height: 64px; background: #10b981; border-radius: 50%; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center;">
          <svg style="width: 32px; height: 32px; color: white;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
          </svg>
        </div>
        
        <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 16px;">Booking Confirmed & Paid!</h2>
        
        <div style="text-align: left; background: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 8px 0; color: #6b7280;"><strong>Booking Reference:</strong> ${data.bookingReference}</p>
          <p style="margin: 8px 0; color: #6b7280;"><strong>Guest:</strong> ${data.guestName}</p>
          <p style="margin: 8px 0; color: #6b7280;"><strong>Check-in:</strong> ${data.checkIn}</p>
          <p style="margin: 8px 0; color: #6b7280;"><strong>Check-out:</strong> ${data.checkOut}</p>
          ${data.paymentReference ? `<p style="margin: 8px 0; color: #6b7280;"><strong>Payment Reference:</strong> ${data.paymentReference}</p>` : ''}
          ${data.paymentAmount ? `<p style="margin: 8px 0; color: #6b7280;"><strong>Amount Paid:</strong> ${data.paymentAmount}</p>` : ''}
        </div>
        
        <button onclick="makeAnotherBooking()" style="width: 100%; background: #2563eb; color: white; padding: 12px 16px; border: none; border-radius: 6px; cursor: pointer; margin-top: 24px;">
          Make Another Booking
        </button>
      </div>
    `;

    return content;
  }

  // Open modal based on type
  function openModal(type, data) {
    closeModal(); // Close any existing modal
    
    modalData = data;
    currentModal = createModalContainer();
    
    let content;
    switch(type) {
      case 'OPEN_GUEST_MODAL':
        content = createGuestDetailsModal(data);
        break;
      case 'OPEN_PAYMENT_MODAL':
        content = createPaymentModal(data);
        break;
      case 'OPEN_CONFIRMATION_MODAL':
        content = createConfirmationModal(data);
        break;
      default:
        console.warn('Unknown modal type:', type);
        return;
    }
    
    currentModal.appendChild(content);
    document.body.style.overflow = 'hidden';
  }

  // Close modal
  function closeModal() {
    if (currentModal) {
      currentModal.style.opacity = '0';
      setTimeout(() => {
        if (currentModal && currentModal.parentNode) {
          currentModal.parentNode.removeChild(currentModal);
        }
        currentModal = null;
        modalData = null;
        document.body.style.overflow = '';
      }, 300);
      
      // Notify iframe that modal was closed
      sendMessageToIframe({
        type: 'MODAL_CLOSED'
      });
    }
  }

  // Send message to iframe
  function sendMessageToIframe(message) {
    console.log('[WEBFLOW DEBUG] Sending message to iframe:', message);
    // Try multiple selectors to find the iframe
    const selectors = ['iframe', '[src*="lovable"]', '[src*="vercel"]', '#booking-iframe', '.booking-iframe'];
    let iframe = null;
    
    for (const selector of selectors) {
      iframe = document.querySelector(selector);
      if (iframe) {
        console.log('[WEBFLOW DEBUG] Found iframe with selector:', selector);
        break;
      }
    }
    
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(message, '*');
      console.log('[WEBFLOW DEBUG] Message sent successfully');
    } else {
      console.log('[WEBFLOW DEBUG] No iframe found with any selector');
    }
  }

  // Global functions for buttons
  window.closeModal = closeModal;
  
  window.goBackToGuestDetails = function() {
    sendMessageToIframe({
      type: 'GO_BACK_TO_GUEST_DETAILS'
    });
    closeModal();
  };
  
  window.makeAnotherBooking = function() {
    sendMessageToIframe({
      type: 'MAKE_ANOTHER_BOOKING'
    });
    closeModal();
  };

  // Listen for messages from iframe
  window.addEventListener('message', function(event) {
    console.log('[WEBFLOW DEBUG] Received message:', event.data, 'from origin:', event.origin);
    
    // Add origin validation in production
    // if (event.origin !== IFRAME_ORIGIN) {
    //   console.log('[WEBFLOW DEBUG] Origin mismatch, ignoring message');
    //   return;
    // }
    
    const message = event.data;
    if (!message || !message.type) {
      console.log('[WEBFLOW DEBUG] Invalid message format');
      return;
    }

    console.log('[WEBFLOW DEBUG] Processing message type:', message.type);

    switch(message.type) {
      case 'OPEN_GUEST_MODAL':
      case 'OPEN_PAYMENT_MODAL':
      case 'OPEN_CONFIRMATION_MODAL':
        console.log('[WEBFLOW DEBUG] Opening modal:', message.type);
        openModal(message.type, message.data);
        break;
      case 'CLOSE_MODAL':
        console.log('[WEBFLOW DEBUG] Closing modal');
        closeModal();
        break;
      default:
        console.log('[WEBFLOW DEBUG] Unknown message type:', message.type);
    }
  });

  // Handle ESC key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && currentModal) {
      closeModal();
    }
  });

  console.log('[WEBFLOW DEBUG] Iframe modal integration loaded');
  console.log('[WEBFLOW DEBUG] Looking for iframes on page...');
  
  // Debug: list all iframes found
  const allIframes = document.querySelectorAll('iframe');
  console.log('[WEBFLOW DEBUG] Found', allIframes.length, 'iframes:', allIframes);
})();