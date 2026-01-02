import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef(({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  size = "default",
  variant = "default",
  label,
  description,
  required = false,
  loading = false,
  ...props
}, ref) => {
  const [isChecked, setIsChecked] = React.useState(defaultChecked || checked || false);

  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleCheckedChange = (checkedState: boolean) => {
    setIsChecked(checkedState);
    onCheckedChange?.(checkedState);
  };

  const sizeClasses = {
    xs: "h-3 w-6",
    sm: "h-4 w-8",
    default: "h-5 w-10",
    lg: "h-6 w-12",
    xl: "h-7 w-14",
  };

  const thumbSizeClasses = {
    xs: "h-2 w-2 data-[state=checked]:translate-x-3",
    sm: "h-3 w-3 data-[state=checked]:translate-x-4",
    default: "h-4 w-4 data-[state=checked]:translate-x-5",
    lg: "h-5 w-5 data-[state=checked]:translate-x-6",
    xl: "h-6 w-6 data-[state=checked]:translate-x-7",
  };

  const variantClasses = {
    default: cn(
      "data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300",
      "dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-gray-700"
    ),
    success: cn(
      "data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300",
      "dark:data-[state=checked]:bg-green-500 dark:data-[state=unchecked]:bg-gray-700"
    ),
    warning: cn(
      "data-[state=checked]:bg-yellow-600 data-[state=unchecked]:bg-gray-300",
      "dark:data-[state=checked]:bg-yellow-500 dark:data-[state=unchecked]:bg-gray-700"
    ),
    destructive: cn(
      "data-[state=checked]:bg-red-600 data-[state=unchecked]:bg-gray-300",
      "dark:data-[state=checked]:bg-red-500 dark:data-[state=unchecked]:bg-gray-700"
    ),
  };

  return (
    <div className="flex items-start space-x-3">
      <SwitchPrimitives.Root
        ref={ref}
        checked={isChecked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled || loading}
        className={cn(
          "peer inline-flex shrink-0 cursor-pointer items-center rounded-full",
          "border-2 border-transparent shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          "disabled:cursor-not-allowed disabled:opacity-50",
          sizeClasses[size] || sizeClasses.default,
          variantClasses[variant] || variantClasses.default,
          loading && "opacity-70",
          className
        )}
        {...props}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          </div>
        )}
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block rounded-full bg-white shadow-lg",
            "ring-0 transition-transform duration-200",
            "data-[state=unchecked]:translate-x-0",
            thumbSizeClasses[size] || thumbSizeClasses.default,
            loading && "opacity-0"
          )}
        />
      </SwitchPrimitives.Root>
      {(label || description) && (
        <div className="flex-1 space-y-1">
          {label && (
            <label
              className={cn(
                "text-sm font-medium leading-none cursor-pointer",
                "text-gray-900 dark:text-gray-100",
                (disabled || loading) && "cursor-not-allowed opacity-60"
              )}
              onClick={() => !disabled && !loading && handleCheckedChange(!isChecked)}
            >
              {label}
              {required && (
                <span className="ml-1 text-red-500 dark:text-red-400" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {description && (
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
