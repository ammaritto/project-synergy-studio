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

    // Enhanced visible content height calculation with modal/form handling
    const calculateVisibleHeight = (): number => {
      try {
        const isMobile = window.innerWidth <= 768;
        const viewportHeight = window.innerHeight;
        
        // STRICT mobile height limits
        const MOBILE_MAX_HEIGHT = 1200;
        const MOBILE_FORM_MAX = 800; // Special limit for forms/modals
        
        // Method 1: Smart visible elements calculation (Modal-aware)
        let calculatedHeight = 0;
        
        // Skip modal/overlay calculations that cause issues
        const problematicSelectors = [
          '.modal-backdrop',
          '.overlay',
          '.fixed',
          '[style*="position: fixed"]',
          '[style*="position: absolute"]',
          '.booking-form-modal', // Add your modal class names here
          '.payment-form-modal'
        ];
        
        const visibleElements = document.querySelectorAll('*:not(' + problematicSelectors.join(',') + ')');
        
        visibleElements.forEach((element) => {
          const el = element as HTMLElement;
          const computedStyle = window.getComputedStyle(el);
          
          // Skip hidden elements
          if (
            computedStyle.display === 'none' || 
            computedStyle.visibility === 'hidden' ||
            computedStyle.opacity === '0' ||
            el.offsetHeight === 0
          ) {
            return;
          }

          // Skip fixed/absolute positioned elements on mobile (common cause of height issues)
          if (isMobile && (computedStyle.position === 'fixed' || computedStyle.position === 'absolute')) {
            return;
          }

          // Skip elements that are clearly outside normal document flow
          const rect = el.getBoundingClientRect();
          if (isMobile) {
            // Skip elements with unusual dimensions
            if (rect.width === 0 && rect.height === 0) return;
            if (rect.height > viewportHeight * 2) return; // Skip overly tall elements
          }

          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const elementBottom = rect.bottom + scrollTop;
          
          calculatedHeight = Math.max(calculatedHeight, elementBottom);
        });

        // Method 2: Form/Modal-aware container calculation
        const getFormAwareHeight = (): number => {
          // Check if we're in a form/modal state
          const isInFormState = showBookingForm || showPaymentForm;
          
          if (isMobile && isInFormState) {
            // For mobile forms, use a more conservative approach
            const formSelectors = [
              '.booking-form:not(.modal)',
              '.payment-form:not(.modal)',
              '[data-content-section="booking"]',
              '[data-content-section="payment"]'
            ];
            
            let formHeight = 0;
            formSelectors.forEach(selector => {
              const element = document.querySelector(selector) as HTMLElement;
              if (element && window.getComputedStyle(element).display !== 'none') {
                const rect = element.getBoundingClientRect();
                formHeight = Math.max(formHeight, rect.height);
              }
            });
            
            // Add search form height to form height for total
            const searchForm = document.querySelector('.search-form') as HTMLElement;
            const searchHeight = searchForm ? searchForm.offsetHeight : 180;
            
            return Math.min(searchHeight + formHeight + 50, MOBILE_FORM_MAX); // 50px padding
          }
          
          // Regular container detection for non-form states
          const containerSelectors = [
            '[data-app-container]',
            '[data-main-content]',
            '.app-container'
          ];

          for (const selector of containerSelectors) {
            const container = document.querySelector(selector) as HTMLElement;
            if (container && container.offsetHeight > 0) {
              const rect = container.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              const containerHeight = Math.ceil(rect.bottom + scrollTop);
              
              // Cap mobile container height
              if (isMobile) {
                return Math.min(containerHeight, MOBILE_MAX_HEIGHT);
              }
              return containerHeight;
            }
          }
          return 0;
        };

        // Method 3: Conservative viewport-based calculation
        const getConservativeHeight = (): number => {
          const contentSections = document.querySelectorAll('[data-content-section][data-visible="true"]');
          let totalHeight = 0;
          
          contentSections.forEach(section => {
            const element = section as HTMLElement;
            if (window.getComputedStyle(element).display !== 'none') {
              totalHeight += element.offsetHeight;
            }
          });
          
          // Add some padding
          totalHeight += 40;
          
          // Strict mobile limits
          if (isMobile) {
            if (showBookingForm || showPaymentForm) {
              return Math.min(totalHeight, MOBILE_FORM_MAX);
            } else {
              return Math.min(totalHeight, MOBILE_MAX_HEIGHT);
            }
          }
          
          return totalHeight;
        };

        // Get heights from all methods
        const method1Height = calculatedHeight;
        const method2Height = getFormAwareHeight();
        const method3Height = getConservativeHeight();

        // Choose height with mobile-specific logic
        let finalHeight;
        if (isMobile) {
          // On mobile, be very conservative, especially for forms
          const heights = [method1Height, method2Height, method3Height].filter(h => h > 0 && h <= MOBILE_MAX_HEIGHT);
          
          if (showBookingForm || showPaymentForm) {
            // For forms, use the smallest reasonable height and cap strictly
            finalHeight = Math.min(...heights.filter(h => h > 100)) || Math.min(...heights, MOBILE_FORM_MAX);
            finalHeight = Math.min(finalHeight, MOBILE_FORM_MAX);
          } else {
            // For regular content, use conservative approach
            finalHeight = Math.min(...heights.filter(h => h > 100)) || Math.min(...heights, MOBILE_MAX_HEIGHT);
            finalHeight = Math.min(finalHeight, MOBILE_MAX_HEIGHT);
          }
          
          finalHeight = Math.max(finalHeight, 150); // Ensure minimum
        } else {
          finalHeight = Math.max(...[method1Height, method2Height, method3Height].filter(h => h > 0), 180);
        }

        // Enhanced debug logging
        console.log('Height calculation methods:', {
          isMobile,
          showBookingForm,
          showPaymentForm,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          visibleElements: method1Height,
          formAware: method2Height,
          conservative: method3Height,
          chosen: finalHeight,
          cappedAt: isMobile ? (showBookingForm || showPaymentForm ? MOBILE_FORM_MAX : MOBILE_MAX_HEIGHT) : 'none'
        });

        return Math.ceil(finalHeight);
      } catch (error) {
        console.error('Error calculating visible height:', error);
        // Mobile-optimized fallback with strict limits
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          const conservativeFallback = showBookingForm || showPaymentForm ? 600 : 400;
          return Math.min(document.body.offsetHeight || conservativeFallback, conservativeFallback);
        }
        return Math.max(document.body.offsetHeight || 180, 180);
      }
    };

    // Enhanced function to send height to parent
    const sendHeight = () => {
      // Prevent recursive updates
      if (isUpdating) return;
      
      try {
        const height = calculateVisibleHeight();
        
        // Send height to parent window
        window.parent.postMessage(
          { 
            type: 'iframe-height',
            height: height,
            timestamp: Date.now()
          }, 
          '*' // In production, replace with your Webflow domain for security
        );
        
        console.log('Sent visible height to parent:', height);
      } catch (error) {
        console.error('Failed to send height to parent:', error);
      }
    };

    // Send initial height after content loads
    const initTimer = setTimeout(() => {
      sendHeight();
    }, 500); // Reduced from 1000ms for faster initial sizing

    // Enhanced message handler
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'request-height') {
        console.log('Height requested from parent, responding...');
        sendHeight();
      }
      
      // Mark that we're updating to prevent loops
      if (event.data && event.data.type === 'height-updated') {
        isUpdating = true;
        setTimeout(() => { isUpdating = false; }, 300); // Reduced timeout
      }
      
      // Handle window resize from parent
      if (event.data && event.data.type === 'window-resize') {
        console.log('Window resize detected, recalculating height...');
        setTimeout(sendHeight, 100);
      }
      
      // Handle visibility change
      if (event.data && event.data.type === 'content-visibility-change') {
        console.log('Content visibility changed, updating height...');
        setTimeout(sendHeight, 100);
      }
    };
    
    window.addEventListener('message', handleMessage);

    // Mutation Observer to detect DOM changes
    let mutationObserver: MutationObserver | null = null;
    
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
          // Check if nodes were added/removed or attributes changed
          if (mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
            shouldUpdate = true;
          }
          if (mutation.type === 'attributes' && 
              (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
            shouldUpdate = true;
          }
        });
        
        if (shouldUpdate) {
          // Clear existing timeout
          clearTimeout(heightUpdateTimeout);
          // Debounce the height update
          heightUpdateTimeout = setTimeout(sendHeight, 100);
        }
      });
      
      // Observe the entire document for changes
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
  }, []);

  // Enhanced state change height updates
  useEffect(() => {
    const isInIframe = window.parent !== window;
    if (!isInIframe) return;

    // Send height update when these states change
    const sendHeightUpdate = () => {
      try {
        // Calculate visible content height
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
    const timer = setTimeout(sendHeightUpdate, 150); // Reduced from 200ms
    
    return () => clearTimeout(timer);
  }, [availability, selectedUnit, showBookingForm, showPaymentForm, bookingComplete, hasSearched, error, loading]);
  
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

        // DON'T scroll when no results found - removed this section
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(`Failed to search availability: ${err.message}`);
      setAvailability([]);
      setLastSearchParams({
        ...searchParams
      });
      setHasSearched(true);

      // DON'T scroll on error either - removed this section
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
          rateId: selectedUnit!.selectedRate.rateId
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
          />
        </div>
      )}
    </div>
  );
};

export default App;