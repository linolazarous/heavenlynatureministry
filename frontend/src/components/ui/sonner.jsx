import * as React from "react";
import { Toaster as Sonner, toast, ToastT } from "sonner";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  X,
  Loader2,
} from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = React.forwardRef<HTMLDivElement, ToasterProps & {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  expand?: boolean;
  richColors?: boolean;
  closeButton?: boolean;
  duration?: number;
  visibleToasts?: number;
  theme?: "light" | "dark" | "system";
}>(({
  position = "bottom-right",
  expand = false,
  richColors = true,
  closeButton = true,
  duration = 4000,
  visibleToasts = 3,
  theme = "system",
  className,
  ...props
}, ref) => {
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
    loading: Loader2,
  };

  return (
    <Sonner
      ref={ref}
      position={position}
      expand={expand}
      richColors={richColors}
      closeButton={closeButton}
      duration={duration}
      visibleToasts={visibleToasts}
      theme={theme}
      className={cn(
        "toaster group fixed z-50",
        positionClasses[position],
        className
      )}
      toastOptions={{
        classNames: {
          toast: cn(
            "group toast group-[.toaster]:rounded-xl group-[.toaster]:border",
            "group-[.toaster]:shadow-xl group-[.toaster]:shadow-black/10",
            "group-[.toaster]:p-4 group-[.toaster]:max-w-sm",
            "group-[.toaster]:bg-white group-[.toaster]:text-gray-900",
            "dark:group-[.toaster]:bg-gray-900 dark:group-[.toaster]:text-gray-100",
            "group-[.toaster]:border-gray-200 dark:group-[.toaster]:border-gray-800",
            "data-[type=success]:border-green-200 data-[type=success]:dark:border-green-800",
            "data-[type=error]:border-red-200 data-[type=error]:dark:border-red-800",
            "data-[type=warning]:border-yellow-200 data-[type=warning]:dark:border-yellow-800",
            "data-[type=info]:border-blue-200 data-[type=info]:dark:border-blue-800",
          ),
          title: cn(
            "text-sm font-semibold",
            "group-[.toast]:text-gray-900 dark:group-[.toast]:text-gray-100"
          ),
          description: cn(
            "text-sm",
            "group-[.toast]:text-gray-600 dark:group-[.toast]:text-gray-400"
          ),
          actionButton: cn(
            "text-xs font-medium",
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white",
            "group-[.toast]:hover:bg-blue-700",
            "dark:group-[.toast]:bg-blue-500 dark:group-[.toast]:hover:bg-blue-600"
          ),
          cancelButton: cn(
            "text-xs font-medium",
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700",
            "group-[.toast]:hover:bg-gray-200",
            "dark:group-[.toast]:bg-gray-800 dark:group-[.toast]:text-gray-300",
            "dark:group-[.toast]:hover:bg-gray-700"
          ),
          icon: cn(
            "group-[.toast]:mt-0.5",
            "data-[type=success]:text-green-600 dark:data-[type=success]:text-green-500",
            "data-[type=error]:text-red-600 dark:data-[type=error]:text-red-500",
            "data-[type=warning]:text-yellow-600 dark:data-[type=warning]:text-yellow-500",
            "data-[type=info]:text-blue-600 dark:data-[type=info]:text-blue-500",
          ),
          closeButton: cn(
            "group-[.toast]:text-gray-500 group-[.toast]:hover:text-gray-700",
            "dark:group-[.toast]:text-gray-400 dark:group-[.toast]:hover:text-gray-200",
            "group-[.toast]:hover:bg-gray-100 dark:group-[.toast]:hover:bg-gray-800"
          ),
        },
      }}
      icons={{
        success: (props) => <CheckCircle className="h-4 w-4" {...props} />,
        error: (props) => <XCircle className="h-4 w-4" {...props} />,
        warning: (props) => <AlertCircle className="h-4 w-4" {...props} />,
        info: (props) => <Info className="h-4 w-4" {...props} />,
        loading: (props) => <Loader2 className="h-4 w-4 animate-spin" {...props} />,
      }}
      {...props}
    />
  );
});
Toaster.displayName = "Toaster";

// Enhanced toast functions
const toastSuccess = (
  message: string,
  options?: Omit<ToastT, "title" | "type">
) => {
  return toast.success(message, {
    icon: <CheckCircle className="h-4 w-4" />,
    ...options,
  });
};

const toastError = (
  message: string,
  options?: Omit<ToastT, "title" | "type">
) => {
  return toast.error(message, {
    icon: <XCircle className="h-4 w-4" />,
    ...options,
  });
};

const toastWarning = (
  message: string,
  options?: Omit<ToastT, "title" | "type">
) => {
  return toast.warning(message, {
    icon: <AlertCircle className="h-4 w-4" />,
    ...options,
  });
};

const toastInfo = (
  message: string,
  options?: Omit<ToastT, "title" | "type">
) => {
  return toast.info(message, {
    icon: <Info className="h-4 w-4" />,
    ...options,
  });
};

const toastLoading = (
  message: string,
  options?: Omit<ToastT, "title" | "type">
) => {
  return toast.loading(message, {
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
    ...options,
  });
};

// Toast promise wrapper
const toastPromise = <T,>(
  promise: Promise<T>,
  options: {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((error: any) => string);
  }
) => {
  return toast.promise(promise, {
    loading: options.loading || "Loading...",
    success: options.success || "Success!",
    error: options.error || "Something went wrong",
  });
};

export {
  Toaster,
  toast,
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
  toastLoading,
  toastPromise,
};
