import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangeFilterProps {
  label: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangeFilter({ label, value, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (range: any) => {
    onChange(range || { from: undefined, to: undefined });
    if (range?.from && range?.to) {
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={`date-${label.toLowerCase().replace(' ', '-')}`}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} -{" "}
                  {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value.from}
            selected={value}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="p-3 pointer-events-auto"
            disabled={{ before: new Date() }}
          />
          <div className="flex justify-between items-center p-3 pt-0">
            <span className="text-xs text-muted-foreground">Min 3 nights</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                onChange({ from: undefined, to: undefined });
                setIsOpen(false);
              }}
            >
              Clear dates
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
