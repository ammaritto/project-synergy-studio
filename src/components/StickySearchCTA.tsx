import React, { useState } from 'react';
import { Calendar as CalendarIcon, Users, Search, ChevronUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  hasSearched?: boolean;
  hasResults?: boolean;
  onReset?: () => void;
}

const StickySearchCTA: React.FC<StickySearchCTAProps> = ({
  searchParams,
  setSearchParams,
  onSearch,
  loading,
  hasSearched = false,
  hasResults = true,
  onReset
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [manuallyExpanded, setManuallyExpanded] = useState(false);

  // Format date for display (dd/mm/yyyy)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Convert date to local ISO format
  const toLocalISO = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Create date range for calendar
  const selectedRange = React.useMemo(() => {
    const from = searchParams.startDate ? new Date(searchParams.startDate) : undefined;
    const to = searchParams.endDate ? new Date(searchParams.endDate) : undefined;
    return from || to ? { from, to } : undefined;
  }, [searchParams.startDate, searchParams.endDate]);

  const handleApplyClick = () => {
    setIsExpanded(true);
    setManuallyExpanded(true);
  };

  // Auto-expand when no results found
  React.useEffect(() => {
    if (hasSearched && !hasResults) {
      setIsExpanded(true);
    }
  }, [hasSearched, hasResults]);

  const handleSearchClick = () => {
    onSearch();
    // Don't collapse after search if manually expanded
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
      {/* Expanded Content */}
      {isExpanded && (
        <div className="transition-all duration-500 ease-out">
          <div className="container-modern py-4">
            
            {/* No Results Message */}
            {hasSearched && !hasResults && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No studios match your search</h3>
                <p className="text-gray-600 text-sm">
                  Try adjusting your dates or number of guests to find available studios.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pick dates
                </label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal border-border"
                      onClick={() => setCalendarOpen(true)}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                      {selectedRange?.from && selectedRange?.to
                        ? `${formatDateForDisplay(toLocalISO(selectedRange.from!))} - ${formatDateForDisplay(toLocalISO(selectedRange.to!))}`
                        : "Pick a date range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2">
                      <Calendar
                        mode="range"
                        selected={selectedRange as any}
                        onSelect={(range) => {
                          const r = range as { from?: Date; to?: Date } | undefined;
                          let from = r?.from;
                          let to = r?.to;

                          if (from && to) {
                            const diffMs = to.getTime() - from.getTime();
                            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
                            if (diffDays < 3) {
                              const forced = new Date(from);
                              forced.setDate(forced.getDate() + 3);
                              to = forced;
                            }
                          }

                          const newStart = from ? toLocalISO(from) : '';
                          const newEnd = to ? toLocalISO(to) : '';
                          setSearchParams(prev => ({ ...prev, startDate: newStart, endDate: newEnd }));
                          if (from && (to || newEnd)) {
                            setCalendarOpen(false);
                          }
                        }}
                        numberOfMonths={2}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        disabled={{ before: new Date() }}
                      />
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-muted-foreground">Min 3 nights</span>
                        <Button variant="ghost" size="sm" onClick={() => { 
                          setSearchParams(prev => ({ ...prev, startDate: '', endDate: '' })); 
                          setCalendarOpen(false); 
                        }}>
                          Clear dates
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
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
      )}
      
      {/* Compact Button */}
      <div className="px-4 py-2">
        <Button
          onClick={isExpanded ? handleSearchClick : handleApplyClick}
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center shadow-md transform hover:scale-[1.02]"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              {isExpanded ? (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Find your Studio
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