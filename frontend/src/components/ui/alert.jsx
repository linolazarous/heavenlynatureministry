import * as React from "react";
import { cva } from "class-variance-authority";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 text-sm",
  "flex items-start gap-3",
  "animate-in fade-in duration-300",
  {
    variants: {
      variant: {
        default: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
        destructive: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300",
        warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300",
        success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef(({ className, variant, icon: Icon, children, ...props }, ref) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case "destructive":
        return XCircle;
      case "warning":
        return AlertCircle;
      case "success":
        return CheckCircle;
      default:
        return Info;
    }
  };

  const DefaultIcon = getDefaultIcon();
  const ActualIcon = Icon || DefaultIcon;

  return (
    <div
      ref={ref}
      role="alert"
      aria-live={variant === "destructive" ? "assertive" : "polite"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <ActualIcon
        className={cn(
          "h-5 w-5 flex-shrink-0 mt-0.5",
          {
            "text-blue-500 dark:text-blue-400": variant === "default",
            "text-red-500 dark:text-red-400": variant === "destructive",
            "text-yellow-500 dark:text-yellow-400": variant === "warning",
            "text-green-500 dark:text-green-400": variant === "success",
          }
        )}
        aria-hidden="true"
      />
      <div className="flex-1 space-y-1">
        {children}
      </div>
    </div>
  );
});
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight",
      "mb-1",
      className
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm leading-relaxed [&_p]:leading-relaxed",
      "text-opacity-90",
      className
    )}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription, alertVariants };
