import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(({
  className,
  size = "default",
  variant = "default",
  checked,
  indeterminate,
  disabled,
  onCheckedChange,
  label,
  id,
  name,
  value,
  required = false,
  ...props
}, ref) => {
  const [isIndeterminate, setIsIndeterminate] = React.useState(indeterminate);

  React.useEffect(() => {
    setIsIndeterminate(indeterminate);
  }, [indeterminate]);

  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    default: "h-4 w-4",
    lg: "h-5 w-5",
    xl: "h-6 w-6",
  };

  const variantClasses = {
    default: cn(
      "border-gray-300 dark:border-gray-600",
      "data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600",
      "data-[state=indeterminate]:border-blue-600 data-[state=indeterminate]:bg-blue-600",
      "dark:data-[state=checked]:border-blue-500 dark:data-[state=checked]:bg-blue-500",
      "dark:data-[state=indeterminate]:border-blue-500 dark:data-[state=indeterminate]:bg-blue-500",
      "hover:border-gray-400 dark:hover:border-gray-500",
      "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    ),
    destructive: cn(
      "border-red-300 dark:border-red-600",
      "data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600",
      "data-[state=indeterminate]:border-red-600 data-[state=indeterminate]:bg-red-600",
      "dark:data-[state=checked]:border-red-500 dark:data-[state=checked]:bg-red-500",
      "dark:data-[state=indeterminate]:border-red-500 dark:data-[state=indeterminate]:bg-red-500",
      "hover:border-red-400 dark:hover:border-red-500",
      "focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
    ),
  };

  const iconSize = {
    sm: "h-2.5 w-2.5",
    default: "h-3 w-3",
    lg: "h-4 w-4",
    xl: "h-5 w-5",
  };

  const handleCheckedChange = (checkedState) => {
    if (isIndeterminate && checkedState === true) {
      setIsIndeterminate(false);
    }
    onCheckedChange?.(checkedState);
  };

  const checkState = isIndeterminate ? "indeterminate" : checked ? "checked" : "unchecked";

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <CheckboxPrimitive.Root
        ref={ref}
        id={id}
        name={name}
        value={value}
        checked={isIndeterminate ? "indeterminate" : checked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
        required={required}
        data-state={checkState}
        data-indeterminate={isIndeterminate}
        className={cn(
          "peer shrink-0 rounded border shadow-sm transition-all duration-200",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "disabled:hover:border-gray-300 dark:disabled:hover:border-gray-600",
          "outline-none",
          sizeClasses[size] || sizeClasses.default,
          variantClasses[variant] || variantClasses.default,
          isIndeterminate && "data-[state=indeterminate]:animate-pulse"
        )}
        aria-label={label}
        aria-checked={isIndeterminate ? "mixed" : checked}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn(
            "flex items-center justify-center text-white",
            "animate-in fade-in-0 zoom-in-95 duration-150"
          )}
          forceMount={isIndeterminate}
        >
          {isIndeterminate ? (
            <Minus className={cn("font-bold", iconSize[size])} />
          ) : (
            <Check className={cn("font-bold", iconSize[size])} />
          )}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium cursor-pointer select-none",
            "text-gray-900 dark:text-gray-100",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "transition-opacity duration-200"
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
