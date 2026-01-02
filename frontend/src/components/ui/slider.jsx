import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef(({
  className,
  defaultValue = [0],
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  orientation = "horizontal",
  size = "default",
  variant = "default",
  showValue = false,
  formatValue,
  label,
  marks,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(
    value || defaultValue
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: number[]) => {
    setInternalValue(newValue);
    props.onValueChange?.(newValue);
  };

  const sizeClasses = {
    xs: "h-1",
    sm: "h-1.5",
    default: "h-2",
    lg: "h-3",
    xl: "h-4",
  };

  const variantClasses = {
    default: cn(
      "bg-gray-300 dark:bg-gray-700",
      "[&>span]:bg-blue-600 dark:[&>span]:bg-blue-500"
    ),
    success: cn(
      "bg-gray-300 dark:bg-gray-700",
      "[&>span]:bg-green-600 dark:[&>span]:bg-green-500"
    ),
    warning: cn(
      "bg-gray-300 dark:bg-gray-700",
      "[&>span]:bg-yellow-600 dark:[&>span]:bg-yellow-500"
    ),
    destructive: cn(
      "bg-gray-300 dark:bg-gray-700",
      "[&>span]:bg-red-600 dark:[&>span]:bg-red-500"
    ),
  };

  const thumbClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-7 w-7",
  };

  const formattedValue = formatValue
    ? formatValue(internalValue[0])
    : internalValue[0];

  return (
    <div className={cn("space-y-3", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formattedValue}
            </span>
          )}
        </div>
      )}
      
      <SliderPrimitive.Root
        ref={ref}
        defaultValue={defaultValue}
        value={internalValue}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        orientation={orientation}
        className={cn(
          "relative flex touch-none select-none items-center",
          orientation === "horizontal" ? "w-full" : "h-full flex-col",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track
          className={cn(
            "relative grow overflow-hidden rounded-full",
            sizeClasses[size] || sizeClasses.default,
            variantClasses[variant] || variantClasses.default,
            orientation === "vertical" && "w-full"
          )}
        >
          <SliderPrimitive.Range className="absolute h-full" />
        </SliderPrimitive.Track>
        
        {marks && marks.map((mark) => (
          <div
            key={mark.value}
            className={cn(
              "absolute",
              orientation === "horizontal"
                ? "top-1/2 -translate-y-1/2"
                : "left-1/2 -translate-x-1/2",
              "h-1 w-1 rounded-full bg-gray-400 dark:bg-gray-600"
            )}
            style={{
              [orientation === "horizontal" ? "left" : "top"]: `${((mark.value - min) / (max - min)) * 100}%`,
            }}
          />
        ))}
        
        {internalValue.map((value, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className={cn(
              "block rounded-full border-2 border-white dark:border-gray-900",
              "bg-white dark:bg-gray-100",
              "shadow-lg shadow-black/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              "transition-transform duration-150 hover:scale-110",
              "disabled:pointer-events-none disabled:opacity-50",
              thumbClasses[size] || thumbClasses.default
            )}
          />
        ))}
      </SliderPrimitive.Root>
      
      {marks && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          {marks.map((mark) => (
            <span key={mark.value}>{mark.label || mark.value}</span>
          ))}
        </div>
      )}
    </div>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

// Enhanced Slider components
const SliderRange = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}>(
  ({ className, min, max, value, onChange, ...props }, ref) => {
    return (
      <Slider
        ref={ref}
        min={min}
        max={max}
        value={value}
        onValueChange={onChange as any}
        className={className}
        {...props}
      />
    );
  }
);
SliderRange.displayName = "SliderRange";

const SliderWithInput = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}>(
  ({ className, value, onChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseFloat(e.target.value);
      if (!isNaN(newValue) && newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    };

    return (
      <div ref={ref} className={cn("flex items-center gap-4", className)} {...props}>
        <Slider
          value={[value]}
          onValueChange={([newValue]) => onChange(newValue)}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          className={cn(
            "w-20 rounded-lg border border-gray-300 dark:border-gray-700",
            "bg-white dark:bg-gray-900",
            "px-3 py-1.5 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
        />
      </div>
    );
  }
);
SliderWithInput.displayName = "SliderWithInput";

export {
  Slider,
  SliderRange,
  SliderWithInput,
};
