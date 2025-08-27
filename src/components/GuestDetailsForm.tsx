import React, { useState } from 'react';
import { User, Mail, Phone, CreditCard, Sparkles, ChevronDown } from 'lucide-react';
import { GuestDetails, SelectedUnit, SearchParams } from '../hooks/useBookingState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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

  const [countryCode, setCountryCode] = useState('+46');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const countries = [
    { code: '+1', name: 'US/CA', flag: '🇺🇸' },
    { code: '+44', name: 'UK', flag: '🇬🇧' },
    { code: '+46', name: 'SE', flag: '🇸🇪' },
    { code: '+47', name: 'NO', flag: '🇳🇴' },
    { code: '+45', name: 'DK', flag: '🇩🇰' },
    { code: '+49', name: 'DE', flag: '🇩🇪' },
    { code: '+33', name: 'FR', flag: '🇫🇷' },
    { code: '+39', name: 'IT', flag: '🇮🇹' },
    { code: '+34', name: 'ES', flag: '🇪🇸' },
    { code: '+31', name: 'NL', flag: '🇳🇱' }
  ];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\(\)]+$/;
    if (!phone) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (!phoneRegex.test(phone) || phone.length < 7) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(guestDetails.email);
    const isPhoneValid = validatePhone(guestDetails.phone);
    
    if (isEmailValid && isPhoneValid) {
      // Combine phone with country code for API
      const fullPhone = countryCode + guestDetails.phone.replace(/^0+/, '');
      setGuestDetails(prev => ({ ...prev, phone: fullPhone }));
      onSubmit(e);
    }
  };
  return <div className="min-h-screen py-8 px-4 bg-[#FCFBF7]">
  <div className="bg-white rounded-lg shadow-lg p-8 animate-slide-up max-w-6xl mx-auto">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="pt-[10px] pb-[10px] col-span-full">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">Guest Details</h1>
        
        {/* Booking Summary */}
        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6 w-full md:w-3/4 mx-auto">
          <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-3 md:mb-4 flex items-center">
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-blue-600 mr-2 md:mr-3" />
            Booking Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-xs md:text-sm text-gray-600">Property:</span>
              <span className="text-xs md:text-sm font-medium text-right">{selectedUnit.inventoryTypeName} - {selectedUnit.buildingName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs md:text-sm text-gray-600">Arrival Date:</span>
              <span className="text-xs md:text-sm font-medium">{formatDateWithWeekday(confirmedSearchParams.startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs md:text-sm text-gray-600">Departure Date:</span>
              <span className="text-xs md:text-sm font-medium">{formatDateWithWeekday(confirmedSearchParams.endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs md:text-sm text-gray-600">Duration:</span>
              <span className="text-xs md:text-sm font-medium">{calculateNights()} nights</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs md:text-sm text-gray-600">Guests:</span>
              <span className="text-xs md:text-sm font-medium">1</span>
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs md:text-sm text-gray-600">Price (excl. VAT):</span>
                <span className="text-xs md:text-sm font-medium">{formatCurrency(selectedUnit.selectedRate.totalPrice * 0.88)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs md:text-sm text-gray-600">VAT (12%):</span>
                <span className="text-xs md:text-sm font-medium">{formatCurrency(selectedUnit.selectedRate.totalPrice * 0.12)}</span>
              </div>
              <div className="flex justify-between text-sm md:text-xl font-bold border-t pt-2">
                <span>Total:</span>
                <div className="text-right">
                  <div className="text-lg md:text-2xl">{formatCurrency(selectedUnit.selectedRate.totalPrice)}</div>
                  <div className="text-xs md:text-sm text-gray-500 font-normal">VAT included</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>}
          <br/><br />
        <form onSubmit={handleSubmit} className="space-y-6">
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
              <input 
                type="email" 
                id="email" 
                required 
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                value={guestDetails.email} 
                onChange={e => setGuestDetails(prev => ({
                  ...prev,
                  email: e.target.value
                }))} 
                onBlur={() => validateEmail(guestDetails.email)}
                placeholder="name@example.com" 
              />
            </div>
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="flex gap-2">
              <div className="relative w-32">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input 
                  type="tel" 
                  id="phone" 
                  required
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${phoneError ? 'border-red-500' : 'border-gray-300'}`}
                  value={guestDetails.phone} 
                  onChange={e => setGuestDetails(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))} 
                  onBlur={() => validatePhone(guestDetails.phone)}
                  placeholder="Phone number" 
                />
              </div>
            </div>
            {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 md:gap-4 pt-6">
            <button type="button" onClick={onBack} className="flex-1 py-2 md:py-3 px-3 md:px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm md:text-base font-medium">
              Back to Search
            </button>
            <button type="submit" className="flex-1 py-2 md:py-3 px-3 md:px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base font-medium flex items-center justify-center">
              <CreditCard className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
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
