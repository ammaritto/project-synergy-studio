import React, { useState, useEffect, useRef } from 'react';
import { Search, Calendar, Users, MapPin, Phone, Mail, User, CreditCard, CheckCircle, ArrowLeft, Sparkles, ArrowRight } from 'lucide-react';
import StripePaymentForm from './components/StripePaymentForm';
import SearchForm from './components/SearchForm';
import SearchResults from './components/SearchResults';

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
  // Refs
  const resultsSectionRef = useRef<HTMLDivElement>(null);

  // NEW: Extract inventory type ID from URL
  const [urlInventoryTypeId, setUrlInventoryTypeId] = useState<number | null>(null);

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

  // NEW: URL parsing effect
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/(\d+)$/);
    if (match) {
      const inventoryTypeId = parseInt(match[1], 10);
      setUrlInventoryTypeId(inventoryTypeId);
    } else {
      setUrlInventoryTypeId(null);
    }
  }, []);

  // NEW: Listen for URL changes (for SPA navigation)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const match = path.match(/^\/(\d+)$/);
      if (match) {
        const inventoryTypeId = parseInt(match[1], 10);
        setUrlInventoryTypeId(inventoryTypeId);
      } else {
        setUrlInventoryTypeId(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Photo mapping based on inventoryTypeId
  const getPropertyImage = (inventoryTypeId: number): string => {
    const imageMap: { [key: number]: string } = {
      38: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/680a675aca567cd974c649a9_ANG-Studio-ThumbnailComp-min.png',
      11: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/65b03be9ae7287d722a74fc7_1-p-1600.png',
      10: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/65b03bc52fbd20a5ad097a7c_1-p-1600.jpg',
    };
    
    return imageMap[inventoryTypeId] || 'https://via.placeholder.com/400x240/e5e7eb/9ca3af?text=Photo+Coming+Soon';
  };

  const API_BASE_URL = 'https://short-stay-backend.vercel.app/api';

  // Set default dates
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setSearchParams({
      startDate: today.toISOString().split('T')[0],
      endDate: tomorrow.toISOString().split('T')[0],
      guests: 1
    });
  }, []);

  // Calculate nights
  const calculateNights = () => {
    if (!searchParams.startDate || !searchParams.endDate) return 0;
    const start = new Date(searchParams.startDate);
    const end = new Date(searchParams.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Search availability
  const searchAvailability = async () => {
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
        
        let transformedData = data.data.map((property: any) => {
          return {
            buildingId: property.buildingId || 0,
            buildingName: property.buildingName || 'Unknown Building',
            inventoryTypeId: property.inventoryTypeId || 0,
            inventoryTypeName: property.inventoryTypeName || 'Unknown Unit',
            rates: (property.rates || []).map((rate: any) => {
              const avgNightlyRate = parseFloat(rate.avgNightlyRate || '0');
              const totalPrice = avgNightlyRate * searchNights;
              
              return {
                rateId: rate.rateId || 0,
                rateName: rate.rateName || 'Standard Rate',
                currency: rate.currency || 'SEK',
                currencySymbol: rate.currencySymbol || 'SEK',
                totalPrice: totalPrice,
                avgNightlyRate: avgNightlyRate,
                nights: searchNights,
                description: rate.description || ''
              };
            })
          };
        });

        // NEW: Filter by URL inventory type ID if present
        if (urlInventoryTypeId !== null) {
          transformedData = transformedData.filter((unit: Unit) => 
            unit.inventoryTypeId === urlInventoryTypeId
          );
        }
        
        setAvailability(transformedData);
        setLastSearchParams({ ...searchParams });
        setHasSearched(true);
        
        // If we have results, go straight to Guest Details by auto-selecting a unit
        if (transformedData.length > 0) {
          const unit = transformedData[0];
          const rate = unit.rates?.[0];
          if (rate) {
            setSelectedUnit({ ...unit, selectedRate: rate });
            setShowBookingForm(true);
          }
        } else {
          // No results after filtering, show "not found" section
          setAvailability([]);
        }
      } else {
        setError(data.message || 'No availability found');
        setAvailability([]);
        setLastSearchParams({ ...searchParams });
        setHasSearched(true);
        
        // Scroll to results section even if no results found
        setTimeout(() => {
          resultsSectionRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(`Failed to search availability: ${err.message}`);
      setAvailability([]);
      setLastSearchParams({ ...searchParams });
      setHasSearched(true);
      
      // Scroll to results section even on error
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  // Auto-search when URL changes and we have search params
  useEffect(() => {
    if (searchParams.startDate && searchParams.endDate && urlInventoryTypeId !== null) {
      searchAvailability();
    }
  }, [urlInventoryTypeId]);

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'SEK') => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Format date with weekday
  const formatDateWithWeekday = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle unit selection
  const handleSelectUnit = (unit: Unit, rate: Rate) => {
    setSelectedUnit({ ...unit, selectedRate: rate });
    setShowBookingForm(true);
  };

  // Handle guest details form submission
  const handleGuestDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUnit) return;
    
    setError('');
    
    if (!guestDetails.firstName || !guestDetails.lastName || !guestDetails.email) {
      setError('Please fill in all required fields');
      return;
    }
    
    setShowPaymentForm(true);
  };

  // Handle booking completion
  const handleBookingComplete = (bookingData: BookingDetails) => {
    setBookingDetails(bookingData);
    setBookingComplete(true);
    setShowPaymentForm(false);
    setShowBookingForm(false);
  };

  // Handle starting new search
  const handleNewSearch = () => {
    setBookingComplete(false);
    setBookingDetails(null);
    setSelectedUnit(null);
    setShowBookingForm(false);
    setShowPaymentForm(false);
    setGuestDetails({ firstName: '', lastName: '', email: '', phone: '' });
    setError('');
    setHasSearched(false);
    setAvailability([]);
    
    // NEW: Update URL to remove inventory type filter
    window.history.pushState({}, '', '/');
    setUrlInventoryTypeId(null);
  };

  // NEW: Get inventory type display name
  const getInventoryTypeDisplayName = (inventoryTypeId: number): string => {
    const nameMap: { [key: number]: string } = {
      10: 'Studio',
      11: 'Studio Plus',
      38: 'Studio Premium'
    };
    return nameMap[inventoryTypeId] || `Unit Type ${inventoryTypeId}`;
  };

  if (bookingComplete && bookingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-green-500 mb-6">
                <CheckCircle className="w-20 h-20 mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
              <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Booking Reference:</span> {bookingDetails.bookingReference}</p>
                  <p><span className="font-medium">Guest Name:</span> {bookingDetails.guestName}</p>
                  <p><span className="font-medium">Check-in:</span> {formatDateWithWeekday(bookingDetails.checkIn)}</p>
                  <p><span className="font-medium">Check-out:</span> {formatDateWithWeekday(bookingDetails.checkOut)}</p>
                  <p><span className="font-medium">Status:</span> <span className="text-blue-600 font-medium">{bookingDetails.status}</span></p>
                  {bookingDetails.paymentReference && (
                    <p><span className="font-medium">Payment Reference:</span> {bookingDetails.paymentReference}</p>
                  )}
                  {bookingDetails.paymentAmount && (
                    <p><span className="font-medium">Amount Paid:</span> {formatCurrency(bookingDetails.paymentAmount)}</p>
                  )}
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                A confirmation email has been sent to {guestDetails.email}
              </p>
              <button
                onClick={handleNewSearch}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Make Another Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="text-blue-600 w-8 h-8 mr-2" />
            <h1 className="text-4xl font-bold text-gray-900">Short Stay Booking</h1>
          </div>
          {/* NEW: Show filtered view indicator */}
          {urlInventoryTypeId && (
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-4 inline-block">
              <p className="text-blue-800 font-medium">
                Showing only: {getInventoryTypeDisplayName(urlInventoryTypeId)}
              </p>
            </div>
          )}
          <p className="text-gray-600 text-lg">Find and book your perfect short-term accommodation</p>
        </div>

        {!showBookingForm && !showPaymentForm && (
          <>
            {/* Search Form */}
            <SearchForm 
              searchParams={searchParams}
              setSearchParams={setSearchParams}
              onSearch={searchAvailability}
              loading={loading}
            />

            {/* Search Results */}
            {hasSearched && (
              <div ref={resultsSectionRef}>
                <SearchResults
                  availability={availability}
                  confirmedSearchParams={lastSearchParams!}
                  onSelectUnit={handleSelectUnit}
                  formatCurrency={formatCurrency}
                  formatDateWithWeekday={formatDateWithWeekday}
                  getPropertyImage={getPropertyImage}
                  error={error}
                />
              </div>
            )}
          </>
        )}

        {/* Guest Details Form */}
        {showBookingForm && selectedUnit && !showPaymentForm && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setShowBookingForm(false)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Results
            </button>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Guest Details</h2>
              
              {/* Selected Unit Summary */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Selected Accommodation</h3>
                <p className="text-gray-700">{selectedUnit.buildingName} - {selectedUnit.inventoryTypeName}</p>
                <p className="text-gray-600 text-sm mt-1">
                  {formatDateWithWeekday(lastSearchParams!.startDate)} - {formatDateWithWeekday(lastSearchParams!.endDate)} 
                  ({selectedUnit.selectedRate.nights} {selectedUnit.selectedRate.nights === 1 ? 'night' : 'nights'})
                </p>
                <p className="text-lg font-bold text-blue-600 mt-2">
                  Total: {formatCurrency(selectedUnit.selectedRate.totalPrice)}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleGuestDetailsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={guestDetails.firstName}
                        onChange={(e) => setGuestDetails({ ...guestDetails, firstName: e.target.value })}
                        placeholder="Enter first name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={guestDetails.lastName}
                        onChange={(e) => setGuestDetails({ ...guestDetails, lastName: e.target.value })}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={guestDetails.email}
                      onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={guestDetails.phone}
                      onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                      placeholder="Enter phone number (optional)"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Back to Results
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                  >
                    Continue to Payment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Payment Form */}
        {showPaymentForm && selectedUnit && (
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setShowPaymentForm(false)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Guest Details
            </button>

            <StripePaymentForm
              selectedUnit={selectedUnit}
              guestDetails={guestDetails}
              searchParams={lastSearchParams!}
              onBookingComplete={handleBookingComplete}
              formatCurrency={formatCurrency}
              formatDateWithWeekday={formatDateWithWeekday}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
