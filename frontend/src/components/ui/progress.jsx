import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef(({
  className,
  value = 0,
  max = 100,
  size = "default",
  variant = "default",
  showValue = false,
  label,
  animate = true,
  striped = false,
  ...props
}, ref) => {
  const clampedValue = Math.max(0, Math.min(value, max));
  const percentage = (clampedValue / max) * 100;

  const sizeClasses = {
    xs: "h-1",
    sm: "h-1.5",
    default: "h-2",
    lg: "h-3",
    xl: "h-4",
    "2xl": "h-6",
  };

  const variantClasses = {
    default: "bg-blue-600 dark:bg-blue-500",
    success: "bg-green-600 dark:bg-green-500",
    warning: "bg-yellow-600 dark:bg-yellow-500",
    destructive: "bg-red-600 dark:bg-red-500",
    neutral: "bg-gray-600 dark:bg-gray-500",
  };

  const indicatorClasses = cn(
    "h-full w-full flex-1 transition-all duration-500 ease-out",
    variantClasses[variant] || variantClasses.default,
    striped && "bg-stripes",
    animate && percentage < 100 && "animate-pulse-slow"
  );

  return (
    <div className="space-y-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {clampedValue}/{max}
            </span>
          )}
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        value={clampedValue}
        max={max}
        className={cn(
          "relative w-full overflow-hidden rounded-full",
          "bg-gray-200 dark:bg-gray-800",
          sizeClasses[size] || sizeClasses.default,
          className
        )}
        aria-label={props["aria-label"] || label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={clampedValue}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={indicatorClasses}
          style={{
            transform: `translateX(-${100 - percentage}%)`,
            transition: animate ? "transform 0.5s ease-out" : "none",
          }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
});
Progress.displayName = "Progress";

// Compound progress components
const ProgressGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    />
  )
);
ProgressGroup.displayName = "ProgressGroup";

const ProgressItem = React.forwardRef<HTMLDivElement, {
  label: string;
  value: number;
  max?: number;
  color?: string;
} & React.ComponentProps<"div">>(
  ({ className, label, value, max = 100, color, ...props }, ref) => {
    const percentage = (value / max) * 100;

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {Math.round(percentage)}%
          </span>
        </div>
        <Progress value={value} max={max} className="h-2" />
      </div>
    );
  }
);
ProgressItem.displayName = "ProgressItem";

export { Progress, ProgressGroup, ProgressItem };
