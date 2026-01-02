import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus, Dot } from "lucide-react";
import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef(({
  className,
  containerClassName,
  value,
  onChange,
  maxLength = 6,
  pattern = "[0-9]*",
  inputMode = "numeric",
  autoComplete = "one-time-code",
  disabled,
  loading = false,
  onComplete,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(value || "");

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (newValue: string) => {
    setInternalValue(newValue);
    onChange?.(newValue);

    // Trigger onComplete when max length is reached
    if (newValue.length === maxLength) {
      onComplete?.(newValue);
    }
  };

  return (
    <div className={cn("relative", containerClassName)}>
      <OTPInput
        ref={ref}
        value={internalValue}
        onChange={handleChange}
        maxLength={maxLength}
        pattern={pattern}
        inputMode={inputMode}
        autoComplete={autoComplete}
        disabled={disabled || loading}
        containerClassName={cn(
          "flex items-center gap-2",
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          "transition-opacity duration-200"
        )}
        className={cn(
          "disabled:cursor-not-allowed",
          "outline-none",
          className
        )}
        aria-label="One-time password input"
        aria-busy={loading}
        {...props}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-md">
          <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
});
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef(({
  className,
  separator,
  separatorClassName,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        "has-[:disabled]:opacity-50",
        className
      )}
      {...props}
    />
  );
});
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef(({
  index,
  className,
  activeClassName,
  filledClassName,
  ...props
}, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];
  const isFilled = char !== undefined && char !== "";

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-12 w-12 items-center justify-center",
        "border-2 text-lg font-semibold",
        "bg-white dark:bg-gray-900",
        "border-gray-300 dark:border-gray-700",
        "first:rounded-l-xl last:rounded-r-xl",
        "transition-all duration-200",
        "shadow-sm",
        isActive && [
          "z-10 ring-2 ring-blue-500 ring-offset-2",
          "border-blue-500 dark:border-blue-400",
          activeClassName,
        ],
        isFilled && [
          "border-blue-600 dark:border-blue-500",
          "bg-blue-50 dark:bg-blue-900/20",
          filledClassName,
        ],
        "select-none",
        className
      )}
      data-active={isActive}
      data-filled={isFilled}
      {...props}
    >
      {char && (
        <span className="text-gray-900 dark:text-gray-100">
          {char}
        </span>
      )}
      {!char && isActive && (
        <Dot className="h-2 w-2 text-gray-400 dark:text-gray-500" />
      )}
      {hasFakeCaret && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div
            className={cn(
              "h-6 w-0.5",
              "animate-[pulse_1s_ease-in-out_infinite]",
              "bg-blue-500 dark:bg-blue-400"
            )}
          />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef(({
  className,
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center",
        "text-gray-400 dark:text-gray-500",
        "mx-2",
        className
      )}
      role="separator"
      aria-hidden="true"
      {...props}
    >
      {children || <Minus className="h-0.5 w-4" />}
    </div>
  );
});
InputOTPSeparator.displayName = "InputOTPSeparator";

// Helper component for displaying OTP slots
const InputOTPDisplay = React.forwardRef(({
  value,
  length = 6,
  className,
  slotClassName,
  ...props
}, ref) => {
  const slots = Array.from({ length }, (_, i) => value?.[i] || "");

  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {slots.map((char, index) => (
        <div
          key={index}
          className={cn(
            "flex h-12 w-12 items-center justify-center",
            "rounded-xl border-2 text-lg font-semibold",
            char ? [
              "border-blue-600 dark:border-blue-500",
              "bg-blue-50 dark:bg-blue-900/20",
              "text-gray-900 dark:text-gray-100",
            ] : [
              "border-gray-300 dark:border-gray-700",
              "text-gray-400 dark:text-gray-500",
            ],
            slotClassName
          )}
        >
          {char || "•"}
        </div>
      ))}
    </div>
  );
});
InputOTPDisplay.displayName = "InputOTPDisplay";

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  InputOTPDisplay,
};
