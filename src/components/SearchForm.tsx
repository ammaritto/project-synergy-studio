import React from 'react';
import { Search, Users } from 'lucide-react';
import { SimpleDateRangePicker } from './SimpleDateRangePicker';
import { Button } from "@/components/ui/button";

// ... other imports and interfaces ...

const SearchForm: React.FC<SearchFormProps> = ({
  searchParams,
  setSearchParams,
  onSearch,
  loading,
  getMinEndDate,
  inventoryFilter,
  setInventoryFilter
}) => {
  
  // Handle date range change
  const handleDateRangeChange = (range: { from: Date | null; to: Date | null }) => {
    const toLocalISO = (d: Date | null) => {
      if (!d) return '';
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    setSearchParams(prev => ({
      ...prev,
      startDate: toLocalISO(range.from),
      endDate: toLocalISO(range.to)
    }));
  };

  return (
    <div className="py-16 md:py-20 bg-white" id="search-section">
      <div className="container-modern">
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-up max-w-5xl mx-auto border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pick a date range
              </label>
              <SimpleDateRangePicker
                onDateChange={handleDateRangeChange}
                placeholder="Select check-in and check-out dates"
                minDate={new Date()}
              />
            </div>

            {/* Rest of your form (guests, studio type, search button) */}
            {/* ... */}
          </div>
        </div>
      </div>
    </div>
  );
};
