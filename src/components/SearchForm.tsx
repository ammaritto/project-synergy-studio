import React from 'react';
import { Search, Calendar, Users } from 'lucide-react';

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
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchParams,
  setSearchParams,
  onSearch,
  loading,
  getMinEndDate
}) => {
  // Format date for display (dd/mm/yyyy)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="py-16 md:py-20 bg-white" id="search-section">
      <div className="container-modern">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Available Studios
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            When are you looking to stay with us?
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-up max-w-5xl mx-auto border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-2">
                Pick a date range
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
                <input
                  type="text"
                  id="dateRange"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-gray-500"
                  value={searchParams.startDate && searchParams.endDate ? 
                    `${formatDateForDisplay(searchParams.startDate)} - ${formatDateForDisplay(searchParams.endDate)}` : 
                    'Select check-in and check-out dates'
                  }
                  placeholder="Select check-in and check-out dates"
                  readOnly
                  onClick={() => {
                    // For now, we'll use a simple approach with hidden date inputs
                    // In a real implementation, you'd integrate a proper date range picker
                    const startInput = document.getElementById('hiddenStartDate') as HTMLInputElement;
                    if (startInput) startInput.click();
                  }}
                />
                {/* Hidden date inputs for functionality */}
                <input
                  type="date"
                  id="hiddenStartDate"
                  className="absolute opacity-0 pointer-events-none"
                  value={searchParams.startDate}
                  onChange={(e) => {
                    setSearchParams(prev => ({ ...prev, startDate: e.target.value }));
                    // Auto-focus end date after start date is selected
                    setTimeout(() => {
                      const endInput = document.getElementById('hiddenEndDate') as HTMLInputElement;
                      if (endInput) endInput.click();
                    }, 100);
                  }}
                  min={new Date().toISOString().split('T')[0]}
                />
                <input
                  type="date"
                  id="hiddenEndDate"
                  className="absolute opacity-0 pointer-events-none"
                  value={searchParams.endDate}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
                  min={getMinEndDate()}
                />
              </div>
            </div>

            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-500" />
                <select
                  id="guests"
                  className="w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none transition-all duration-200 text-gray-800"
                  value={searchParams.guests}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} Guest{num !== 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button
                onClick={onSearch}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-lg font-semibold hover:scale-105 transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;