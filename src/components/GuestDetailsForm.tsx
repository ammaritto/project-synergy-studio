import React, { useEffect } from 'react';
import { User, Mail, Phone, CreditCard } from 'lucide-react';
import { GuestDetails, SelectedUnit, SearchParams } from '../hooks/useBookingState';
import { useParentCommunication } from '../hooks/useParentCommunication';

interface GuestDetailsFormProps {
  selectedUnit: SelectedUnit;
  confirmedSearchParams: SearchParams;
  guestDetails: GuestDetails;
  setGuestDetails: (details: GuestDetails | ((prev: GuestDetails) => GuestDetails)) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  error: string;
  calculateNights: () => number;
}

const GuestDetailsForm: React.FC<GuestDetailsFormProps> = ({
  selectedUnit,
  confirmedSearchParams,
  guestDetails,
  setGuestDetails,
  onSubmit,
  onBack,
  error,
  calculateNights
}) => {
  const { openFullScreenPopup } = useParentCommunication();
  const isInIframe = window.parent !== window;

  const formatCurrency = (amount: number): string => {
    try {
      const num = parseFloat(amount?.toString() || '0') || 0;
      return `${num.toLocaleString('sv-SE')} SEK`;
    } catch (e) {
      return '0 SEK';
    }
  };

  const formatDateWithWeekday = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      };
      return date.toLocaleDateString('en-GB', options);
    } catch (e) {
      return dateString;
    }
  };

  // Send popup data to parent when component mounts (if in iframe)
  useEffect(() => {
    if (isInIframe) {
      const popupData = {
        type: 'guest-details-form',
        selectedUnit,
        confirmedSearchParams,
        guestDetails,
        error,
        nights: calculateNights(),
        formattedDates: {
          startDate: formatDateWithWeekday(confirmedSearchParams.startDate),
          endDate: formatDateWithWeekday(confirmedSearchParams.endDate)
        },
        formattedPrice: formatCurrency(selectedUnit.selectedRate.totalPrice)
      };

      openFullScreenPopup(popupData);
    }
  }, [isInIframe, selectedUnit, confirmedSearchParams, guestDetails, error, calculateNights, openFullScreenPopup]);

  // Listen for messages from parent (form submissions, back actions)
  useEffect(() => {
    if (isInIframe) {
      const handleParentMessage = (event: MessageEvent) => {
        if (event.data && event.data.source === 'webflow-parent') {
          switch (event.data.type) {
            case 'guest-form-submit':
              if (event.data.formData) {
                // Update guest details with parent form data
                setGuestDetails(event.data.formData);
                // Trigger the original submit
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                onSubmit(fakeEvent);
              }
              break;
            case 'guest-form-back':
              onBack();
              break;
          }
        }
      };

      window.addEventListener('message', handleParentMessage);
      return () => window.removeEventListener('message', handleParentMessage);
    }
  }, [isInIframe, setGuestDetails, onSubmit, onBack]);

  // If in iframe, render minimal content (the popup is handled by parent)
  if (isInIframe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold mb-4">Loading Guest Details Form...</h2>
          <p className="text-gray-600">The form will open in full screen mode.</p>
        </div>
      </div>
    );
  }

  // Normal popup behavior when not in iframe
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background content (blurred) */}
      <div className="filter blur-sm opacity-50">
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Short Stay Booking</h1>
            <p className="text-gray-600 mt-2">Find and book your perfect short-term accommodation</p>
          </div>
        </div>
      </div>

      {/* Popup Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Guest Details</h2>
            
            {/* Booking Summary */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Booking Summary</h3>
              <p className="text-sm text-gray-600">{selectedUnit.inventoryTypeName} - {selectedUnit.buildingName}</p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">From:</span> {formatDateWithWeekday(confirmedSearchParams.startDate)}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">To:</span> {formatDateWithWeekday(confirmedSearchParams.endDate)}
              </p>
              <p className="text-sm text-gray-600">({calculateNights()} nights)</p>
              <p className="text-sm font-semibold text-gray-800 mt-2">
                <span className="font-medium">Total Amount:</span> {formatCurrency(selectedUnit.selectedRate.totalPrice)}
              </p>
              <p className="text-xs text-gray-500">(VAT incl.)</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="firstName"
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={guestDetails.firstName}
                    onChange={(e) => setGuestDetails(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="lastName"
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={guestDetails.lastName}
                    onChange={(e) => setGuestDetails(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={guestDetails.email}
                    onChange={(e) => setGuestDetails(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={guestDetails.phone}
                    onChange={(e) => setGuestDetails(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+46 70 123 4567"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Continue to Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDetailsForm;
