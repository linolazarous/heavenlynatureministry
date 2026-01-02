import * as React from "react";
import { cn } from "@/lib/utils";

const Skeleton = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  variant?: "default" | "circle" | "rounded" | "text";
  size?: "xs" | "sm" | "default" | "lg" | "xl" | "2xl";
  lines?: number;
  gap?: "xs" | "sm" | "default" | "lg";
}>(({
  className,
  variant = "default",
  size = "default",
  lines = 1,
  gap = "default",
  style,
  ...props
}, ref) => {
  const variantClasses = {
    default: "rounded-lg",
    circle: "rounded-full",
    rounded: "rounded-full",
    text: "rounded",
  };

  const sizeClasses = {
    xs: "h-4",
    sm: "h-6",
    default: "h-8",
    lg: "h-12",
    xl: "h-16",
    "2xl": "h-20",
  };

  const gapClasses = {
    xs: "gap-1",
    sm: "gap-2",
    default: "gap-3",
    lg: "gap-4",
  };

  if (lines > 1) {
    return (
      <div className={cn("flex flex-col", gapClasses[gap] || gapClasses.default)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            ref={index === 0 ? ref : undefined}
            className={cn(
              "animate-pulse rounded-lg",
              "bg-gray-200 dark:bg-gray-800",
              variantClasses[variant] || variantClasses.default,
              variant === "text" && sizeClasses[size],
              className
            )}
            style={{
              width: `${100 - index * 10}%`,
              ...style,
            }}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "animate-pulse",
        "bg-gray-200 dark:bg-gray-800",
        variantClasses[variant] || variantClasses.default,
        variant !== "text" && sizeClasses[size],
        className
      )}
      style={style}
      {...props}
    />
  );
});
Skeleton.displayName = "Skeleton";

// Enhanced Skeleton components
const SkeletonContainer = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("animate-pulse", className)}
      {...props}
    />
  )
);
SkeletonContainer.displayName = "SkeletonContainer";

const SkeletonText = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  lines?: number;
  spacing?: "tight" | "normal" | "loose";
}>(
  ({ className, lines = 3, spacing = "normal", ...props }, ref) => {
    const spacingClasses = {
      tight: "gap-1",
      normal: "gap-2",
      loose: "gap-3",
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col", spacingClasses[spacing], className)}
        {...props}
      >
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            size="default"
            className={index === lines - 1 ? "w-3/4" : "w-full"}
          />
        ))}
      </div>
    );
  }
);
SkeletonText.displayName = "SkeletonText";

const SkeletonAvatar = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  size?: "xs" | "sm" | "default" | "lg" | "xl";
}>(
  ({ className, size = "default", ...props }, ref) => {
    const sizeClasses = {
      xs: "h-6 w-6",
      sm: "h-8 w-8",
      default: "h-10 w-10",
      lg: "h-12 w-12",
      xl: "h-16 w-16",
    };

    return (
      <Skeleton
        ref={ref}
        variant="circle"
        className={cn(sizeClasses[size] || sizeClasses.default, className)}
        {...props}
      />
    );
  }
);
SkeletonAvatar.displayName = "SkeletonAvatar";

export {
  Skeleton,
  SkeletonContainer,
  SkeletonText,
  SkeletonAvatar,
};
