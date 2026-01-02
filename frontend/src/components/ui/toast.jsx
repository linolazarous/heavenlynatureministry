import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import {
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({
  className,
  position = "bottom-right",
  ...props
}, ref) => {
  const positionClasses = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
    "top-center": "top-0 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
  };

  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        "fixed z-[100] flex max-h-screen w-full flex-col-reverse p-4",
        "sm:flex-col md:max-w-[420px]",
        positionClasses[position] || positionClasses["bottom-right"],
        className
      )}
      {...props}
    />
  );
});
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  [
    "group pointer-events-auto relative flex w-full items-center",
    "justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8",
    "shadow-lg transition-all",
    "data-[swipe=cancel]:translate-x-0",
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
    "data-[swipe=move]:transition-none",
    "data-[state=open]:animate-in",
    "data-[state=closed]:animate-out",
    "data-[swipe=end]:animate-out",
    "data-[state=closed]:fade-out-80",
    "data-[state=closed]:slide-out-to-right-full",
    "data-[state=open]:slide-in-from-top-full",
    "data-[state=open]:sm:slide-in-from-bottom-full",
  ],
  {
    variants: {
      variant: {
        default: [
          "border-gray-200 bg-white text-gray-900",
          "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100",
        ],
        success: [
          "border-green-200 bg-green-50 text-green-900",
          "dark:border-green-800 dark:bg-green-900/20 dark:text-green-300",
        ],
        error: [
          "border-red-200 bg-red-50 text-red-900",
          "dark:border-red-800 dark:bg-red-900/20 dark:text-red-300",
        ],
        warning: [
          "border-yellow-200 bg-yellow-50 text-yellow-900",
          "dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
        ],
        info: [
          "border-blue-200 bg-blue-50 text-blue-900",
          "dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
        ],
        loading: [
          "border-gray-200 bg-white text-gray-900",
          "dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100",
        ],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef(({
  className,
  variant = "default",
  icon,
  action,
  closeButton = true,
  duration = 5000,
  ...props
}, ref) => {
  const iconMap = {
    default: null,
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
    loading: <Loader2 className="h-5 w-5 animate-spin" />,
  };

  const defaultIcon = iconMap[variant] || iconMap.default;

  return (
    <ToastPrimitives.Root
      ref={ref}
      duration={duration}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        {!icon && defaultIcon && (
          <div
            className={cn(
              "flex-shrink-0",
              variant === "success" && "text-green-600 dark:text-green-500",
              variant === "error" && "text-red-600 dark:text-red-500",
              variant === "warning" && "text-yellow-600 dark:text-yellow-500",
              variant === "info" && "text-blue-600 dark:text-blue-500",
              variant === "loading" && "text-gray-600 dark:text-gray-400"
            )}
          >
            {defaultIcon}
          </div>
        )}
        <div className="flex-1 space-y-1">
          {props.children}
        </div>
      </div>
      {action && (
        <div className="flex items-center gap-2">
          {action}
          {closeButton && <ToastClose />}
        </div>
      )}
      {!action && closeButton && <ToastClose />}
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({
  className,
  variant = "default",
  ...props
}, ref) => {
  const variantClasses = {
    default: [
      "border-gray-300 bg-white text-gray-900",
      "hover:bg-gray-100",
      "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
      "dark:hover:bg-gray-700",
    ],
    success: [
      "border-green-300 bg-green-100 text-green-900",
      "hover:bg-green-200",
      "dark:border-green-700 dark:bg-green-900/30 dark:text-green-300",
      "dark:hover:bg-green-800/40",
    ],
    error: [
      "border-red-300 bg-red-100 text-red-900",
      "hover:bg-red-200",
      "dark:border-red-700 dark:bg-red-900/30 dark:text-red-300",
      "dark:hover:bg-red-800/40",
    ],
  };

  return (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center",
        "rounded-md border px-3 text-sm font-medium",
        "transition-colors focus:outline-none focus:ring-2",
        "focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    />
  );
});
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({
  className,
  ...props
}, ref) => {
  return (
    <ToastPrimitives.Close
      ref={ref}
      className={cn(
        "absolute right-2 top-2 rounded-md p-1",
        "text-gray-500 opacity-0 transition-opacity",
        "hover:text-gray-700 hover:bg-gray-100",
        "focus:opacity-100 focus:outline-none focus:ring-2",
        "group-hover:opacity-100",
        "dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800",
        className
      )}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  );
});
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({
  className,
  ...props
}, ref) => {
  return (
    <ToastPrimitives.Title
      ref={ref}
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  );
});
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({
  className,
  ...props
}, ref) => {
  return (
    <ToastPrimitives.Description
      ref={ref}
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  );
});
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  toastVariants,
};
