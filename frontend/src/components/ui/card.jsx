import * as React from "react";

import { cn } from "@/lib/utils";

const Card = React.forwardRef(({
  className,
  hoverable = false,
  elevated = true,
  bordered = true,
  radius = "xl",
  ...props
}, ref) => {
  const radiusClasses = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-3xl",
    full: "rounded-[2rem]",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "bg-white dark:bg-gray-900",
        "text-gray-900 dark:text-gray-100",
        "transition-all duration-200",
        elevated && "shadow-sm hover:shadow-md",
        hoverable && "hover:-translate-y-1 hover:shadow-lg",
        bordered && "border border-gray-200 dark:border-gray-800",
        radiusClasses[radius] || radiusClasses.xl,
        "overflow-hidden",
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ 
  className, 
  padding = true,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2",
      padding && "p-6",
      "border-b border-gray-100 dark:border-gray-800",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({
  className,
  as: Component = "div",
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
        sizeClasses[size] || sizeClasses.default,
        "text-gray-900 dark:text-gray-100",
        className
      )}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({
  className,
  truncate = false,
  lines = 0,
  ...props
}, ref) => {
  const lineClampClass = lines > 0 ? `line-clamp-${lines}` : "";

  return (
    <div
      ref={ref}
      className={cn(
        "text-sm text-gray-600 dark:text-gray-400",
        "leading-relaxed",
        truncate && "truncate",
        lineClampClass,
        className
      )}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({
  className,
  padding = true,
  scrollable = false,
  maxHeight,
  ...props
}, ref) => {
  const style = maxHeight ? { maxHeight } : undefined;

  return (
    <div
      ref={ref}
      className={cn(
        padding && "p-6",
        scrollable && "overflow-y-auto",
        className
      )}
      style={style}
      {...props}
    />
  );
});
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({
  className,
  padding = true,
  align = "start",
  ...props
}, ref) => {
  const alignClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        padding && "p-6",
        "border-t border-gray-100 dark:border-gray-800",
        alignClasses[align] || alignClasses.start,
        className
      )}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
