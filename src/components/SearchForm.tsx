import React from 'react';
import { Search, Calendar as CalendarIcon, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

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
  hideFilter?: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({
  searchParams,
  setSearchParams,
  onSearch,
  loading,
  getMinEndDate,
  inventoryFilter,
  setInventoryFilter,
  hideFilter = false
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

const toLocalISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

  const selectedRange = React.useMemo(() => {
    const from = searchParams.startDate ? new Date(searchParams.startDate) : undefined;
    const to = searchParams.endDate ? new Date(searchParams.endDate) : undefined;
    return from || to ? { from, to } : undefined;
  }, [searchParams.startDate, searchParams.endDate]);

  const [open, setOpen] = React.useState(false);

  return (
    <div className="py-6 bg-white" id="search-section">
      <div className="container-modern">
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up max-w-5xl mx-auto border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="dateRange" className="block text-sm font-medium text-foreground mb-2">
                Pick a date range
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-border"
                    onClick={() => setOpen(true)}
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
                          setOpen(false);
                        }
                      }}
                      numberOfMonths={2}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      disabled={{ before: new Date() }}
                    />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-muted-foreground">Min 3 nights</span>
                      <Button variant="ghost" size="sm" onClick={() => { setSearchParams(prev => ({ ...prev, startDate: '', endDate: '' })); setOpen(false); }}>
                        Clear dates
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
              <label className="block text-sm font-medium text-foreground mb-2">&nbsp;</label>
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