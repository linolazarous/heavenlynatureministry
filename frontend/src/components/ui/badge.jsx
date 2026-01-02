import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center",
    "rounded-full border font-medium",
    "whitespace-nowrap transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-transparent",
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          "hover:bg-blue-200 dark:hover:bg-blue-900/50",
          "focus-visible:ring-blue-500",
        ],
        secondary: [
          "border-transparent",
          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
          "hover:bg-gray-200 dark:hover:bg-gray-700",
          "focus-visible:ring-gray-500",
        ],
        destructive: [
          "border-transparent",
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
          "hover:bg-red-200 dark:hover:bg-red-900/50",
          "focus-visible:ring-red-500",
        ],
        success: [
          "border-transparent",
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
          "hover:bg-green-200 dark:hover:bg-green-900/50",
          "focus-visible:ring-green-500",
        ],
        warning: [
          "border-transparent",
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
          "hover:bg-yellow-200 dark:hover:bg-yellow-900/50",
          "focus-visible:ring-yellow-500",
        ],
        outline: [
          "border-gray-300 dark:border-gray-700",
          "bg-transparent text-gray-700 dark:text-gray-300",
          "hover:bg-gray-50 dark:hover:bg-gray-800",
        ],
      },
      size: {
        xs: "text-xs px-2 py-0.5",
        sm: "text-sm px-2.5 py-0.5",
        default: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5",
      },
      pill: {
        true: "rounded-full",
        false: "rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      pill: true,
    },
  }
);

const Badge = React.forwardRef(({
  className,
  variant,
  size,
  pill = true,
  children,
  title,
  ...props
}, ref) => {
  // Handle string children for title fallback
  const badgeTitle = title || (typeof children === 'string' ? children : undefined);

  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size, pill, className }))}
      title={badgeTitle}
      role={props.onClick ? "button" : "status"}
      tabIndex={props.onClick ? 0 : -1}
      {...props}
    >
      {children}
    </span>
  );
});
Badge.displayName = "Badge";

export { Badge, badgeVariants };
