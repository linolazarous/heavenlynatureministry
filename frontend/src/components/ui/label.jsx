import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
  "font-medium leading-none",
  {
    variants: {
      size: {
        xs: "text-xs",
        sm: "text-sm",
        default: "text-sm",
        lg: "text-base",
        xl: "text-lg",
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
      },
      variant: {
        default: "text-gray-900 dark:text-gray-100",
        muted: "text-gray-600 dark:text-gray-400",
        destructive: "text-red-600 dark:text-red-400",
        success: "text-green-600 dark:text-green-400",
        warning: "text-yellow-600 dark:text-yellow-400",
        info: "text-blue-600 dark:text-blue-400",
      },
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-red-500 dark:after:text-red-400",
        false: "",
      },
      disabled: {
        true: "opacity-60 cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      size: "default",
      weight: "medium",
      variant: "default",
      required: false,
      disabled: false,
    },
  }
);

const Label = React.forwardRef(({
  className,
  size,
  weight,
  variant,
  required,
  disabled,
  htmlFor,
  optional,
  tooltip,
  children,
  ...props
}, ref) => {
  const labelRef = React.useRef(null);

  React.useEffect(() => {
    const labelElement = labelRef.current;
    if (labelElement && htmlFor) {
      const inputElement = document.getElementById(htmlFor);
      if (inputElement && inputElement.disabled) {
        labelElement.dataset.disabled = "true";
      }
    }
  }, [htmlFor]);

  return (
    <LabelPrimitive.Root
      ref={(node) => {
        labelRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cn(
        labelVariants({ size, weight, variant, required, disabled, className }),
        "flex items-center gap-1.5",
        "select-none",
        "transition-colors duration-150",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      )}
      htmlFor={htmlFor}
      data-disabled={disabled}
      data-required={required}
      {...props}
    >
      {children}
      {optional && !required && (
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
          (Optional)
        </span>
      )}
      {tooltip && (
        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="More information"
          onClick={tooltip.onClick}
          title={tooltip.title}
        >
          {tooltip.icon || "ℹ️"}
        </button>
      )}
    </LabelPrimitive.Root>
  );
});
Label.displayName = LabelPrimitive.Root.displayName;

export { Label, labelVariants };
