import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef(({
  className,
  orientation = "vertical",
  disabled = false,
  required = false,
  onValueChange,
  value,
  defaultValue,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || value || "");

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn(
        "grid gap-3",
        orientation === "horizontal" && "grid-flow-col auto-cols-fr",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      value={internalValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      required={required}
      aria-required={required}
      {...props}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef(({
  className,
  size = "default",
  variant = "default",
  label,
  description,
  disabled = false,
  checked,
  value,
  id,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const variantClasses = {
    default: cn(
      "border-gray-400 dark:border-gray-600",
      "data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600",
      "dark:data-[state=checked]:border-blue-500 dark:data-[state=checked]:bg-blue-500",
      "hover:border-gray-500 dark:hover:border-gray-500",
      "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    ),
    destructive: cn(
      "border-red-400 dark:border-red-600",
      "data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600",
      "dark:data-[state=checked]:border-red-500 dark:data-[state=checked]:bg-red-500",
      "hover:border-red-500 dark:hover:border-red-500",
      "focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
    ),
  };

  const iconSize = {
    sm: "h-2.5 w-2.5",
    default: "h-3 w-3",
    lg: "h-3.5 w-3.5",
  };

  return (
    <div className="flex items-start space-x-3">
      <RadioGroupPrimitive.Item
        ref={ref}
        value={value}
        disabled={disabled}
        id={id}
        className={cn(
          "aspect-square rounded-full border shadow-sm",
          "focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          sizeClasses[size] || sizeClasses.default,
          variantClasses[variant] || variantClasses.default,
          className
        )}
        {...props}
      >
        <RadioGroupPrimitive.Indicator
          className={cn(
            "flex items-center justify-center",
            "animate-in fade-in-50 zoom-in-95 duration-200"
          )}
        >
          {variant === "check" ? (
            <Check
              className={cn("text-white font-bold", iconSize[size])}
              strokeWidth={3}
            />
          ) : (
            <Circle
              className={cn("fill-white", iconSize[size])}
              strokeWidth={0}
            />
          )}
        </RadioGroupPrimitive.Indicator>
      </RadioGroupPrimitive.Item>
      {(label || description) && (
        <div className="flex-1 space-y-1">
          {label && (
            <label
              htmlFor={id}
              className={cn(
                "text-sm font-medium leading-none cursor-pointer",
                "text-gray-900 dark:text-gray-100",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              {label}
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
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
