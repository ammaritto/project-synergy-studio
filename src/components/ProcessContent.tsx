import React from 'react';
import SearchResults from './SearchResults';
import GuestDetailsForm from './GuestDetailsForm';
import StripePaymentForm from './StripePaymentForm';
import BookingConfirmation from './BookingConfirmation';

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

interface ProcessContentProps {
  // Search Results props
  availability: Unit[];
  hasSearched: boolean;
  confirmedSearchParams: SearchParams;
  onSelectUnit: (unit: Unit, rate: Rate) => void;
  calculateNights: () => number;
  
  // Guest Details Form props
  showBookingForm: boolean;
  selectedUnit: SelectedUnit | null;
  guestDetails: GuestDetails;
  setGuestDetails: (details: GuestDetails) => void;
  onGuestDetailsSubmit: (e: React.FormEvent) => void;
  onBackFromGuestDetails: () => void;
  error: string;
  
  // Payment Form props
  showPaymentForm: boolean;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onBackFromPayment: () => void;
  
  // Booking Confirmation props
  bookingComplete: boolean;
  bookingDetails: BookingDetails | null;
  onReset: () => void;
  confirmationRef?: React.RefObject<HTMLDivElement>;
}

const ProcessContent: React.FC<ProcessContentProps> = ({
  availability,
  hasSearched,
  confirmedSearchParams,
  onSelectUnit,
  calculateNights,
  showBookingForm,
  selectedUnit,
  guestDetails,
  setGuestDetails,
  onGuestDetailsSubmit,
  onBackFromGuestDetails,
  error,
  showPaymentForm,
  onPaymentSuccess,
  onBackFromPayment,
  bookingComplete,
  bookingDetails,
  onReset,
  confirmationRef
}) => {
  // Determine if we should show search results
  // Only show when we have searched AND have actual results AND not in booking steps
  const shouldShowSearchResults = hasSearched && availability.length > 0 && !showBookingForm && !showPaymentForm && !bookingComplete;

  // Return null if there's nothing to render - prevents empty container height
  if (!shouldShowSearchResults && !showBookingForm && !showPaymentForm && !bookingComplete) {
    return null;
  }

  return (
    <div>
      {/* Search Results - Only show when we have actual results */}
      {shouldShowSearchResults && (
        <div data-content-section="search-results" data-visible="true">
          <SearchResults
            availability={availability}
            hasSearched={hasSearched}
            confirmedSearchParams={confirmedSearchParams}
            onSelectUnit={onSelectUnit}
            calculateNights={calculateNights}
          />
        </div>
      )}

      {/* Guest Details Form */}
      {showBookingForm && selectedUnit && (
        <div data-content-section="guest-details-wrapper" data-visible="true">
          <GuestDetailsForm
            selectedUnit={selectedUnit}
            confirmedSearchParams={{
              ...confirmedSearchParams,
              communities: []
            }}
            guestDetails={guestDetails}
            setGuestDetails={setGuestDetails}
            onSubmit={onGuestDetailsSubmit}
            onBack={onBackFromGuestDetails}
            error={error}
            calculateNights={() => selectedUnit.selectedRate.nights}
          />
        </div>
      )}

      {/* Payment Form */}
      {showPaymentForm && selectedUnit && (
        <div data-content-section="payment-wrapper" data-visible="true">
          <StripePaymentForm
            totalAmount={selectedUnit.selectedRate.totalPrice} 
            currency={selectedUnit.selectedRate.currency} 
            onPaymentSuccess={onPaymentSuccess} 
            onBack={onBackFromPayment} 
            bookingDetails={{
              guestName: `${guestDetails.firstName} ${guestDetails.lastName}`,
              checkIn: confirmedSearchParams.startDate,
              checkOut: confirmedSearchParams.endDate,
              propertyName: `${selectedUnit.inventoryTypeName} - ${selectedUnit.buildingName}`,
              nights: selectedUnit.selectedRate.nights,
              guests: confirmedSearchParams.guests
            }} 
          />
        </div>
      )}

      {/* Booking Confirmation */}
      {bookingComplete && bookingDetails && (
        <div 
          ref={confirmationRef} 
          data-content-section="booking-confirmation" 
          data-visible="true"
        >
          <BookingConfirmation
            bookingDetails={bookingDetails}
            onReset={onReset}
          />
        </div>
      )}
    </div>
  );
};

export default ProcessContent;