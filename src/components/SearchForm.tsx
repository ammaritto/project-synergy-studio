import React from 'react';
import { Search, Users } from 'lucide-react';
import { DateRangeFilter } from './DateRangeFilter';
import { Button } from "@/components/ui/button";

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
  inventoryFilter: 'ALL' | 'Studio Plus' | 'Studio';
  setInventoryFilter: React.Dispatch<React.SetStateAction<'ALL' | 'Studio Plus' | 'Studio'>>;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchParams,
  setSearchParams,
  onSearch,
  loading,
  getMinEndDate,
  inventoryFilter,
  setInventoryFilter
}) => {
  // Convert string dates to Date objects for DateRangeFilter
  const dateRange = React.useMemo(() => ({
    from: searchParams.startDate ? new Date(searchParams.startDate) : undefined,
    to: searchParams.endDate ? new Date(searchParams.endDate) : undefined
  }), [searchParams.startDate, searchParams.endDate]);

  // Handle date range change from DateRangeFilter
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    const toLocalISO = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    setSearchParams(prev => ({
      ...prev,
      startDate: range.from ? toLocalISO(range.from) : '',
      endDate: range.to ? toLocalISO(range.to) : ''
    }));
  };

  return (
    <div className="py-16 md:py-20 bg-white" id="search-section">
      <div className="container-modern">
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-up max-w-5xl mx-auto border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <DateRangeFilter
                label="Pick a date range"
                value={dateRange}
                onChange={handleDateRangeChange}
              />
            </div>

            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-foreground mb-2">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
                <select
                  id="guests"
                  className="w-full pl-10 pr-8 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none transition-all duration-200 text-foreground"
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
              <label htmlFor="studioType" className="block text-sm font-medium text-foreground mb-2">
                Studio type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={inventoryFilter === 'Studio' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setInventoryFilter(prev => (prev === 'Studio' ? 'ALL' : 'Studio'))}
                >
                  Studio
                </Button>
                <Button
                  type="button"
                  variant={inventoryFilter === 'Studio Plus' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setInventoryFilter(prev => (prev === 'Studio Plus' ? 'ALL' : 'Studio Plus'))}
                >
                  Studio Plus
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2"> </label>
              <button
                onClick={onSearch}
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center shadow-md group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
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
