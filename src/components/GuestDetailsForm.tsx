import React from 'react';
import { User, Mail, Phone, CreditCard, Sparkles } from 'lucide-react';
import { GuestDetails, SelectedUnit, SearchParams } from '../hooks/useBookingState';
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
      // Ensure the date string is in yyyy-mm-dd format
      const date = new Date(dateString + 'T00:00:00');
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
  return <div className="min-h-screen py-8 px-4 bg-[#FCFBF7]">
  <div className="bg-white rounded-lg shadow-lg p-8 animate-slide-up max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="col-span-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Guest Details</h1>
        
        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full md:w-3/4 mx-auto">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Sparkles className="w-6 h-6 text-blue-600 mr-3" />
            Booking Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Property:</span>
              <span className="font-medium text-right">{selectedUnit.inventoryTypeName} - {selectedUnit.buildingName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Arrival Date:</span>
              <span className="font-medium">{formatDateWithWeekday(confirmedSearchParams.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Departure Date:</span>
              <span className="font-medium">{formatDateWithWeekday(confirmedSearchParams.endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{calculateNights()} nights</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guests:</span>
              <span className="font-medium">1</span>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Price (excl. VAT):</span>
                <span className="font-medium">{formatCurrency(selectedUnit.selectedRate.totalPrice * 0.88)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT (12%):</span>
                <span className="font-medium">{formatCurrency(selectedUnit.selectedRate.totalPrice * 0.12)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <div className="text-right">
                  <div className="text-2xl md:text-2xl text-xl">{formatCurrency(selectedUnit.selectedRate.totalPrice)}</div>
                  <div className="text-sm text-gray-500 font-normal">VAT included</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>}
          <br/><br />
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input type="text" id="firstName" required className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={guestDetails.firstName} onChange={e => setGuestDetails(prev => ({
                ...prev,
                firstName: e.target.value
              }))} placeholder="John" />
              </div>
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input type="text" id="lastName" required className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={guestDetails.lastName} onChange={e => setGuestDetails(prev => ({
                ...prev,
                lastName: e.target.value
              }))} placeholder="Doe" />
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input type="email" id="email" required className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={guestDetails.email} onChange={e => setGuestDetails(prev => ({
              ...prev,
              email: e.target.value
            }))} placeholder="name@example.com" />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input type="tel" id="phone" className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={guestDetails.phone} onChange={e => setGuestDetails(prev => ({
              ...prev,
              phone: e.target.value
            }))} placeholder="Phone number" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onBack} className="flex-1 py-1.5 md:py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
              Back to Search
            </button>
            <button type="submit" className="flex-1 py-1.5 md:py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>;
};
export default GuestDetailsForm;
