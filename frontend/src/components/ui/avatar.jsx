import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

const Avatar = React.forwardRef(({ className, size = "default", ...props }, ref) => {
  const sizeClasses = {
    xs: "h-6 w-6",
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
    "2xl": "h-20 w-20",
  };

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex shrink-0 overflow-hidden",
        "rounded-full border-2 border-white dark:border-gray-800",
        "shadow-sm hover:shadow-md transition-shadow duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
        sizeClasses[size] || sizeClasses.default,
        className
      )}
      {...props}
    />
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className, alt = "", onError, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(false);

  const handleError = (event) => {
    setHasError(true);
    onError?.(event);
  };

  if (hasError) {
    return null; // Let fallback handle the error
  }

  return (
    <AvatarPrimitive.Image
      ref={ref}
      alt={alt}
      className={cn(
        "aspect-square h-full w-full object-cover",
        "transition-opacity duration-200",
        className
      )}
      loading="lazy"
      decoding="async"
      onError={handleError}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarPrimitive.Image.displayName";

const AvatarFallback = React.forwardRef(({ className, children, delayMs = 150, ...props }, ref) => {
  const [showFallback, setShowFallback] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!showFallback) {
    return null;
  }

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center",
        "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800",
        "text-gray-600 dark:text-gray-300 font-medium",
        "select-none",
        className
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Fallback>
  );
});
AvatarFallback.displayName = "AvatarPrimitive.Fallback.displayName";

// Export types for better TypeScript support
export { Avatar, AvatarImage, AvatarFallback };
