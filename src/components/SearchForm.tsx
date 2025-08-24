import React, { useState, useMemo } from 'react';
import { Search, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DateRangePicker } from '@/components/DateRangePicker';
import { DateRange } from 'react-day-picker';

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
  getMinEndDate: () => string;
  error?: string;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchParams,
  setSearchParams,
  onSearch,
  loading,
  getMinEndDate,
  error
}) => {
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = searchParams.startDate ? new Date(searchParams.startDate) : undefined;
    const to = searchParams.endDate ? new Date(searchParams.endDate) : undefined;
    return from || to ? { from, to } : undefined;
  });
  // Helper function to convert Date to ISO string
  const toLocalISO = (d: Date | undefined) => {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range?.to) {
      setSearchParams(prev => ({
        ...prev,
        startDate: toLocalISO(range.from),
        endDate: toLocalISO(range.to)
      }));
    }
  };

  return (
    <div id="search-section" className="pt-4 pb-6 bg-[#FCFBF7]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-4 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Range Picker */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in - Check-out
              </label>
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                placeholder="Select your dates"
              />
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
          
          {/* Error message - Compact styling */}
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