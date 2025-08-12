import React from 'react';
import { User, Mail, Phone, CreditCard } from 'lucide-react';
import { GuestDetails, SelectedUnit, SearchParams } from '../hooks/useBookingState';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface GuestDetailsFormProps {
  selectedUnit: SelectedUnit;
  confirmedSearchParams: SearchParams;
  guestDetails: GuestDetails;
  setGuestDetails: (details: GuestDetails | ((prev: GuestDetails) => GuestDetails)) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  error: string;
  calculateNights: () => number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GuestDetailsForm: React.FC<GuestDetailsFormProps> = ({
  selectedUnit,
  confirmedSearchParams,
  guestDetails,
  setGuestDetails,
  onSubmit,
  onBack,
  error,
  calculateNights,
  open,
  onOpenChange
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800">Guest Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Booking Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
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
      </DialogContent>
    </Dialog>
  );
};

export default GuestDetailsForm;