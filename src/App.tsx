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
  // ENHANCED IFRAME HEIGHT COMMUNICATION WITH DROPDOWN HANDLING
  // ====================
  useEffect(() => {
    const isInIframe = window.parent !== window;
    
    if (!isInIframe) return;

    let isUpdating = false;
    let heightUpdateTimeout: NodeJS.Timeout;
    let lastCalculatedHeight = 0;
    const MIN_HEIGHT = 180;
    const MAX_HEIGHT = 3000;

    // Enhanced height calculation that excludes dropdown portals
    const calculateVisibleHeight = (): number => {
      try {
        const isMobile = window.innerWidth <= 768;
        
        // Get all elements but exclude dropdown portals and overlays
        const excludeSelectors = [
          '[data-radix-select-content]',     // Radix Select dropdown content
          '[data-radix-dropdown-menu-content]', // Dropdown menu content
          '[data-radix-popover-content]',    // Popover content
          '.fixed',                          // Fixed positioned elements (likely overlays)
          '[style*="position: fixed"]',      // Inline fixed positioning
          '[data-state="open"][data-side]'   // Open dropdown/popover elements
        ];
        
        // Method 1: Calculate main content height excluding portals
        const mainContentHeight = () => {
          const body = document.body;
          const html = document.documentElement;
          
          // Get the natural content height
          let contentHeight = Math.max(
            body.scrollHeight || 0,
            body.offsetHeight || 0,
            html.clientHeight || 0,
            html.scrollHeight || 0,
            html.offsetHeight || 0
          );
          
          // Subtract any portal/overlay elements that shouldn't affect iframe height
          excludeSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              const element = el as HTMLElement;
              const rect = element.getBoundingClientRect();
              const style = window.getComputedStyle(element);
              
              // Only subtract if element is positioned outside the normal flow
              // and is currently visible
              if ((style.position === 'fixed' || style.position === 'absolute') &&
                  rect.height > 0 && 
                  element.offsetParent !== null) {
                
                // Check if this element is outside the main content area
                const isOutsideMainContent = rect.top < 0 || 
                                           rect.left < 0 || 
                                           rect.top > window.innerHeight ||
                                           rect.left > window.innerWidth;
                
                if (!isOutsideMainContent) {
                  // Don't subtract, this might be legitimate content
                  return;
                }
                
                // For dropdowns that extend beyond viewport, don't count their height
                contentHeight = Math.max(contentHeight - rect.height, MIN_HEIGHT);
              }
            });
          });
          
          return Math.max(contentHeight, MIN_HEIGHT);
        };

        // Method 2: Container-based calculation (fallback)
        const containerBasedHeight = () => {
          const containers = [
            '[data-app-container]',
            '.app-container', 
            'main',
            '#root > div:first-child',
            'body > div:first-child'
          ];

          for (const selector of containers) {
            const container = document.querySelector(selector) as HTMLElement;
            if (container && container.offsetHeight > 0) {
              const rect = container.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              return Math.ceil(rect.bottom + scrollTop);
            }
          }
          return MIN_HEIGHT;
        };

        // Use the main content method, fall back to container-based
        const calculatedHeight = mainContentHeight();
        return calculatedHeight > MIN_HEIGHT ? calculatedHeight : containerBasedHeight();

      } catch (error) {
        console.warn('Height calculation failed:', error);
        return MIN_HEIGHT;
      }
    };

    const sendHeightUpdate = () => {
      if (isUpdating) return;
      
      try {
        const height = calculateVisibleHeight();
        const heightDiff = Math.abs(height - lastCalculatedHeight);
        
        // More conservative threshold to prevent dropdown-triggered updates
        const threshold = 20;
        
        if (heightDiff > threshold) {
          isUpdating = true;
          lastCalculatedHeight = height;
          
          window.parent.postMessage({
            type: 'iframe-height',
            height: height,
            source: 'content-change',
            timestamp: Date.now()
          }, '*');
          
          console.log('Height updated:', height, 'diff:', heightDiff);
          
          setTimeout(() => {
            isUpdating = false;
          }, 100);
        }
      } catch (error) {
        console.error('Failed to send height update:', error);
        isUpdating = false;
      }
    };

    // Debounced height update with longer delay for dropdown scenarios
    const debouncedHeightUpdate = () => {
      clearTimeout(heightUpdateTimeout);
      heightUpdateTimeout = setTimeout(sendHeightUpdate, 200);
    };

    // Listen for state changes that should trigger height recalculation
    // But exclude dropdown/select state changes
    const stateChangeHandler = () => {
      // Check if a dropdown is currently open
      const hasOpenDropdown = document.querySelector('[data-state="open"][data-radix-select-content], [data-state="open"][data-radix-dropdown-menu-content]');
      
      if (!hasOpenDropdown) {
        debouncedHeightUpdate();
      }
      // If dropdown is open, don't update height
    };

    // Initial height calculation
    setTimeout(() => {
      sendHeightUpdate();
    }, 300);

    // Observe DOM mutations but filter out dropdown-related changes
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      
      mutations.forEach(mutation => {
        // Ignore mutations in portal containers (dropdowns)
        const target = mutation.target as Element;
        const isPortalMutation = target.closest && (
          target.closest('[data-radix-select-content]') ||
          target.closest('[data-radix-dropdown-menu-content]') ||
          target.closest('[data-radix-popover-content]') ||
          target.closest('.fixed')
        );
        
        if (!isPortalMutation) {
          shouldUpdate = true;
        }
      });
      
      if (shouldUpdate) {
        stateChangeHandler();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-state']
    });

    // Handle specific app state changes (but not dropdown states)
    const handleStateChange = () => {
      // Small delay to ensure DOM has updated
      setTimeout(stateChangeHandler, 150);
    };

    // Listen for resize events
    const handleResize = () => {
      clearTimeout(heightUpdateTimeout);
      heightUpdateTimeout = setTimeout(sendHeightUpdate, 300);
    };

    window.addEventListener('resize', handleResize);

    // Handle parent requests for height
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'request-height') {
        sendHeightUpdate();
      }
    };

    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      clearTimeout(heightUpdateTimeout);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('message', handleMessage);
    };
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