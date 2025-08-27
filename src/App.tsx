import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Calendar, Users, MapPin, Phone, Mail, User, CreditCard, CheckCircle, ArrowLeft, Sparkles, ArrowRight } from 'lucide-react';
import SearchForm from './components/SearchForm';
import ProcessContent from './components/ProcessContent';

// TypeScript interfaces
interface SearchParams {
  startDate: string;
  endDate: string;
  guests: number;
}

interface Rate {
  rateId: number;
  rateName: string;
  currency: string;
  currencySymbol: string;
  totalPrice: number;
  avgNightlyRate: number;
  nights: number;
  description?: string;
}

interface Unit {
  buildingId: number;
  buildingName: string;
  inventoryTypeId: number;
  inventoryTypeName: string;
  rates: Rate[];
}

interface SelectedUnit extends Unit {
  selectedRate: Rate;
}

interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface BookingDetails {
  bookingId: number;
  bookingReference: string;
  status: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  paymentReference?: string;
  paymentAmount?: number;
}

const App: React.FC = () => {
  // Get inventory type ID from URL
  const { inventoryTypeId } = useParams<{ inventoryTypeId?: string }>();
  const filterByInventoryTypeId = inventoryTypeId ? parseInt(inventoryTypeId, 10) : null;
  
  console.log('App component loaded - inventory filter removed, using URL-based filtering:', filterByInventoryTypeId);
  
  // Refs
  const resultsSectionRef = useRef<HTMLDivElement>(null);
  const confirmationSectionRef = useRef<HTMLDivElement>(null);

  // Main state
  const [selectedUnit, setSelectedUnit] = useState<SelectedUnit | null>(null);
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Search state
  const [searchParams, setSearchParams] = useState<SearchParams>({
    startDate: '',
    endDate: '',
    guests: 1
  });
  const [availability, setAvailability] = useState<Unit[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<SearchParams | null>(null);

  // ====================
  // ENHANCED IFRAME HEIGHT COMMUNICATION
  // ====================
  useEffect(() => {
    // Check if app is running inside an iframe
    const isInIframe = window.parent !== window;
    
    if (!isInIframe) return;

    let isUpdating = false;
    let heightUpdateTimeout: NodeJS.Timeout;

    // FIXED: Enhanced visible content height calculation specifically for forms
    const calculateVisibleHeight = (): number => {
      try {
        const isMobile = window.innerWidth <= 768;
        
        // PRIORITY METHOD: Check for active form content first
        const getActiveFormHeight = (): number => {
          // Check for GuestDetails form
          if (showBookingForm && selectedUnit) {
            const guestForm = document.querySelector('[data-form="guest-details"], .guest-details-form, [data-content-section="guest-details-wrapper"]') as HTMLElement;
            if (guestForm) {
              const rect = guestForm.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              return Math.ceil(rect.bottom + scrollTop + (isMobile ? 20 : 40));
            }
            
            // Fallback: look for any visible form container with guest details content
            const formContainers = document.querySelectorAll('.min-h-screen, .bg-\\[\\#FCFBF7\\], .animate-slide-up') as NodeListOf<HTMLElement>;
            for (const container of formContainers) {
              if (container.offsetHeight > 0 && window.getComputedStyle(container).display !== 'none') {
                const rect = container.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                return Math.ceil(rect.bottom + scrollTop + (isMobile ? 20 : 40));
              }
            }
          }

          // Check for StripePayment form
          if (showPaymentForm && selectedUnit) {
            const paymentForm = document.querySelector('[data-form="payment"], .stripe-payment-form, .payment-form, [data-content-section="payment-wrapper"]') as HTMLElement;
            if (paymentForm) {
              const rect = paymentForm.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              return Math.ceil(rect.bottom + scrollTop + (isMobile ? 20 : 40));
            }
            
            // Fallback: look for Stripe Elements or payment containers
            const paymentContainers = document.querySelectorAll('.min-h-screen:has(h1), .bg-\\[\\#FCFBF7\\]:has(h1)') as NodeListOf<HTMLElement>;
            for (const container of paymentContainers) {
              if (container.offsetHeight > 0 && window.getComputedStyle(container).display !== 'none') {
                const rect = container.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                return Math.ceil(rect.bottom + scrollTop + (isMobile ? 20 : 40));
              }
            }
          }

          // Check for booking confirmation
          if (bookingComplete && bookingDetails) {
            const confirmationEl = document.querySelector('[data-form="confirmation"], .booking-confirmation, [data-content-section="booking-confirmation"]') as HTMLElement;
            if (confirmationEl) {
              const rect = confirmationEl.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              return Math.ceil(rect.bottom + scrollTop + (isMobile ? 20 : 40));
            }
          }

          return 0;
        };

        // SECONDARY METHOD: Look for visible content sections using data attributes
        const getDataAttributeHeight = (): number => {
          let maxHeight = 0;
          
          // Get all visible content sections
          const visibleSections = document.querySelectorAll('[data-visible="true"], [data-content-section]') as NodeListOf<HTMLElement>;
          
          visibleSections.forEach(section => {
            if (section.offsetHeight > 0 && window.getComputedStyle(section).display !== 'none') {
              const rect = section.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              const sectionBottom = rect.bottom + scrollTop;
              maxHeight = Math.max(maxHeight, sectionBottom);
            }
          });

          return maxHeight;
        };

        // FALLBACK METHOD: Calculate based on all visible elements (improved)
        const getVisibleElementsHeight = (): number => {
          const elements = document.querySelectorAll('*') as NodeListOf<HTMLElement>;
          let maxBottom = 0;
          
          elements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            
            // Skip hidden elements
            if (
              computedStyle.display === 'none' || 
              computedStyle.visibility === 'hidden' ||
              computedStyle.opacity === '0' ||
              element.offsetHeight === 0
            ) {
              return;
            }

            // Skip elements that are positioned absolutely/fixed outside normal flow
            if (computedStyle.position === 'fixed' && element.offsetParent === null) {
              return;
            }

            const rect = element.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const elementBottom = rect.bottom + scrollTop;
            
            // On mobile, be more conservative about max height
            if (isMobile && elementBottom > window.innerHeight * 3) {
              return;
            }
            
            maxBottom = Math.max(maxBottom, elementBottom);
          });

          return maxBottom;
        };

        // Use the methods in priority order
        const activeFormHeight = getActiveFormHeight();
        if (activeFormHeight > 0) {
          console.log('Using active form height:', activeFormHeight, { showBookingForm, showPaymentForm, bookingComplete });
          return activeFormHeight;
        }

        const dataAttributeHeight = getDataAttributeHeight();
        if (dataAttributeHeight > 0) {
          console.log('Using data attribute height:', dataAttributeHeight);
          return dataAttributeHeight;
        }

        const visibleElementsHeight = getVisibleElementsHeight();
        if (visibleElementsHeight > 0) {
          console.log('Using visible elements height:', visibleElementsHeight);
          return visibleElementsHeight;
        }

        // Final fallback
        const fallbackHeight = isMobile ? 
          Math.min(document.body.offsetHeight || 150, window.innerHeight * 1.5) : 
          Math.max(document.body.offsetHeight || 180, 180);
        
        console.log('Using fallback height:', fallbackHeight);
        return fallbackHeight;

      } catch (error) {
        console.error('Error calculating visible height:', error);
        return isMobile ? 150 : 180;
      }
    };

    // Enhanced function to send height to parent
    const sendHeight = () => {
      if (isUpdating) return;
      
      try {
        const height = calculateVisibleHeight();
        const isMobile = window.innerWidth <= 768;
        
        // Add minimum constraints based on current state
        let minHeight = isMobile ? 150 : 180;
        
        if (showBookingForm || showPaymentForm) {
          minHeight = isMobile ? 400 : 500; // Forms need more height
        } else if (bookingComplete) {
          minHeight = isMobile ? 300 : 350; // Confirmation needs decent height
        }
        
        const finalHeight = Math.max(height, minHeight);
        
        window.parent.postMessage(
          { 
            type: 'iframe-height',
            height: finalHeight,
            timestamp: Date.now(),
            context: {
              showBookingForm,
              showPaymentForm,
              bookingComplete,
              isMobile
            }
          }, 
          '*'
        );
        
        console.log('Sent height to parent:', finalHeight, {
          calculated: height,
          minHeight,
          showBookingForm,
          showPaymentForm,
          bookingComplete
        });
      } catch (error) {
        console.error('Failed to send height to parent:', error);
      }
    };

    // Send initial height after content loads
    const initTimer = setTimeout(() => {
      sendHeight();
    }, 300);

    // Enhanced message handler
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'request-height') {
        console.log('Height requested from parent, responding...');
        sendHeight();
      }
      
      if (event.data && event.data.type === 'height-updated') {
        isUpdating = true;
        setTimeout(() => { isUpdating = false; }, 200);
      }
      
      if (event.data && event.data.type === 'window-resize') {
        console.log('Window resize detected, recalculating height...');
        setTimeout(sendHeight, 100);
      }
      
      if (event.data && event.data.type === 'content-visibility-change') {
        console.log('Content visibility changed, updating height...');
        setTimeout(sendHeight, 100);
      }
    };
    
    window.addEventListener('message', handleMessage);

    // Enhanced Mutation Observer for better form detection
    let mutationObserver: MutationObserver | null = null;
    
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach(mutation => {
          // Check if any form-related elements were added/removed/modified
          if (mutation.type === 'childList') {
            const addedNodes = Array.from(mutation.addedNodes) as HTMLElement[];
            const removedNodes = Array.from(mutation.removedNodes) as HTMLElement[];
            
            [...addedNodes, ...removedNodes].forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                
                // Check for form-related classes
                const formClasses = [
                  'guest-details', 'payment-form', 'stripe-payment', 
                  'booking-confirmation', 'min-h-screen', 'animate-slide-up'
                ];
                
                if (formClasses.some(cls => 
                  element.classList?.contains(cls) || 
                  element.querySelector?.(`.${cls}`)
                )) {
                  shouldUpdate = true;
                }
              }
            });
          }
          
          // Check for attribute changes on key elements
          if (mutation.type === 'attributes' && mutation.target) {
            const target = mutation.target as HTMLElement;
            if (
              mutation.attributeName === 'style' || 
              mutation.attributeName === 'class' ||
              mutation.attributeName === 'data-visible'
            ) {
              shouldUpdate = true;
            }
          }
        });
        
        if (shouldUpdate) {
          clearTimeout(heightUpdateTimeout);
          heightUpdateTimeout = setTimeout(sendHeight, 150);
        }
      });
      
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'data-visible']
      });
    }

    // Resize Observer for element size changes
    let resizeObserver: ResizeObserver | null = null;
    
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        clearTimeout(heightUpdateTimeout);
        heightUpdateTimeout = setTimeout(sendHeight, 50);
      });
      
      // Observe the main container
      const mainContainer = document.body.firstElementChild as Element;
      if (mainContainer) {
        resizeObserver.observe(mainContainer);
      }
    }

    // Cleanup
    return () => {
      clearTimeout(initTimer);
      clearTimeout(heightUpdateTimeout);
      window.removeEventListener('message', handleMessage);
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [showBookingForm, showPaymentForm, bookingComplete, selectedUnit, bookingDetails]); // Re-run when form states change

  // Form state change notification to iframe container
  useEffect(() => {
    const isInIframe = window.parent !== window;
    
    if (isInIframe) {
      // Notify parent of form state change
      window.parent.postMessage({
        type: 'form-state-change',
        context: {
          showBookingForm,
          showPaymentForm, 
          bookingComplete,
          hasSelectedUnit: !!selectedUnit,
          hasBookingDetails: !!bookingDetails
        }
      }, '*');
      
      // Also send an immediate height update
      setTimeout(() => {
        window.parent.postMessage({ type: 'request-height' }, '*');
      }, 100);
    }
  }, [showBookingForm, showPaymentForm, bookingComplete, selectedUnit, bookingDetails]);

  // Enhanced state change height updates
  useEffect(() => {
    const isInIframe = window.parent !== window;
    if (!isInIframe) return;

    // Send height update when these states change
    const sendHeightUpdate = () => {
      try {
        // Use the enhanced calculation method
        const height = Math.max(
          document.documentElement.scrollHeight || 0,
          document.body.scrollHeight || 0,
          document.documentElement.offsetHeight || 0,
          document.body.offsetHeight || 0
        );
        
        window.parent.postMessage(
          { 
            type: 'iframe-height',
            height: height,
            source: 'state-change',
            timestamp: Date.now()
          }, 
          '*'
        );
        
        console.log('Height updated due to state change:', height);
      } catch (error) {
        console.error('Failed to send height update:', error);
      }
    };

    // Small delay to ensure DOM has updated
    const timer = setTimeout(sendHeightUpdate, 150);
    
    return () => clearTimeout(timer);
  }, [availability, selectedUnit, showBookingForm, showPaymentForm, bookingComplete, hasSearched, error, loading]);

  // Scroll to confirmation when booking completes
  useEffect(() => {
    if (bookingComplete && confirmationSectionRef.current) {
      setTimeout(() => {
        confirmationSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  }, [bookingComplete]);
  
  // ====================
  // END ENHANCED IFRAME HEIGHT COMMUNICATION
  // ====================

  // Photo mapping based on inventoryTypeId
  const getPropertyImage = (inventoryTypeId: number): string => {
    const imageMap: {
      [key: number]: string;
    } = {
      38: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/680a675aca567cd974c649a9_ANG-Studio-ThumbnailComp-min.png',
      11: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/65b03be9ae7287d722a74fc7_1-p-1600.png',
      10: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/65b03bc52fbd20a5ad097a7c_1-p-1600.jpg'
    };
    return imageMap[inventoryTypeId] || 'https://via.placeholder.com/400x240/e5e7eb/9ca3af?text=Photo+Coming+Soon';
  };
  const API_BASE_URL = 'https://short-stay-backend.vercel.app/api';

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 3); // minimum 3 nights

    setSearchParams({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      guests: 1
    });
  }, []);

  // Simple currency formatter
  const formatCurrency = (amount: number): string => {
    try {
      const num = parseFloat(amount?.toString() || '0') || 0;
      return `${num.toLocaleString('sv-SE')} SEK`;
    } catch (e) {
      return '0 SEK';
    }
  };

  // Calculate nights based on search params
  const calculateNights = (): number => {
    if (!searchParams.startDate || !searchParams.endDate) return 0;
    const start = new Date(searchParams.startDate);
    const end = new Date(searchParams.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Format date with weekday (e.g., "Monday, 07 Jul 2025")
  const formatDateWithWeekday = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };
      return date.toLocaleDateString('en-GB', options);
    } catch (e) {
      return dateString;
    }
  };

  // Format date for display (dd/mm/yyyy)
  const formatDisplayDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return dateString;
    }
  };

  // Get minimum end date (always 3 nights minimum)
  const getMinEndDate = (): string => {
    if (!searchParams.startDate) return '';
    const minDate = new Date(searchParams.startDate);
    minDate.setDate(minDate.getDate() + 3);
    return minDate.toISOString().split('T')[0];
  };

  // Auto-update checkout date when checkin changes
  useEffect(() => {
    if (searchParams.startDate) {
      const checkIn = new Date(searchParams.startDate);
      const checkOut = new Date(searchParams.endDate);
      if (!searchParams.endDate || checkOut <= checkIn) {
        const newCheckOut = new Date(checkIn);
        newCheckOut.setDate(newCheckOut.getDate() + 3);
        setSearchParams(prev => ({
          ...prev,
          endDate: newCheckOut.toISOString().split('T')[0]
        }));
      }
    }
  }, [searchParams.startDate]);

  // Search for availability
  const searchAvailability = async (): Promise<void> => {
    if (!searchParams.startDate || !searchParams.endDate) {
      setError('Please select check-in and check-out dates');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        startDate: searchParams.startDate,
        endDate: searchParams.endDate,
        guests: searchParams.guests.toString()
      });
      const response = await fetch(`${API_BASE_URL}/availability/search?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success && data.data) {
        const searchNights = calculateNights();
        const transformedData = data.data.map((property: any) => {
          return {
            buildingId: property.buildingId || 0,
            buildingName: property.buildingName || 'Unknown Building',
            inventoryTypeId: property.inventoryTypeId || 0,
            inventoryTypeName: property.inventoryTypeName || 'Unknown Unit',
            rates: (property.rates || []).map((rate: any) => {
              return {
                rateId: rate.rateId || 0,
                rateName: rate.rateName || 'Standard Rate',
                currency: rate.currency || 'SEK',
                currencySymbol: rate.currencySymbol || 'SEK',
                totalPrice: rate.totalPrice?.gross || rate.totalPrice || 0,
                avgNightlyRate: rate.avgNightlyRate || 0,
                nights: searchNights,
                description: rate.description || ''
              };
            })
          };
        });
        
        // Filter by inventory type ID from URL if specified
        const filteredData = filterByInventoryTypeId 
          ? transformedData.filter((u: any) => u.inventoryTypeId === filterByInventoryTypeId)
          : transformedData;
        
        setAvailability(filteredData);
        setLastSearchParams({
          ...searchParams
        });
        setHasSearched(true);

        // Show search results - don't auto-select
        // Only scroll to results section if there are actual results
        if (filteredData.length > 0) {
          setTimeout(() => {
            resultsSectionRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }, 100);
        }
      } else {
        setError(data.message || 'No availability found');
        setAvailability([]);
        setLastSearchParams({
          ...searchParams
        });
        setHasSearched(true);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(`Failed to search availability: ${err.message}`);
      setAvailability([]);
      setLastSearchParams({
        ...searchParams
      });
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // Select unit and rate
  const selectUnit = (unit: Unit, rate: Rate): void => {
    setSelectedUnit({
      ...unit,
      selectedRate: rate
    });
    setShowBookingForm(true);
  };

  // Handle guest details submission
  const handleGuestDetailsSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setShowBookingForm(false);
    setShowPaymentForm(true);
  };

  // Handle Stripe payment success
  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    try {
      setLoading(true);
      const bookingData = {
        guestDetails,
        stayDetails: lastSearchParams!,
        unitDetails: {
          inventoryTypeId: selectedUnit!.inventoryTypeId,
          rateId: selectedUnit!.selectedRate.rateId,
          buildingName: selectedUnit!.buildingName,
          inventoryTypeName: selectedUnit!.inventoryTypeName
        },
        paymentDetails: {
          amount: selectedUnit!.selectedRate.totalPrice,
          cardNumber: '4111111111111111',
          cardholderName: `${guestDetails.firstName} ${guestDetails.lastName}`,
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123',
          cardType: 'VISA_CREDIT',
          lastFour: '1111'
        },
        stripePaymentIntentId: paymentIntentId
      };
      const response = await fetch(`${API_BASE_URL}/booking/create-with-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });
      const data = await response.json();
      if (data.success) {
        setBookingDetails(data.data);
        setBookingComplete(true);
        setShowPaymentForm(false);
      } else {
        setError(data.message || 'Failed to create booking');
        if (data.stripePaymentSuccessful) {
          setError('Payment was successful but booking creation failed. Please contact support with reference: ' + paymentIntentId);
        }
      }
    } catch (err) {
      console.error('Booking error:', err);
      setError('Failed to create booking. If payment was processed, please contact support.');
    } finally {
      setLoading(false);
    }
  };

  // Handle back from payment form
  const handleBackFromPayment = (): void => {
    setShowPaymentForm(false);
    setShowBookingForm(true);
  };

  // Handle modal backdrop click
  const handleModalBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowBookingForm(false);
    }
  };

  // Reset to search
  const resetToSearch = (): void => {
    setBookingComplete(false);
    setShowPaymentForm(false);
    setShowBookingForm(false);
    setSelectedUnit(null);
    setGuestDetails({
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    });
    setError('');
  };

  // Handle search with reset
  const handleSearch = (): void => {
    // Reset any ongoing booking process
    setShowBookingForm(false);
    setShowPaymentForm(false);
    setBookingComplete(false);
    setSelectedUnit(null);
    // Perform search
    searchAvailability();
  };

  // Main interface with enhanced data attributes for height calculation
  return (
    <div style={{backgroundColor: 'transparent'}} data-app-container data-main-content>
      {/* DIV 1 - Search Section (Always exists) */}
      <div data-content-section="search" data-visible="true">
        <SearchForm 
          searchParams={searchParams} 
          setSearchParams={setSearchParams} 
          onSearch={handleSearch} 
          loading={loading} 
          getMinEndDate={getMinEndDate} 
          error={hasSearched && !loading && availability.length === 0 ? "Dates unavailable" : ""} 
        />
      </div>

      {/* DIV 2 - Process Content (Only render if there's content to show) */}
      {(availability.length > 0 || showBookingForm || showPaymentForm || bookingComplete) && (
        <div 
          ref={resultsSectionRef} 
          data-content-section="results" 
          data-visible="true"
        >
          <ProcessContent
            availability={availability}
            hasSearched={hasSearched}
            confirmedSearchParams={lastSearchParams || searchParams}
            onSelectUnit={selectUnit}
            calculateNights={calculateNights}
            showBookingForm={showBookingForm}
            selectedUnit={selectedUnit}
            guestDetails={guestDetails}
            setGuestDetails={setGuestDetails}
            onGuestDetailsSubmit={handleGuestDetailsSubmit}
            onBackFromGuestDetails={() => setShowBookingForm(false)}
            error={error}
            showPaymentForm={showPaymentForm}
            onPaymentSuccess={handleStripePaymentSuccess}
            onBackFromPayment={handleBackFromPayment}
            bookingComplete={bookingComplete}
            bookingDetails={bookingDetails}
            onReset={resetToSearch}
            confirmationRef={confirmationSectionRef}
          />
        </div>
      )}
    </div>
  );
};

export default App;