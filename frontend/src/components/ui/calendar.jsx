import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  showNavigation = true,
  showWeekNumber = false,
  weekStartsOn = 1,
  disabled,
  selected,
  onSelect,
  locale,
  captionLayout = "buttons",
  numberOfMonths = 1,
  fromDate,
  toDate,
  today,
  initialFocus,
  ...props
}) {
  // Memoize the caption component to prevent unnecessary re-renders
  const renderCaption = React.useCallback(({ displayMonth }) => {
    const month = displayMonth.toLocaleDateString(locale, { month: 'long' });
    const year = displayMonth.getFullYear();
    
    return (
      <div className="text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
        {month} {year}
      </div>
    );
  }, [locale]);

  // Memoize classNames object
  const memoizedClassNames = React.useMemo(() => ({
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-4",
    caption: cn(
      "flex justify-center pt-1 relative items-center",
      captionLayout === "dropdown" && "mb-4"
    ),
    caption_label: cn(
      "text-sm font-semibold text-gray-900 dark:text-gray-100",
      captionLayout === "dropdown" && "hidden"
    ),
    nav: "space-x-1 flex items-center",
    nav_button: cn(
      buttonVariants({ variant: "outline", size: "icon-sm" }),
      "h-8 w-8 p-0 bg-transparent border-gray-300 dark:border-gray-600",
      "hover:bg-gray-100 dark:hover:bg-gray-800",
      "disabled:opacity-30 disabled:pointer-events-none"
    ),
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell: cn(
      "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-xs",
      "uppercase tracking-wider"
    ),
    row: "flex w-full mt-2",
    cell: cn(
      "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
      "h-9 w-9",
      "first:[&:has([aria-selected])]:rounded-l-md",
      "last:[&:has([aria-selected])]:rounded-r-md"
    ),
    day: cn(
      buttonVariants({ variant: "ghost", size: "icon" }),
      "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
      "hover:bg-gray-100 dark:hover:bg-gray-800"
    ),
    day_range_start: "day-range-start",
    day_range_end: "day-range-end",
    day_selected: cn(
      "bg-blue-600 text-white hover:bg-blue-700 hover:text-white",
      "focus:bg-blue-600 focus:text-white"
    ),
    day_today: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    day_outside: cn(
      "text-gray-400 dark:text-gray-500",
      "aria-selected:bg-gray-100 aria-selected:text-gray-400",
      "dark:aria-selected:bg-gray-800 dark:aria-selected:text-gray-500"
    ),
    day_disabled: "text-gray-300 dark:text-gray-600 cursor-not-allowed",
    day_range_middle: cn(
      "aria-selected:bg-blue-100 aria-selected:text-blue-600",
      "dark:aria-selected:bg-blue-900/30 dark:aria-selected:text-blue-400"
    ),
    day_hidden: "invisible",
    weeknumber: "text-xs text-gray-500 dark:text-gray-400",
    ...classNames,
  }), [classNames, captionLayout]);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      showWeekNumber={showWeekNumber}
      weekStartsOn={weekStartsOn}
      captionLayout={captionLayout}
      numberOfMonths={numberOfMonths}
      fromDate={fromDate}
      toDate={toDate}
      today={today}
      disabled={disabled}
      selected={selected}
      onSelect={onSelect}
      locale={locale}
      className={cn("p-3", className)}
      classNames={memoizedClassNames}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft
            className={cn("h-4 w-4", className)}
            aria-hidden="true"
            {...props}
          />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight
            className={cn("h-4 w-4", className)}
            aria-hidden="true"
            {...props}
          />
        ),
        ...(captionLayout === "buttons" ? { Caption: renderCaption } : {}),
      }}
      initialFocus={initialFocus}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
