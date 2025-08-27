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
    { code: '+1', name: 'United States', flag: '🇺🇸' },
    { code: '+1', name: 'Canada', flag: '🇨🇦' },
    { code: '+7', name: 'Russia', flag: '🇷🇺' },
    { code: '+20', name: 'Egypt', flag: '🇪🇬' },
    { code: '+27', name: 'South Africa', flag: '🇿🇦' },
    { code: '+30', name: 'Greece', flag: '🇬🇷' },
    { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
    { code: '+32', name: 'Belgium', flag: '🇧🇪' },
    { code: '+33', name: 'France', flag: '🇫🇷' },
    { code: '+34', name: 'Spain', flag: '🇪🇸' },
    { code: '+36', name: 'Hungary', flag: '🇭🇺' },
    { code: '+39', name: 'Italy', flag: '🇮🇹' },
    { code: '+40', name: 'Romania', flag: '🇷🇴' },
    { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
    { code: '+43', name: 'Austria', flag: '🇦🇹' },
    { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
    { code: '+45', name: 'Denmark', flag: '🇩🇰' },
    { code: '+46', name: 'Sweden', flag: '🇸🇪' },
    { code: '+47', name: 'Norway', flag: '🇳🇴' },
    { code: '+48', name: 'Poland', flag: '🇵🇱' },
    { code: '+49', name: 'Germany', flag: '🇩🇪' },
    { code: '+51', name: 'Peru', flag: '🇵🇪' },
    { code: '+52', name: 'Mexico', flag: '🇲🇽' },
    { code: '+53', name: 'Cuba', flag: '🇨🇺' },
    { code: '+54', name: 'Argentina', flag: '🇦🇷' },
    { code: '+55', name: 'Brazil', flag: '🇧🇷' },
    { code: '+56', name: 'Chile', flag: '🇨🇱' },
    { code: '+57', name: 'Colombia', flag: '🇨🇴' },
    { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
    { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
    { code: '+61', name: 'Australia', flag: '🇦🇺' },
    { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
    { code: '+63', name: 'Philippines', flag: '🇵🇭' },
    { code: '+64', name: 'New Zealand', flag: '🇳🇿' },
    { code: '+65', name: 'Singapore', flag: '🇸🇬' },
    { code: '+66', name: 'Thailand', flag: '🇹🇭' },
    { code: '+81', name: 'Japan', flag: '🇯🇵' },
    { code: '+82', name: 'South Korea', flag: '🇰🇷' },
    { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
    { code: '+86', name: 'China', flag: '🇨🇳' },
    { code: '+90', name: 'Turkey', flag: '🇹🇷' },
    { code: '+91', name: 'India', flag: '🇮🇳' },
    { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
    { code: '+93', name: 'Afghanistan', flag: '🇦🇫' },
    { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
    { code: '+95', name: 'Myanmar', flag: '🇲🇲' },
    { code: '+98', name: 'Iran', flag: '🇮🇷' },
    { code: '+212', name: 'Morocco', flag: '🇲🇦' },
    { code: '+213', name: 'Algeria', flag: '🇩🇿' },
    { code: '+216', name: 'Tunisia', flag: '🇹🇳' },
    { code: '+218', name: 'Libya', flag: '🇱🇾' },
    { code: '+220', name: 'Gambia', flag: '🇬🇲' },
    { code: '+221', name: 'Senegal', flag: '🇸🇳' },
    { code: '+222', name: 'Mauritania', flag: '🇲🇷' },
    { code: '+223', name: 'Mali', flag: '🇲🇱' },
    { code: '+224', name: 'Guinea', flag: '🇬🇳' },
    { code: '+225', name: 'Ivory Coast', flag: '🇨🇮' },
    { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: '+227', name: 'Niger', flag: '🇳🇪' },
    { code: '+228', name: 'Togo', flag: '🇹🇬' },
    { code: '+229', name: 'Benin', flag: '🇧🇯' },
    { code: '+230', name: 'Mauritius', flag: '🇲🇺' },
    { code: '+231', name: 'Liberia', flag: '🇱🇷' },
    { code: '+232', name: 'Sierra Leone', flag: '🇸🇱' },
    { code: '+233', name: 'Ghana', flag: '🇬🇭' },
    { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
    { code: '+235', name: 'Chad', flag: '🇹🇩' },
    { code: '+236', name: 'Central African Republic', flag: '🇨🇫' },
    { code: '+237', name: 'Cameroon', flag: '🇨🇲' },
    { code: '+238', name: 'Cape Verde', flag: '🇨🇻' },
    { code: '+239', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
    { code: '+240', name: 'Equatorial Guinea', flag: '🇬🇶' },
    { code: '+241', name: 'Gabon', flag: '🇬🇦' },
    { code: '+242', name: 'Republic of the Congo', flag: '🇨🇬' },
    { code: '+243', name: 'Democratic Republic of the Congo', flag: '🇨🇩' },
    { code: '+244', name: 'Angola', flag: '🇦🇴' },
    { code: '+245', name: 'Guinea-Bissau', flag: '🇬🇼' },
    { code: '+246', name: 'British Indian Ocean Territory', flag: '🇮🇴' },
    { code: '+248', name: 'Seychelles', flag: '🇸🇨' },
    { code: '+249', name: 'Sudan', flag: '🇸🇩' },
    { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
    { code: '+251', name: 'Ethiopia', flag: '🇪🇹' },
    { code: '+252', name: 'Somalia', flag: '🇸🇴' },
    { code: '+253', name: 'Djibouti', flag: '🇩🇯' },
    { code: '+254', name: 'Kenya', flag: '🇰🇪' },
    { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
    { code: '+256', name: 'Uganda', flag: '🇺🇬' },
    { code: '+257', name: 'Burundi', flag: '🇧🇮' },
    { code: '+258', name: 'Mozambique', flag: '🇲🇿' },
    { code: '+260', name: 'Zambia', flag: '🇿🇲' },
    { code: '+261', name: 'Madagascar', flag: '🇲🇬' },
    { code: '+262', name: 'Réunion', flag: '🇷🇪' },
    { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
    { code: '+264', name: 'Namibia', flag: '🇳🇦' },
    { code: '+265', name: 'Malawi', flag: '🇲🇼' },
    { code: '+266', name: 'Lesotho', flag: '🇱🇸' },
    { code: '+267', name: 'Botswana', flag: '🇧🇼' },
    { code: '+268', name: 'Eswatini', flag: '🇸🇿' },
    { code: '+269', name: 'Comoros', flag: '🇰🇲' },
    { code: '+290', name: 'Saint Helena', flag: '🇸🇭' },
    { code: '+291', name: 'Eritrea', flag: '🇪🇷' },
    { code: '+297', name: 'Aruba', flag: '🇦🇼' },
    { code: '+298', name: 'Faroe Islands', flag: '🇫🇴' },
    { code: '+299', name: 'Greenland', flag: '🇬🇱' },
    { code: '+350', name: 'Gibraltar', flag: '🇬🇮' },
    { code: '+351', name: 'Portugal', flag: '🇵🇹' },
    { code: '+352', name: 'Luxembourg', flag: '🇱🇺' },
    { code: '+353', name: 'Ireland', flag: '🇮🇪' },
    { code: '+354', name: 'Iceland', flag: '🇮🇸' },
    { code: '+355', name: 'Albania', flag: '🇦🇱' },
    { code: '+356', name: 'Malta', flag: '🇲🇹' },
    { code: '+357', name: 'Cyprus', flag: '🇨🇾' },
    { code: '+358', name: 'Finland', flag: '🇫🇮' },
    { code: '+359', name: 'Bulgaria', flag: '🇧🇬' },
    { code: '+370', name: 'Lithuania', flag: '🇱🇹' },
    { code: '+371', name: 'Latvia', flag: '🇱🇻' },
    { code: '+372', name: 'Estonia', flag: '🇪🇪' },
    { code: '+373', name: 'Moldova', flag: '🇲🇩' },
    { code: '+374', name: 'Armenia', flag: '🇦🇲' },
    { code: '+375', name: 'Belarus', flag: '🇧🇾' },
    { code: '+376', name: 'Andorra', flag: '🇦🇩' },
    { code: '+377', name: 'Monaco', flag: '🇲🇨' },
    { code: '+378', name: 'San Marino', flag: '🇸🇲' },
    { code: '+380', name: 'Ukraine', flag: '🇺🇦' },
    { code: '+381', name: 'Serbia', flag: '🇷🇸' },
    { code: '+382', name: 'Montenegro', flag: '🇲🇪' },
    { code: '+383', name: 'Kosovo', flag: '🇽🇰' },
    { code: '+385', name: 'Croatia', flag: '🇭🇷' },
    { code: '+386', name: 'Slovenia', flag: '🇸🇮' },
    { code: '+387', name: 'Bosnia and Herzegovina', flag: '🇧🇦' },
    { code: '+389', name: 'North Macedonia', flag: '🇲🇰' },
    { code: '+420', name: 'Czech Republic', flag: '🇨🇿' },
    { code: '+421', name: 'Slovakia', flag: '🇸🇰' },
    { code: '+423', name: 'Liechtenstein', flag: '🇱🇮' },
    { code: '+500', name: 'Falkland Islands', flag: '🇫🇰' },
    { code: '+501', name: 'Belize', flag: '🇧🇿' },
    { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
    { code: '+503', name: 'El Salvador', flag: '🇸🇻' },
    { code: '+504', name: 'Honduras', flag: '🇭🇳' },
    { code: '+505', name: 'Nicaragua', flag: '🇳🇮' },
    { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
    { code: '+507', name: 'Panama', flag: '🇵🇦' },
    { code: '+508', name: 'Saint Pierre and Miquelon', flag: '🇵🇲' },
    { code: '+509', name: 'Haiti', flag: '🇭🇹' },
    { code: '+590', name: 'Guadeloupe', flag: '🇬🇵' },
    { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
    { code: '+592', name: 'Guyana', flag: '🇬🇾' },
    { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
    { code: '+594', name: 'French Guiana', flag: '🇬🇫' },
    { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
    { code: '+596', name: 'Martinique', flag: '🇲🇶' },
    { code: '+597', name: 'Suriname', flag: '🇸🇷' },
    { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
    { code: '+599', name: 'Netherlands Antilles', flag: '🇳🇱' },
    { code: '+670', name: 'East Timor', flag: '🇹🇱' },
    { code: '+672', name: 'Antarctica', flag: '🇦🇶' },
    { code: '+673', name: 'Brunei', flag: '🇧🇳' },
    { code: '+674', name: 'Nauru', flag: '🇳🇷' },
    { code: '+675', name: 'Papua New Guinea', flag: '🇵🇬' },
    { code: '+676', name: 'Tonga', flag: '🇹🇴' },
    { code: '+677', name: 'Solomon Islands', flag: '🇸🇧' },
    { code: '+678', name: 'Vanuatu', flag: '🇻🇺' },
    { code: '+679', name: 'Fiji', flag: '🇫🇯' },
    { code: '+680', name: 'Palau', flag: '🇵🇼' },
    { code: '+681', name: 'Wallis and Futuna', flag: '🇼🇫' },
    { code: '+682', name: 'Cook Islands', flag: '🇨🇰' },
    { code: '+683', name: 'Niue', flag: '🇳🇺' },
    { code: '+684', name: 'American Samoa', flag: '🇦🇸' },
    { code: '+685', name: 'Samoa', flag: '🇼🇸' },
    { code: '+686', name: 'Kiribati', flag: '🇰🇮' },
    { code: '+687', name: 'New Caledonia', flag: '🇳🇨' },
    { code: '+688', name: 'Tuvalu', flag: '🇹🇻' },
    { code: '+689', name: 'French Polynesia', flag: '🇵🇫' },
    { code: '+690', name: 'Tokelau', flag: '🇹🇰' },
    { code: '+691', name: 'Micronesia', flag: '🇫🇲' },
    { code: '+692', name: 'Marshall Islands', flag: '🇲🇭' },
    { code: '+850', name: 'North Korea', flag: '🇰🇵' },
    { code: '+852', name: 'Hong Kong', flag: '🇭🇰' },
    { code: '+853', name: 'Macau', flag: '🇲🇴' },
    { code: '+855', name: 'Cambodia', flag: '🇰🇭' },
    { code: '+856', name: 'Laos', flag: '🇱🇦' },
    { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
    { code: '+886', name: 'Taiwan', flag: '🇹🇼' },
    { code: '+960', name: 'Maldives', flag: '🇲🇻' },
    { code: '+961', name: 'Lebanon', flag: '🇱🇧' },
    { code: '+962', name: 'Jordan', flag: '🇯🇴' },
    { code: '+963', name: 'Syria', flag: '🇸🇾' },
    { code: '+964', name: 'Iraq', flag: '🇮🇶' },
    { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
    { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: '+967', name: 'Yemen', flag: '🇾🇪' },
    { code: '+968', name: 'Oman', flag: '🇴🇲' },
    { code: '+970', name: 'Palestine', flag: '🇵🇸' },
    { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
    { code: '+972', name: 'Israel', flag: '🇮🇱' },
    { code: '+973', name: 'Bahrain', flag: '🇧🇭' },
    { code: '+974', name: 'Qatar', flag: '🇶🇦' },
    { code: '+975', name: 'Bhutan', flag: '🇧🇹' },
    { code: '+976', name: 'Mongolia', flag: '🇲🇳' },
    { code: '+977', name: 'Nepal', flag: '🇳🇵' },
    { code: '+992', name: 'Tajikistan', flag: '🇹🇯' },
    { code: '+993', name: 'Turkmenistan', flag: '🇹🇲' },
    { code: '+994', name: 'Azerbaijan', flag: '🇦🇿' },
    { code: '+995', name: 'Georgia', flag: '🇬🇪' },
    { code: '+996', name: 'Kyrgyzstan', flag: '🇰🇬' },
    { code: '+998', name: 'Uzbekistan', flag: '🇺🇿' }
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

  return (
    <div 
      className="min-h-screen py-8 px-4 bg-[#FCFBF7]"
      data-content-section="guest-details" 
      data-visible="true"
    >
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
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
                    <input 
                      type="text" 
                      id="firstName" 
                      required 
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={guestDetails.firstName} 
                      onChange={e => setGuestDetails(prev => ({
                        ...prev,
                        firstName: e.target.value
                      }))} 
                      placeholder="John" 
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input 
                      type="text" 
                      id="lastName" 
                      required 
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      value={guestDetails.lastName} 
                      onChange={e => setGuestDetails(prev => ({
                        ...prev,
                        lastName: e.target.value
                      }))} 
                      placeholder="Doe" 
                    />
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
                  <div className="relative w-20 sm:w-28 md:w-32">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-full h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {countries.map((country) => (
                          <SelectItem key={`${country.code}-${country.name}`} value={country.code}>
                            <span className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span className="text-xs">{country.code}</span>
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
                <button 
                  type="button" 
                  onClick={onBack} 
                  className="flex-1 py-2 md:py-3 px-3 md:px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm md:text-base font-medium"
                >
                  Back to Search
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2 md:py-3 px-3 md:px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base font-medium flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
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