import React, { useState, useMemo } from 'react';
import { Search, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface SearchParams {
  startDate: string;
  endDate: string;
  guests: number;
}

interface SearchFormProps {
  searchParams: SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  onSearch: () => void;
  loading: boolean;
  getMinStartDate: () => string; // NEW: Added this prop
  getMinEndDate: () => string;
  error?: string;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchParams,
  setSearchParams,
  onSearch,
  loading,
  getMinStartDate, // NEW: Added this prop
  getMinEndDate,
  error
}) => {
  // Convert string dates to Date objects for DatePicker
  const startDateObj = searchParams.startDate ? new Date(searchParams.startDate) : null;
  const endDateObj = searchParams.endDate ? new Date(searchParams.endDate) : null;

  // Helper function to convert Date to ISO string
  const toLocalISO = (date: Date | null) => {
    if (!date) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleStartDateChange = (date: Date | null) => {
    const dateStr = toLocalISO(date);
    setSearchParams(prev => ({
      ...prev,
      startDate: dateStr
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    const dateStr = toLocalISO(date);
    setSearchParams(prev => ({
      ...prev,
      endDate: dateStr
    }));
  };

  // UPDATED: Get minimum dates using the props from App component
  const minStartDate = new Date(getMinStartDate()); // Today + 3 days
  
  const minEndDate = startDateObj ? (() => {
    const min = new Date(startDateObj);
    min.setDate(startDateObj.getDate() + 3); // Check-in + 3 days
    return min;
  })() : null;

  return (
    <div id="search-section" className="pt-4 pb-6 bg-[#FCFBF7]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Check-in */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <DatePicker
                  selected={startDateObj}
                  onChange={handleStartDateChange}
                  minDate={minStartDate} // UPDATED: Now uses today + 3 days
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select check-in"
                  className="w-full h-12 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 bg-white text-left"
                  wrapperClassName="w-full"
                  popperClassName="z-50"
                  showPopperArrow={false}
                  fixedHeight
                />
              </div>
            </div>

            {/* Check-out */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <DatePicker
                  selected={endDateObj}
                  onChange={handleEndDateChange}
                  minDate={minEndDate} // UPDATED: Now uses check-in + 3 days
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Select check-out"
                  className="w-full h-12 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 bg-white text-left"
                  wrapperClassName="w-full"
                  popperClassName="z-50"
                  showPopperArrow={false}
                  fixedHeight
                />
              </div>
            </div>

            {/* Guests Dropdown */}
            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                <select 
                  id="guests" 
                  className="w-full h-12 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none text-gray-900 bg-white appearance-none" 
                  value={searchParams.guests} 
                  onChange={e => setSearchParams(prev => ({
                    ...prev,
                    guests: parseInt(e.target.value)
                  }))}
                >
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button 
                onClick={onSearch} 
                disabled={loading} 
                className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="mt-2 text-center">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchForm;