import React, { useState } from 'react';
import { Calendar as CalendarIcon, Users, Search, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface SearchParams {
  startDate: string;
  endDate: string;
  guests: number;
}

interface StickySearchCTAProps {
  searchParams: SearchParams;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
  onSearch: () => void;
  loading: boolean;
}

const StickySearchCTA: React.FC<StickySearchCTAProps> = ({
  searchParams,
  setSearchParams,
  onSearch,
  loading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date for display (dd/mm/yyyy)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleApplyClick = () => {
    setIsExpanded(true);
  };

  const handleCollapseClick = () => {
    setIsExpanded(false);
  };

  const handleSearchClick = () => {
    onSearch();
    setIsExpanded(false);
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getMinEndDate = () => {
    if (!searchParams.startDate) return getTodayDate();
    const startDate = new Date(searchParams.startDate);
    startDate.setDate(startDate.getDate() + 3); // Minimum 3 nights
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
      <div className={`transition-all duration-300 ease-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="container-modern py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Quick Search</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCollapseClick}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Check-in
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
                <input
                  type="date"
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  value={searchParams.startDate}
                  min={getTodayDate()}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Check-out
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
                <input
                  type="date"
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  value={searchParams.endDate}
                  min={getMinEndDate()}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary" />
                <select
                  className="w-full pl-10 pr-8 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none text-foreground"
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
        </div>
      </div>
      
      <div className="container-modern py-4">
        <Button
          onClick={isExpanded ? handleSearchClick : handleApplyClick}
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center shadow-md"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              {isExpanded ? (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search Studios
                </>
              ) : (
                'Apply'
              )}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StickySearchCTA;