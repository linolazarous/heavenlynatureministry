import * as React from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

interface ToasterProps extends React.ComponentProps<typeof ToastProvider> {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
  maxToasts?: number;
  expand?: boolean;
}

const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(({
  position = "bottom-right",
  maxToasts = 3,
  expand = false,
  className,
  ...props
}, ref) => {
  const { toasts } = useToast();

  const displayedToasts = maxToasts ? toasts.slice(0, maxToasts) : toasts;

  return (
    <ToastProvider
      ref={ref}
      swipeDirection="right"
      duration={5000}
      className={className}
      {...props}
    >
      {displayedToasts.map(({
        id,
        title,
        description,
        action,
        variant = "default",
        icon,
        closeButton = true,
        duration,
        ...toastProps
      }) => (
        <Toast
          key={id}
          variant={variant}
          icon={icon}
          closeButton={closeButton}
          duration={duration}
          {...toastProps}
        >
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && (
              <ToastDescription>{description}</ToastDescription>
            )}
          </div>
          {action}
          {closeButton && <ToastClose />}
        </Toast>
      ))}
      <ToastViewport position={position} />
    </ToastProvider>
  );
});
Toaster.displayName = "Toaster";

// Enhanced Toaster components
const ToasterContainer = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("fixed z-[100] pointer-events-none", className)}
      {...props}
    />
  )
);
ToasterContainer.displayName = "ToasterContainer";

export { Toaster, ToasterContainer };
