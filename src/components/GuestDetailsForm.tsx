import React, { useState } from 'react';
import { User, Mail, Phone, CreditCard, ArrowLeft } from 'lucide-react';
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCurrency = (amount: number): string => {
    try {
      const num = parseFloat(amount?.toString() || '0') || 0;
      return new Intl.NumberFormat('sv-SE', {
        style: 'currency',
        currency: 'SEK'
      }).format(num);
    } catch (e) {
      return '0 SEK';
    }
  };

  const formatDateWithWeekday = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return dateString;
    }
  };

  // Enhanced validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // First name validation
    if (!guestDetails.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (guestDetails.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last name validation
    if (!guestDetails.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (guestDetails.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!guestDetails.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(guestDetails.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation (optional but if provided, should be valid)
    if (guestDetails.phone && guestDetails.phone.trim()) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
      if (!phoneRegex.test(guestDetails.phone.trim())) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(e);
    }
  };

  const handleInputChange = (field: keyof GuestDetails, value: string) => {
    // Clean up input based on field type
    if (field === 'firstName' || field === 'lastName') {
      value = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''); // Allow letters, accents, and spaces
    }
    if (field === 'phone') {
      value = value.replace(/[^0-9\+\-\s\(\)]/g, ''); // Allow numbers and common phone characters
    }

    setGuestDetails(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Guest Details</h1>
        </div>

        {/* Global error display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Booking Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Property:</span>
                <span className="ml-2 text-gray-600">{selectedUnit.inventoryTypeName} - {selectedUnit.buildingName}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Check-in:</span>
                <span className="ml-2 text-gray-600">{formatDateWithWeekday(confirmedSearchParams.startDate)}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Check-out:</span>
                <span className="ml-2 text-gray-600">{formatDateWithWeekday(confirmedSearchParams.endDate)}</span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <span className="ml-2 text-gray-600">{calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}</span>
              </div>
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Amount:</span>
                  <div className="text-right">
                    <span className="text-blue-600">{formatCurrency(selectedUnit.selectedRate.totalPrice)}</span>
                    <div className="text-xs text-gray-500 font-normal">(VAT incl.)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Guest Details Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Guest Information</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="firstName"
                    value={guestDetails.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="lastName"
                    value={guestDetails.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                </div>
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={guestDetails.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    value={guestDetails.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+46 70 123 4567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center justify-center"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Continue to Payment
              </button>
            </form>

            {/* Privacy Notice */}
            <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
              <p>Your personal information is secure and will only be used for this booking.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDetailsForm;
