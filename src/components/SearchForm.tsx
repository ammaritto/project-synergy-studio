import React from 'react';
import { Search, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DateRangePicker } from './DateRangePicker';
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
  const handleDateChange = (startDate: string, endDate: string) => {
    setSearchParams(prev => ({
      ...prev,
      startDate,
      endDate
    }));
    
    // Auto-search when both dates are selected
    if (startDate && endDate) {
      setTimeout(() => onSearch(), 100);
    }
  };
  return <div id="search-section" className="py-16 md:py-20">
      <div className="container-modern">
         {/* Header */}
         <div className="text-center mb-8">
           <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Studio</h1>
         </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 animate-slide-up max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Range Picker */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in & Check-out Dates
              </label>
              <DateRangePicker
                startDate={searchParams.startDate}
                endDate={searchParams.endDate}
                onDateChange={handleDateChange}
                placeholder="Select your stay dates"
                minDate={new Date()}
                disabled={loading}
              />
            </div>

            {/* Guests Dropdown */}
            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select id="guests" className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none h-12" value={searchParams.guests} onChange={e => setSearchParams(prev => ({
                ...prev,
                guests: parseInt(e.target.value)
              }))}>
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
          </div>

          {/* Search Button */}
          <div className="mt-6 flex justify-center">
            <button onClick={onSearch} disabled={loading} className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 min-w-[200px]">
              {loading ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div> : <>
                  <Search className="w-4 h-4" />
                  Search Studios
                </>}
            </button>
          </div>
          {/* Error message */}
          {error && <div className="mt-4 text-center">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>}
        </div>
      </div>
    </div>;
};
export default SearchForm;
