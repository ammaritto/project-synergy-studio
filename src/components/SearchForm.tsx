import React, { useState, useMemo } from 'react';
import { Search, Calendar, Users, ChevronLeft, ChevronRight } from 'lucide-react';
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
  // Calendar state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ 
    from: searchParams.startDate ? new Date(searchParams.startDate) : null, 
    to: searchParams.endDate ? new Date(searchParams.endDate) : null 
  });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Helper function to convert Date to ISO string
  const toLocalISO = (d: Date | null) => {
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const days = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);
  
  // Get days for next month (for two-month view)
  const nextMonth = useMemo(() => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    return next;
  }, [currentMonth]);
  
  const nextMonthDays = useMemo(() => getDaysInMonth(nextMonth), [nextMonth]);

  const handleDateClick = (date: Date) => {
    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      // Start new selection
      setDateRange({ from: date, to: null });
    } else {
      // Complete the range
      if (date < dateRange.from) {
        setDateRange({ from: date, to: dateRange.from });
      } else {
        setDateRange({ from: dateRange.from, to: date });
      }
    }
  };

  const handlePrevMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    if (dateRange.from && date.toDateString() === dateRange.from.toDateString()) return true;
    if (dateRange.to && date.toDateString() === dateRange.to.toDateString()) return true;
    return false;
  };

  const isInRange = (date: Date | null) => {
    if (!date || !dateRange.from) return false;
    
    if (dateRange.to) {
      return date > dateRange.from && date < dateRange.to;
    }
    
    // While selecting, show preview with hover
    if (hoveredDate && dateRange.from && !dateRange.to) {
      const start = dateRange.from < hoveredDate ? dateRange.from : hoveredDate;
      const end = dateRange.from < hoveredDate ? hoveredDate : dateRange.from;
      return date > start && date < end;
    }
    
    return false;
  };

  const isPastDate = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const formatDateRange = () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };

    if (!dateRange.from) return 'Pick a date range';
    if (!dateRange.to) return `${formatDate(dateRange.from)} - Select end date`;
    return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
  };

  const clearDates = () => {
    setDateRange({ from: null, to: null });
    setSearchParams(prev => ({ ...prev, startDate: '', endDate: '' }));
  };

  const applyDates = () => {
    if (dateRange.from && dateRange.to) {
      setSearchParams(prev => ({
        ...prev,
        startDate: toLocalISO(dateRange.from),
        endDate: toLocalISO(dateRange.to)
      }));
      setIsCalendarOpen(false);
    }
  };

  const getDayClassName = (date: Date | null) => {
    if (!date) return '';
    
    let classes = 'relative w-10 h-10 flex items-center justify-center text-sm rounded-lg cursor-pointer transition-all duration-200 ';
    
    if (isPastDate(date)) {
      classes += 'text-gray-300 cursor-not-allowed hover:bg-transparent ';
    } else if (isSelected(date)) {
      // Selected dates - primary blue color
      classes += 'bg-blue-500 text-white font-semibold hover:bg-blue-600 ';
    } else if (isInRange(date)) {
      // Dates in range - light blue
      classes += 'bg-blue-100 text-gray-700 hover:bg-blue-200 ';
    } else if (isToday(date)) {
      // Today - light grey background with border
      classes += 'bg-gray-100 text-gray-900 font-medium ring-2 ring-gray-300 hover:bg-gray-200 ';
    } else {
      // Regular dates
      classes += 'text-gray-700 hover:bg-gray-100 ';
    }
    
    return classes;
  };

  return (
    <div className="py-16 md:py-20 bg-white" id="search-section">
      <div className="container-modern">
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-up max-w-5xl mx-auto border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Range Picker */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Pick a date range
              </label>
              <div className="relative">
                <button
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className="w-full px-4 py-3 text-left bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className={dateRange.from ? 'text-gray-900' : 'text-gray-500'}>
                        {formatDateRange()}
                      </span>
                    </div>
                    {dateRange.from && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearDates();
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </button>

                {/* Calendar Dropdown */}
                {isCalendarOpen && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
                    <div className="flex gap-6">
                      {/* First Month */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <button
                            onClick={handlePrevMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                          </button>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                          </h3>
                          <div className="w-9" />
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {weekDays.map(day => (
                            <div key={day} className="w-10 h-10 flex items-center justify-center text-xs font-medium text-gray-500">
                              {day}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {days.map((date, index) => (
                            <div key={index}>
                              {date ? (
                                <div
                                  className={getDayClassName(date)}
                                  onClick={() => !isPastDate(date) && handleDateClick(date)}
                                  onMouseEnter={() => setHoveredDate(date)}
                                  onMouseLeave={() => setHoveredDate(null)}
                                >
                                  {date.getDate()}
                                </div>
                              ) : (
                                <div className="w-10 h-10" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Second Month */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-9" />
                          <h3 className="text-lg font-semibold text-gray-800">
                            {monthNames[nextMonth.getMonth()]} {nextMonth.getFullYear()}
                          </h3>
                          <button
                            onClick={handleNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                          {weekDays.map(day => (
                            <div key={`next-${day}`} className="w-10 h-10 flex items-center justify-center text-xs font-medium text-gray-500">
                              {day}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                          {nextMonthDays.map((date, index) => (
                            <div key={`next-${index}`}>
                              {date ? (
                                <div
                                  className={getDayClassName(date)}
                                  onClick={() => !isPastDate(date) && handleDateClick(date)}
                                  onMouseEnter={() => setHoveredDate(date)}
                                  onMouseLeave={() => setHoveredDate(null)}
                                >
                                  {date.getDate()}
                                </div>
                              ) : (
                                <div className="w-10 h-10" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end gap-2">
                      <button
                        onClick={clearDates}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={applyDates}
                        disabled={!dateRange.from || !dateRange.to}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Guests Dropdown */}
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

            {/* Studio Type Filter */}
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

            {/* Search Button */}
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
