import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface SimpleDateRangePickerProps {
  onDateChange?: (range: DateRange) => void;
  minDate?: Date;
  placeholder?: string;
}

export const SimpleDateRangePicker: React.FC<SimpleDateRangePickerProps> = ({
  onDateChange,
  minDate = new Date(),
  placeholder = "Select dates"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

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
    const compareDate = new Date(minDate);
    compareDate.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < compareDate;
  };

  const formatDateRange = () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    };

    if (!dateRange.from) return placeholder;
    if (!dateRange.to) return `${formatDate(dateRange.from)} - Select end date`;
    return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
  };

  const clearDates = () => {
    setDateRange({ from: null, to: null });
    if (onDateChange) {
      onDateChange({ from: null, to: null });
    }
  };

  const applyDates = () => {
    if (dateRange.from && dateRange.to) {
      setIsOpen(false);
      if (onDateChange) {
        onDateChange(dateRange);
      }
    }
  };

  const getDayClassName = (date: Date | null) => {
    if (!date) return '';
    
    let classes = 'relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-sm rounded-xl cursor-pointer transition-all duration-300 ';
    
    if (isPastDate(date)) {
      classes += 'text-gray-300 cursor-not-allowed hover:bg-transparent ';
    } else if (isSelected(date)) {
      // Selected dates - use the custom blue color
      classes += 'bg-[#1461E2] text-white font-semibold hover:bg-[#1252CC] shadow-lg ';
    } else if (isInRange(date)) {
      // Dates in range - very light blue
      classes += 'bg-blue-50 text-gray-700 hover:bg-blue-100 ';
    } else if (isToday(date)) {
      // Today - subtle gray background with border
      classes += 'bg-gray-50 text-gray-900 font-medium ring-2 ring-gray-200 hover:bg-gray-100 ';
    } else {
      // Regular dates
      classes += 'text-gray-700 hover:bg-gray-50 ';
    }
    
    return classes;
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
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
      {isOpen && (
        <div className="absolute top-full left-0 right-0 md:right-auto mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 md:p-6 z-50 w-full md:min-w-[640px] lg:min-w-[700px] max-w-[95vw]">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8">
            {/* First Month */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 md:p-3 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                </button>
                <h3 className="text-base md:text-lg font-semibold text-gray-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <div className="w-8 md:w-11" />
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3 md:mb-4">
                {weekDays.map(day => (
                  <div key={day} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xs font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-2">
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
                       <div className="w-10 h-10 md:w-12 md:h-12" />
                     )}
                   </div>
                 ))}
               </div>
             </div>

             {/* Second Month */}
             <div className="flex-1">
               <div className="flex items-center justify-between mb-4 md:mb-6">
                 <div className="w-8 md:w-11" />
                 <h3 className="text-base md:text-lg font-semibold text-gray-800">
                   {monthNames[nextMonth.getMonth()]} {nextMonth.getFullYear()}
                 </h3>
                 <button
                   onClick={handleNextMonth}
                   className="p-2 md:p-3 hover:bg-gray-50 rounded-xl transition-colors duration-200"
                 >
                   <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                 </button>
               </div>

               <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3 md:mb-4">
                 {weekDays.map(day => (
                   <div key={`next-${day}`} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-xs font-medium text-gray-500">
                     {day}
                   </div>
                 ))}
               </div>

               <div className="grid grid-cols-7 gap-1 md:gap-2">
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
                       <div className="w-10 h-10 md:w-12 md:h-12" />
                     )}
                  </div>
                ))}
              </div>
            </div>
          </div>

           {/* Actions */}
           <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-100 flex justify-end gap-2 md:gap-3">
             <button
               onClick={clearDates}
               className="px-4 md:px-6 py-2 md:py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors duration-200 font-medium text-sm md:text-base"
             >
               Clear
             </button>
             <button
               onClick={applyDates}
               disabled={!dateRange.from || !dateRange.to}
               className="px-4 md:px-6 py-2 md:py-3 bg-[#1461E2] text-white rounded-xl hover:bg-[#1252CC] transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium text-sm md:text-base"
             >
               Apply
             </button>
           </div>
        </div>
      )}
    </div>
  );
};
