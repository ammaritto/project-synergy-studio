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

    // Enhanced visible content height calculation with mobile optimization
    const calculateVisibleHeight = (): number => {
      try {
        const isMobile = window.innerWidth <= 768;
        
        // Method 1: Calculate height of visible elements only (Mobile optimized)
        const visibleElements = document.querySelectorAll('*');
        let calculatedHeight = 0;
        
        visibleElements.forEach((element) => {
          const el = element as HTMLElement;
          const computedStyle = window.getComputedStyle(el);
          
          // Skip if element is hidden or has mobile-specific hiding
          if (
            computedStyle.display === 'none' || 
            computedStyle.visibility === 'hidden' ||
            computedStyle.opacity === '0' ||
            el.offsetHeight === 0 ||
            (isMobile && computedStyle.display === 'none')
          ) {
            return;
          }

          // Skip elements that are outside viewport on mobile
          if (isMobile) {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) return;
          }

          // Get element's bottom position relative to document
          const rect = el.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const elementBottom = rect.bottom + scrollTop;
          
          calculatedHeight = Math.max(calculatedHeight, elementBottom);
        });

        // Method 2: Mobile-first container calculation
        const getMobileOptimizedHeight = (): number => {
          if (isMobile) {
            // On mobile, look for specific mobile containers first
            const mobileSelectors = [
              '.mobile-container',
              '[data-mobile="true"]',
              '.app-container',
              '[data-app-container]'
            ];
            
            for (const selector of mobileSelectors) {
              const container = document.querySelector(selector) as HTMLElement;
              if (container && container.offsetHeight > 0) {
                return container.offsetHeight + 20; // Add small padding
              }
            }
          }
          
          // Fallback to regular container detection
          const containerSelectors = [
            '[data-app-container]',
            '[data-main-content]',
            '.app-container',
            'main',
            '#root > div:first-child',
            'body > div:first-child'
          ];

          for (const selector of containerSelectors) {
            const container = document.querySelector(selector) as HTMLElement;
            if (container && container.offsetHeight > 0) {
              const rect = container.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              return Math.ceil(rect.bottom + scrollTop);
            }
          }
          return 0;
        };

        // Method 3: Viewport-aware content calculation
        const getViewportAwareHeight = (): number => {
          let maxBottom = 0;
          const viewportHeight = window.innerHeight;
          
          // Find all visible content containers
          const contentSelectors = [
            '.search-form',
            '.results-section', 
            '.booking-form',
            '.payment-form',
            '.error-message',
            '.loading-indicator',
            '[data-visible="true"]',
            '[data-content-section]'
          ];

          contentSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              const element = el as HTMLElement;
              if (element.offsetHeight > 0 && window.getComputedStyle(element).display !== 'none') {
                const rect = element.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const elementBottom = rect.bottom + scrollTop;
                
                // On mobile, don't let it exceed a reasonable multiple of viewport height
                if (isMobile && elementBottom > viewportHeight * 3) {
                  return; // Skip elements that seem unreasonably tall
                }
                
                maxBottom = Math.max(maxBottom, elementBottom);
              }
            });
          });

          return maxBottom;
        };

        // Get heights from all methods
        const method1Height = calculatedHeight;
        const method2Height = getMobileOptimizedHeight();
        const method3Height = getViewportAwareHeight();

        // Use the most reasonable height with mobile-specific logic
        const heights = [method1Height, method2Height, method3Height].filter(h => h > 0);
        
        let finalHeight;
        if (isMobile) {
          // On mobile, be more conservative and use the smallest reasonable height
          finalHeight = Math.min(...heights.filter(h => h > 100)) || Math.max(...heights, 150);
          finalHeight = Math.min(finalHeight, window.innerHeight * 2); // Never exceed 2x viewport height
        } else {
          finalHeight = Math.max(...heights, 180);
        }

        // Debug logging with mobile info
        console.log('Height calculation methods:', {
          isMobile,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          visibleElements: method1Height,
          mobileOptimized: method2Height,
          viewportAware: method3Height,
          chosen: finalHeight
        });

        return Math.ceil(finalHeight);
      } catch (error) {
        console.error('Error calculating visible height:', error);
        // Mobile-optimized fallback
        const isMobile = window.innerWidth <= 768;
        const fallbackHeight = isMobile ? 
          Math.min(document.body.offsetHeight || 150, window.innerHeight * 1.5) : 
          Math.max(document.body.offsetHeight || 180, 180);
        return fallbackHeight;
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

  // UPDATED: Set default dates - check-in today+3, check-out checkin+3
  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() + 3); // Check-in default: today + 3 days
    const end = new Date(start);
    end.setDate(end.getDate() + 3); // Check-out default: check-in + 3 days

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

  // UPDATED: Get minimum start date (today + 3 days)
  const getMinStartDate = (): string => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(minDate.getDate() + 3); // Today + 3 days
    return minDate.toISOString().split('T')[0];
  };

  // UPDATED: Get minimum end date (check-in + 3 days)
  const getMinEndDate = (): string => {
    if (!searchParams.startDate) return '';
    const minDate = new Date(searchParams.startDate);
    minDate.setDate(minDate.getDate() + 3); // Check-in + 3 days
    return minDate.toISOString().split('T')[0];
  };

  // UPDATED: Auto-update checkout date when checkin changes (ensure minimum 3 nights)
  useEffect(() => {
    if (searchParams.startDate) {
      const checkIn = new Date(searchParams.startDate);
      const checkOut = new Date(searchParams.endDate);
      const minCheckOut = new Date(checkIn);
      minCheckOut.setDate(minCheckOut.getDate() + 3); // Check-in + 3 days
      
      // If current end date is invalid or less than minimum, set to minimum
      if (!searchParams.endDate || checkOut < minCheckOut) {
        setSearchParams(prev => ({
          ...prev,
          endDate: minCheckOut.toISOString().split('T')[0]
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
          getMinStartDate={getMinStartDate} // NEW: Added minimum start date function
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