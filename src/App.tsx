import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Calendar, Users, MapPin, Phone, Mail, User, CreditCard, CheckCircle, ArrowLeft, Sparkles, ArrowRight } from 'lucide-react';
import StripePaymentForm from './components/StripePaymentForm';
import SearchForm from './components/SearchForm';
import GuestDetailsForm from './components/GuestDetailsForm';
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
        
        // Filter by inventory type ID from URL if specified
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

  // Show payment form
  if (showPaymentForm && selectedUnit && lastSearchParams) {
    return <StripePaymentForm totalAmount={selectedUnit.selectedRate.totalPrice} currency={selectedUnit.selectedRate.currency} onPaymentSuccess={handleStripePaymentSuccess} onBack={handleBackFromPayment} bookingDetails={{
      guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
      checkIn: lastSearchParams.startDate,
      checkOut: lastSearchParams.endDate,
      propertyName: `${selectedUnit.inventoryTypeName} - ${selectedUnit.buildingName}`,
      nights: selectedUnit.selectedRate.nights,
      guests: lastSearchParams.guests
    }} />;
  }

  // Booking confirmation screen
  if (bookingComplete) {
    return <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 section-spacing">
        <div className="container-modern">
          <div className="max-w-2xl mx-auto">
            <div className="card-glass p-12 text-center animate-bounce-in">
              {/* Success Animation */}
              <div className="mb-8">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                  {/* Floating confetti effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => <div key={i} className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-70 animate-float-slow" style={{
                    left: `${20 + i * 15}%`,
                    top: `${10 + i % 2 * 20}%`,
                    animationDelay: `${i * 0.5}s`
                  }}></div>)}
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                  🎉 Booking <span className="text-gradient-warm">Confirmed!</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Your amazing studio is all set! Get ready for an unforgettable experience.
                </p>
              </div>

              {/* Booking Details Card */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 mb-8 border border-gray-100 shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Booking Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700">Booking Reference</div>
                        <div className="text-2xl font-bold text-purple-600">{bookingDetails?.bookingReference}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700">Guest Name</div>
                        <div className="text-lg text-gray-800">{bookingDetails?.guestName}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700">Check-in</div>
                        <div className="text-lg text-gray-800">{bookingDetails && formatDisplayDate(bookingDetails.checkIn)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700">Check-out</div>
                        <div className="text-lg text-gray-800">{bookingDetails && formatDisplayDate(bookingDetails.checkOut)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {bookingDetails?.paymentAmount && <div className="border-t border-gray-200 pt-6 mt-6">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">Total Amount Paid</span>
                      <span className="text-3xl font-bold text-orange-600">{formatCurrency(bookingDetails.paymentAmount)}</span>
                    </div>
                  </div>}
              </div>

              {/* Additional Info */}
              <div className="bg-orange-50 rounded-2xl p-6 mb-8 border border-orange-100">
                <h3 className="font-bold text-orange-800 mb-2">📧 What's Next?</h3>
                <p className="text-orange-700">
                  A confirmation email with all details and check-in instructions has been sent to your email address.
                </p>
              </div>

              {/* Action Button */}
              <button onClick={resetToSearch} className="btn-warm group">
                <span className="flex items-center">
                  Book Another Amazing Studio
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>;
  }

  // Guest details form (full page)
  if (showBookingForm && selectedUnit && lastSearchParams) {
    const searchParamsWithCommunities = {
      ...searchParams,  // Use current searchParams instead of lastSearchParams
      communities: []  // Add empty communities array to match interface
    };
    
    return <GuestDetailsForm
      selectedUnit={selectedUnit}
      confirmedSearchParams={searchParamsWithCommunities}
      guestDetails={guestDetails}
      setGuestDetails={setGuestDetails}
      onSubmit={handleGuestDetailsSubmit}
      onBack={() => {
        setShowBookingForm(false);
        setHasSearched(false);
        setAvailability([]);
      }}
      error={error}
      calculateNights={() => selectedUnit.selectedRate.nights}
    />;
  }

  // Main interface
  return <div className="min-h-screen bg-white">

      {/* Search Section */}
      <SearchForm searchParams={searchParams} setSearchParams={setSearchParams} onSearch={searchAvailability} loading={loading} getMinEndDate={getMinEndDate} error={hasSearched && !loading && availability.length === 0 ? "Dates unavailable" : ""} />

    </div>;
};
export default App;