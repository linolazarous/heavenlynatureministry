import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center",
    "whitespace-nowrap rounded-lg",
    "font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-95",
    "[&_svg]:shrink-0",
    "will-change-transform",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-blue-600 text-white shadow-sm",
          "hover:bg-blue-700 hover:shadow-md",
          "focus-visible:ring-blue-500",
          "dark:bg-blue-500 dark:hover:bg-blue-600",
        ],
        destructive: [
          "bg-red-600 text-white shadow-sm",
          "hover:bg-red-700 hover:shadow-md",
          "focus-visible:ring-red-500",
          "dark:bg-red-500 dark:hover:bg-red-600",
        ],
        outline: [
          "border border-gray-300 bg-transparent",
          "hover:bg-gray-50 hover:border-gray-400",
          "focus-visible:ring-gray-500",
          "dark:border-gray-600 dark:hover:bg-gray-800 dark:hover:border-gray-500",
        ],
        secondary: [
          "bg-gray-100 text-gray-900 shadow-sm",
          "hover:bg-gray-200 hover:shadow-md",
          "focus-visible:ring-gray-500",
          "dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
        ],
        ghost: [
          "hover:bg-gray-100 hover:text-gray-900",
          "focus-visible:ring-gray-500",
          "dark:hover:bg-gray-800 dark:hover:text-gray-100",
        ],
        link: [
          "text-blue-600 underline-offset-4",
          "hover:underline hover:text-blue-700",
          "focus-visible:ring-blue-500",
          "dark:text-blue-400 dark:hover:text-blue-300",
        ],
        success: [
          "bg-green-600 text-white shadow-sm",
          "hover:bg-green-700 hover:shadow-md",
          "focus-visible:ring-green-500",
          "dark:bg-green-500 dark:hover:bg-green-600",
        ],
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-sm",
        default: "h-10 px-4 py-2 text-sm",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-12 w-12 p-0",
      },
      fullWidth: {
        true: "w-full",
      },
      rounded: {
        full: "rounded-full",
        lg: "rounded-lg",
        md: "rounded-md",
        sm: "rounded-sm",
        none: "rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "lg",
      fullWidth: false,
    },
  }
);

const Button = React.forwardRef(({
  className,
  variant,
  size,
  rounded = "lg",
  fullWidth = false,
  asChild = false,
  loading = false,
  disabled,
  children,
  leftIcon,
  rightIcon,
  type = "button",
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button";
  const isDisabled = disabled || loading;

  return (
    <Comp
      ref={ref}
      type={type}
      className={cn(
        buttonVariants({ variant, size, rounded, fullWidth, className }),
        loading && "relative text-transparent hover:text-transparent"
      )}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          <span className="sr-only">Loading...</span>
        </div>
      )}
      {!loading && leftIcon && (
        <span className="mr-2" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className={cn(
        "inline-flex items-center justify-center gap-2",
        loading && "opacity-0"
      )}>
        {children}
      </span>
      {!loading && rightIcon && (
        <span className="ml-2" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </Comp>
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
