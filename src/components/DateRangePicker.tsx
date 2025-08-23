import * as React from "react"
import { format, addDays } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  className?: string
  startDate?: string
  endDate?: string
  onDateChange?: (startDate: string, endDate: string) => void
  placeholder?: string
  minDate?: Date
  disabled?: boolean
}

export function DateRangePicker({
  className,
  startDate,
  endDate,
  onDateChange,
  placeholder = "Select dates",
  minDate = new Date(),
  disabled = false,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (startDate && endDate) {
      return {
        from: new Date(startDate),
        to: new Date(endDate),
      }
    }
    return undefined
  })

  const [isOpen, setIsOpen] = React.useState(false)

  // Update internal state when props change
  React.useEffect(() => {
    if (startDate && endDate) {
      setDate({
        from: new Date(startDate),
        to: new Date(endDate),
      })
    } else {
      setDate(undefined)
    }
  }, [startDate, endDate])

  const handleDateSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate)
    
    if (selectedDate?.from && selectedDate?.to && onDateChange) {
      const start = format(selectedDate.from, "yyyy-MM-dd")
      const end = format(selectedDate.to, "yyyy-MM-dd")
      onDateChange(start, end)
      setIsOpen(false)
    }
  }

  const clearDates = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDate(undefined)
    if (onDateChange) {
      onDateChange("", "")
    }
  }

  const formatDateRange = () => {
    if (!date?.from) return placeholder
    
    if (date.to) {
      return `${format(date.from, "MMM dd")} - ${format(date.to, "MMM dd, yyyy")}`
    }
    
    return `${format(date.from, "MMM dd, yyyy")} - Select end date`
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal h-12 px-4",
              !date && "text-muted-foreground",
              "border-2 hover:border-primary/50 focus:border-primary transition-colors"
            )}
          >
            <CalendarIcon className="mr-3 h-5 w-5 text-muted-foreground" />
            <span className="flex-1">
              {formatDateRange()}
            </span>
            {date?.from && (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-transparent"
                onClick={clearDates}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 shadow-lg" align="start">
          <div className="p-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              disabled={(date) => date < minDate}
              className="rounded-md border-0"
            />
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={clearDates}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear
              </Button>
              <div className="text-xs text-muted-foreground">
                Select check-in and check-out dates
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}