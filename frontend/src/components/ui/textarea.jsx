import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({
  className,
  size = "default",
  variant = "default",
  error,
  success,
  disabled,
  loading = false,
  readOnly = false,
  label,
  hint,
  required = false,
  showCount = false,
  maxLength,
  minRows = 3,
  maxRows = 10,
  autoResize = false,
  leftIcon,
  fullWidth = true,
  ...props
}, ref) => {
  const [value, setValue] = React.useState(props.value || props.defaultValue || "");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value);
    }
  }, [props.value]);

  React.useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    props.onChange?.(e);
  };

  const sizeClasses = {
    sm: "text-sm px-3 py-2",
    default: "text-sm px-3.5 py-2.5",
    lg: "text-base px-4 py-3",
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
          <div className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
            {leftIcon}
          </div>
        )}
        <textarea
          ref={(node) => {
            textareaRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
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
            leftIcon && "pl-10",
            autoResize && "resize-none overflow-hidden",
            !autoResize && "resize-y",
            className
          )}
          value={value}
          onChange={handleChange}
          disabled={disabled || loading}
          readOnly={readOnly}
          aria-invalid={!!error}
          aria-describedby={hint ? `${props.id}-hint` : undefined}
          required={required}
          maxLength={maxLength}
          rows={minRows}
          style={{
            minHeight: `${minRows * 24}px`,
            maxHeight: maxRows ? `${maxRows * 24}px` : undefined,
          }}
          {...props}
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div>
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
        {showCount && maxLength && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
