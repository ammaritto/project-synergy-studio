import React, { useState, useMemo } from 'react';
import { Search, Calendar, Users, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
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
  // Calendar state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: searchParams.startDate ? new Date(searchParams.startDate) : null,
    to: searchParams.endDate ? new Date(searchParams.endDate) : null
  });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
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
    if (!dateRange.from || dateRange.from && dateRange.to) {
      // Start new selection
      setDateRange({
        from: date,
        to: null
      });
    } else {
      // Complete the range - enforce 3-night minimum
      if (date < dateRange.from) {
        setDateRange({
          from: date,
          to: dateRange.from
        });
      } else {
        const daysDiff = Math.floor((date.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 3) {
          setDateRange({
            from: dateRange.from,
            to: date
          });
        }
        // If less than 3 days, don't complete the selection
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
  const isInvalidEndDate = (date: Date | null) => {
    if (!date || !dateRange.from || dateRange.to) return false;
    const daysDiff = Math.floor((date.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    return date > dateRange.from && daysDiff < 3;
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
    setDateRange({
      from: null,
      to: null
    });
    setSearchParams(prev => ({
      ...prev,
      startDate: '',
      endDate: ''
    }));
  };
  const applyDates = () => {
    if (dateRange.from && dateRange.to) {
      setSearchParams(prev => ({
        ...prev,
        startDate: toLocalISO(dateRange.from),
        endDate: toLocalISO(dateRange.to)
      }));
      setIsCalendarOpen(false);
      onSearch(); // Trigger search when apply is clicked
    }
  };
  const getDayClassName = (date: Date | null) => {
    if (!date) return '';
    let classes = 'relative w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-sm rounded-xl cursor-pointer transition-all duration-300 font-medium ';
    if (isPastDate(date)) {
      classes += 'text-gray-300 cursor-not-allowed hover:bg-transparent opacity-40 ';
    } else if (isInvalidEndDate(date)) {
      // Invalid end dates (less than 3 nights from start) - grayed out and not clickable
      classes += 'text-red-300 cursor-not-allowed hover:bg-transparent opacity-50 ';
    } else if (isSelected(date)) {
      // Selected dates - using the blue theme color with reduced padding
      classes += 'bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold hover:from-blue-600 hover:to-blue-700 shadow-lg transform scale-105 ring-2 ring-blue-200 ';
    } else if (isInRange(date)) {
      // Dates in range - light blue
      classes += 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 hover:from-blue-100 hover:to-blue-150 border border-blue-200 ';
    } else if (isToday(date)) {
      // Today - subtle gray background with border
      classes += 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-800 font-bold ring-2 ring-amber-300 hover:from-amber-100 hover:to-amber-150 shadow-sm ';
    } else {
      // Regular dates
      classes += 'text-gray-700 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 hover:shadow-sm hover:scale-105 ';
    }
    return classes;
  };
  return <div id="search-section" className="py-16 md:py-20">
      <div className="container-modern">
         {/* Header */}
         <div className="text-center mb-8">
           <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Studio</h1>
         </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-slide-up max-w-6xl mx-auto border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Check-in */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-in
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                <input type="date" value={searchParams.startDate} onChange={e => setSearchParams(prev => ({
                ...prev,
                startDate: e.target.value
              }))} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white font-medium" />
              </div>
            </div>

            {/* Check-out */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check-out
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                <input type="date" value={searchParams.endDate} onChange={e => setSearchParams(prev => ({
                ...prev,
                endDate: e.target.value
              }))} min={getMinEndDate()} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white font-medium" />
              </div>
            </div>

            {/* Guests Dropdown */}
            <div>
              <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-500" />
                <select id="guests" className="w-full pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-all duration-200 bg-gray-50 hover:bg-white font-medium" value={searchParams.guests} onChange={e => setSearchParams(prev => ({
                ...prev,
                guests: parseInt(e.target.value)
              }))}>
                  <option value={1}>1 Guest</option>
                  <option value={2}>2 Guests</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">&nbsp;</label>
              <button onClick={onSearch} disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                {loading ? <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div> : <>
                    <Search className="w-5 h-5" />
                    Search
                  </>}
              </button>
            </div>
          </div>
          
          {/* Error message */}
          {error && <div className="mt-4 text-center">
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 inline-block">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>}
        </div>
      </div>
    </div>;
};
export default SearchForm;
