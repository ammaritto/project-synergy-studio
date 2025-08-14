import React from 'react';
import { Search, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from '@/components/DateRangeFilter';

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
  // Convert string dates to Date objects for the DateRangeFilter
  const dateRange = React.useMemo(() => ({
    from: searchParams.startDate ? new Date(searchParams.startDate) : undefined,
    to: searchParams.endDate ? new Date(searchParams.endDate) : undefined,
  }), [searchParams.startDate, searchParams.endDate]);

  // Convert Date objects back to string format for searchParams
  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    const toLocalISO = (date: Date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    let from = range.from;
    let to = range.to;

    // Enforce minimum 3 nights stay
    if (from && to) {
      const diffMs = to.getTime() - from.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 3) {
        const forced = new Date(from);
        forced.setDate(forced.getDate() + 3);
        to = forced;
      }
    }

    setSearchParams(prev => ({
      ...prev,
      startDate: from ? toLocalISO(from) : '',
      endDate: to ? toLocalISO(to) : '',
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
          </div>

          {inventoryFilter && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-foreground mb-2">
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
          )}

          <div className="flex justify-center mt-8">
            <Button
              onClick={onSearch}
              disabled={loading || !searchParams.startDate || !searchParams.endDate}
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Available Studios
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchForm;
