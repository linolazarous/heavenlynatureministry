import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({
  className,
  type = "text",
  size = "default",
  variant = "default",
  leftIcon,
  rightIcon,
  error,
  success,
  disabled,
  loading = false,
  readOnly = false,
  fullWidth = true,
  label,
  hint,
  required = false,
  onClear,
  clearable = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [value, setValue] = React.useState(props.value || props.defaultValue || "");
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value);
    }
  }, [props.value]);

  const handleChange = (e) => {
    setValue(e.target.value);
    props.onChange?.(e);
  };

  const handleClear = () => {
    setValue("");
    onClear?.();
    inputRef.current?.focus();
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const sizeClasses = {
    xs: "h-7 text-xs px-2.5",
    sm: "h-8 text-sm px-3",
    default: "h-10 text-sm px-3.5",
    lg: "h-12 text-base px-4",
    xl: "h-14 text-lg px-4",
  };

  const variantClasses = {
    default: cn(
      "bg-white dark:bg-gray-900",
      "border-gray-300 dark:border-gray-700",
      "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
      "dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
      "placeholder:text-gray-500 dark:placeholder:text-gray-400",
    ),
    outline: cn(
      "bg-transparent",
      "border-gray-300 dark:border-gray-700",
      "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
      "dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
      "placeholder:text-gray-500 dark:placeholder:text-gray-400",
    ),
    ghost: cn(
      "bg-gray-50 dark:bg-gray-800",
      "border-transparent",
      "focus:bg-white dark:focus:bg-gray-900",
      "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
      "dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
      "placeholder:text-gray-500 dark:placeholder:text-gray-400",
    ),
  };

  const isPassword = type === "password";
  const currentType = isPassword && showPassword ? "text" : type;

  return (
    <div className={cn("space-y-1.5", fullWidth && "w-full")}>
      {label && (
        <label
          className={cn(
            "text-sm font-medium text-gray-900 dark:text-gray-100",
            "flex items-center gap-1",
            disabled && "opacity-60"
          )}
        >
          {label}
          {required && (
            <span className="text-red-500 dark:text-red-400" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          type={currentType}
          className={cn(
            "flex w-full rounded-lg border",
            "text-gray-900 dark:text-gray-100",
            "shadow-sm transition-all duration-200",
            "focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "read-only:cursor-default read-only:opacity-70",
            sizeClasses[size] || sizeClasses.default,
            variantClasses[variant] || variantClasses.default,
            error && [
              "border-red-500 dark:border-red-400",
              "focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
              "dark:focus:border-red-400 dark:focus:ring-red-400/20",
            ],
            success && [
              "border-green-500 dark:border-green-400",
              "focus:border-green-500 focus:ring-2 focus:ring-green-500/20",
              "dark:focus:border-green-400 dark:focus:ring-green-400/20",
            ],
            leftIcon && "pl-9",
            (rightIcon || clearable || isPassword || loading) && "pr-9",
            className
          )}
          value={value}
          onChange={handleChange}
          disabled={disabled || loading}
          readOnly={readOnly}
          aria-invalid={!!error}
          aria-describedby={hint ? `${props.id}-hint` : undefined}
          required={required}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          )}
          {clearable && value && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded p-0.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              aria-label="Clear input"
              disabled={disabled}
            >
              ×
            </button>
          )}
          {isPassword && !loading && (
            <button
              type="button"
              onClick={handlePasswordToggle}
              className="rounded p-0.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={disabled}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          )}
          {rightIcon && !loading && !clearable && !isPassword && (
            <span className="text-gray-500 dark:text-gray-400">
              {rightIcon}
            </span>
          )}
        </div>
      </div>
      {hint && !error && (
        <p
          id={`${props.id}-hint`}
          className="text-xs text-gray-500 dark:text-gray-400"
        >
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 animate-in fade-in-50">
          {error}
        </p>
      )}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
