import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Calendar, Users, MapPin, Phone, Mail, User, CreditCard, CheckCircle, ArrowLeft, Sparkles, ArrowRight } from 'lucide-react';
import StripePaymentForm from './components/StripePaymentForm';
import SearchForm from './components/SearchForm';
import GuestDetailsForm from './components/GuestDetailsForm';
import BookingConfirmation from './components/BookingConfirmation';
import { IframeHeightProvider } from './hooks/IframeHeightProvider';
import { useBookingHeightTrigger } from './hooks/useHeightTrigger';

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

// Main App Content Component
const AppContent: React.FC = () => {
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

  // Height communication hook - triggers height updates on state changes
  useBookingHeightTrigger(
    showBookingForm,
    showPaymentForm,
    bookingComplete,
    hasSearched,
    availability,
    error
  );

  // Photo mapping based on inventoryTypeId
  const getPropertyImage = (inventoryTypeId: number): string => {
    const imageMap: {
      [key: number]: string;
    } = {
      38: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/680a675aca567cd974c649a9_ANG-Studio-ThumbnailComp-min.png',
      11: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/65b03be9ae7287d722a74fc7_1-p-1600.png',
      10: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/65b03be9ae7287d722a74fc7_1-p-1600.png',
      39: 'https://cdn.prod.website-files.com/606d62996f9e70103c982ffe/65b03be9ae7287d722a74fc7_1-p-1600.png'
    };
    return imageMap[inventoryTypeId] || imageMap[11];
  };

  const API_BASE_URL = 'https://short-stay-backend.vercel.app/api';

  // Helper functions
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'SEK'
    }).format(amount);
  };

  const formatDateWithWeekday = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateNights = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  // Search availability
  const searchAvailability = async (searchData: SearchParams): Promise<void> => {
    console.log('Searching with params:', searchData);
    setLoading(true);
    setError('');
    setAvailability([]);
    setHasSearched(false);

    const { startDate, endDate, guests } = searchData;

    try {
      const url = `${API_BASE_URL}/availability/search?startDate=${startDate}&endDate=${endDate}&guests=${guests}`;
      console.log('Fetching from URL:', url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        const transformedData = data.data.map((item: any) => ({
          buildingId: item.buildingId,
          buildingName: item.buildingName,
          inventoryTypeId: item.inventoryTypeId,
          inventoryTypeName: item.inventoryTypeName,
          rates: item.rates || []
        }));

        // Apply inventory type filter if specified in URL
        const filteredData = filterByInventoryTypeId 
          ? transformedData.filter((u: any) => u.inventoryTypeId === filterByInventoryTypeId)
          : transformedData;
        
        setAvailability(filteredData);
        setLastSearchParams({
          ...searchParams
        });
        setHasSearched(true);

        // If we have results, go straight to Guest Details by auto-selecting a unit
        if (filteredData.length > 0) {
          const unit = filteredData[0];
          const rate = unit.rates?.[0];
          if (rate) {
            setSelectedUnit({
              ...unit,
              selectedRate: rate
            });
            setShowBookingForm(true);
          }
        }
      } else {
        setError(data.message || 'No availability found');
        setAvailability([]);
        setLastSearchParams({
          ...searchParams
        });
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
      setLastSearchParams({
        ...searchParams
      });
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

  // Go back to search
  const goBackToSearch = (): void => {
    setSelectedUnit(null);
    setShowBookingForm(false);
    setShowPaymentForm(false);
    setBookingComplete(false);
    setError('');
  };

  // Go back to guest details
  const goBackToGuestDetails = (): void => {
    setShowPaymentForm(false);
    setShowBookingForm(true);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Show booking confirmation if complete */}
      {bookingComplete && bookingDetails ? (
        <BookingConfirmation 
          bookingDetails={bookingDetails}
          onStartNewBooking={goBackToSearch}
        />
      ) : (
        <>
          {/* Header */}
          <div className="bg-white shadow-sm">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Allihoop Studios</h1>
                    <p className="text-sm text-gray-600">Find your perfect stay</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Payment Form */}
            {showPaymentForm && selectedUnit && lastSearchParams ? (
              <StripePaymentForm
                totalAmount={selectedUnit.selectedRate.totalPrice}
                currency={selectedUnit.selectedRate.currency}
                onPaymentSuccess={handleStripePaymentSuccess}
                onBack={goBackToGuestDetails}
                bookingDetails={{
                  guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
                  checkIn: lastSearchParams.startDate,
                  checkOut: lastSearchParams.endDate,
                  propertyName: selectedUnit.inventoryTypeName,
                  nights: calculateNights(lastSearchParams.startDate, lastSearchParams.endDate)
                }}
              />
            ) : showBookingForm && selectedUnit && lastSearchParams ? (
              /* Guest Details Form */
              <GuestDetailsForm
                guestDetails={guestDetails}
                setGuestDetails={setGuestDetails}
                onSubmit={handleGuestDetailsSubmit}
                onBack={goBackToSearch}
                bookingDetails={{
                  propertyName: selectedUnit.inventoryTypeName,
                  checkIn: lastSearchParams.startDate,
                  checkOut: lastSearchParams.endDate,
                  nights: calculateNights(lastSearchParams.startDate, lastSearchParams.endDate),
                  totalAmount: selectedUnit.selectedRate.totalPrice,
                  currency: selectedUnit.selectedRate.currency
                }}
              />
            ) : (
              /* Search Form */
              <SearchForm
                searchParams={searchParams}
                setSearchParams={setSearchParams}
                onSearch={searchAvailability}
                loading={loading}
              />
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Results Section */}
            <div ref={resultsSectionRef}>
              {hasSearched && !showBookingForm && !showPaymentForm && (
                <div className="mt-8">
                  {availability.length > 0 ? (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900">Available Properties</h2>
                      <div className="grid gap-6">
                        {availability.map((unit) => (
                          <div key={`${unit.buildingId}-${unit.inventoryTypeId}`} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="flex flex-col md:flex-row">
                              {/* Property Image */}
                              <div className="md:w-1/3">
                                <img
                                  src={getPropertyImage(unit.inventoryTypeId)}
                                  alt={unit.inventoryTypeName}
                                  className="w-full h-48 md:h-full object-cover"
                                />
                              </div>
                              
                              {/* Property Details */}
                              <div className="md:w-2/3 p-6">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{unit.inventoryTypeName}</h3>
                                    <div className="flex items-center text-gray-600 mb-2">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      <span className="text-sm">{unit.buildingName}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                      <Users className="w-4 h-4 mr-1" />
                                      <span className="text-sm">Up to {searchParams.guests} guests</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Available Rates */}
                                <div className="space-y-3">
                                  {unit.rates.map((rate) => (
                                    <div key={rate.rateId} className="border border-gray-200 rounded-lg p-4">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <h4 className="font-medium text-gray-900">{rate.rateName}</h4>
                                          <p className="text-sm text-gray-600">
                                            {rate.nights} {rate.nights === 1 ? 'night' : 'nights'} • 
                                            Average {formatCurrency(rate.avgNightlyRate)}/night
                                          </p>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-2xl font-bold text-blue-600">
                                            {formatCurrency(rate.totalPrice)}
                                          </div>
                                          <button 
                                            onClick={() => selectUnit(unit, rate)}
                                            className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                          >
                                            Select
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No properties available</h3>
                        <p className="text-gray-600">Try adjusting your search criteria or dates.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Main App component with IframeHeightProvider wrapper
const App: React.FC = () => {
  return (
    <IframeHeightProvider>
      <AppContent />
    </IframeHeightProvider>
  );
};

export default App;
