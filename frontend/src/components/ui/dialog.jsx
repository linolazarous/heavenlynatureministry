import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(({
  className,
  blur = true,
  ...props
}, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      blur ? "bg-black/60 backdrop-blur-sm" : "bg-black/80",
      "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      "transition-opacity duration-300 ease-out",
      "will-change-transform",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(({
  className,
  children,
  size = "default",
  hideClose = false,
  closeOnOverlayClick = true,
  preventClose = false,
  overlayClassName,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: "max-w-sm",
    default: "max-w-lg",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    full: "max-w-[95vw]",
  };

  const handleOverlayClick = (e) => {
    if (!closeOnOverlayClick || preventClose) {
      e.preventDefault();
    }
  };

  return (
    <DialogPortal>
      <DialogOverlay 
        className={overlayClassName}
        onClick={handleOverlayClick}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
          "bg-white dark:bg-gray-900",
          "border border-gray-200 dark:border-gray-800",
          "shadow-2xl shadow-black/20 dark:shadow-black/40",
          "focus:outline-none",
          "data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out",
          "duration-300 ease-out",
          "rounded-xl sm:rounded-2xl",
          "overflow-hidden",
          sizeClasses[size] || sizeClasses.default,
          className
        )}
        {...props}
      >
        {children}
        {!hideClose && !preventClose && (
          <DialogPrimitive.Close
            className={cn(
              "absolute right-3 top-3 z-10",
              "rounded-lg p-1.5",
              "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              "transition-all duration-200",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = React.memo(({
  className,
  centered = false,
  padding = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2",
        padding && "px-6 pt-6",
        centered ? "text-center" : "text-left sm:text-left",
        className
      )}
      {...props}
    />
  );
});
DialogHeader.displayName = "DialogHeader";

const DialogFooter = React.memo(({
  className,
  justify = "end",
  padding = true,
  ...props
}) => {
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row gap-2",
        padding && "px-6 pb-6",
        justifyClasses[justify] || justifyClasses.end,
        className
      )}
      {...props}
    />
  );
});
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef(({
  className,
  as: Component = DialogPrimitive.Title,
  size = "default",
  ...props
}, ref) => {
  const sizeClasses = {
    sm: "text-lg font-semibold",
    default: "text-xl font-bold",
    lg: "text-2xl font-bold",
    xl: "text-3xl font-bold",
  };

  return (
    <Component
      ref={ref}
      className={cn(
        "leading-none tracking-tight",
        "text-gray-900 dark:text-gray-100",
        sizeClasses[size] || sizeClasses.default,
        className
      )}
      {...props}
    />
  );
});
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(({
  className,
  as: Component = DialogPrimitive.Description,
  ...props
}, ref) => {
  return (
    <Component
      ref={ref}
      className={cn(
        "text-sm text-gray-600 dark:text-gray-400",
        "leading-relaxed",
        className
      )}
      {...props}
    />
  );
});
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// Compound exports for better DX
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
