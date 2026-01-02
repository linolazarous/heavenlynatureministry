import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";

const Separator = React.forwardRef(({
  className,
  orientation = "horizontal",
  decorative = true,
  size = "default",
  variant = "default",
  label,
  labelPosition = "center",
  ...props
}, ref) => {
  const sizeClasses = {
    xs: orientation === "horizontal" ? "h-px" : "w-px",
    sm: orientation === "horizontal" ? "h-0.5" : "w-0.5",
    default: orientation === "horizontal" ? "h-[1px]" : "w-[1px]",
    lg: orientation === "horizontal" ? "h-1" : "w-1",
    xl: orientation === "horizontal" ? "h-2" : "w-2",
  };

  const variantClasses = {
    default: "bg-gray-200 dark:bg-gray-800",
    muted: "bg-gray-100 dark:bg-gray-700",
    strong: "bg-gray-300 dark:bg-gray-600",
    brand: "bg-blue-200 dark:bg-blue-800",
    success: "bg-green-200 dark:bg-green-800",
    warning: "bg-yellow-200 dark:bg-yellow-800",
    destructive: "bg-red-200 dark:bg-red-800",
  };

  if (label) {
    return (
      <div
        className={cn(
          "flex items-center",
          orientation === "horizontal" ? "w-full" : "h-full flex-col",
          className
        )}
      >
        {orientation === "horizontal" ? (
          <>
            {(labelPosition === "center" || labelPosition === "left") && (
              <SeparatorPrimitive.Root
                ref={ref}
                decorative={decorative}
                orientation={orientation}
                className={cn(
                  "flex-1",
                  sizeClasses[size] || sizeClasses.default,
                  variantClasses[variant] || variantClasses.default,
                  labelPosition === "center" && "mr-3",
                  labelPosition === "left" && "mr-3"
                )}
                {...props}
              />
            )}
            <span
              className={cn(
                "px-3 text-xs font-medium",
                "text-gray-500 dark:text-gray-400",
                "uppercase tracking-wider whitespace-nowrap"
              )}
            >
              {label}
            </span>
            {(labelPosition === "center" || labelPosition === "right") && (
              <SeparatorPrimitive.Root
                ref={ref}
                decorative={decorative}
                orientation={orientation}
                className={cn(
                  "flex-1",
                  sizeClasses[size] || sizeClasses.default,
                  variantClasses[variant] || variantClasses.default,
                  labelPosition === "center" && "ml-3",
                  labelPosition === "right" && "ml-3"
                )}
                {...props}
              />
            )}
          </>
        ) : (
          <>
            {(labelPosition === "center" || labelPosition === "top") && (
              <SeparatorPrimitive.Root
                ref={ref}
                decorative={decorative}
                orientation={orientation}
                className={cn(
                  "flex-1",
                  sizeClasses[size] || sizeClasses.default,
                  variantClasses[variant] || variantClasses.default,
                  labelPosition === "center" && "mb-3",
                  labelPosition === "top" && "mb-3"
                )}
                {...props}
              />
            )}
            <span
              className={cn(
                "py-3 text-xs font-medium",
                "text-gray-500 dark:text-gray-400",
                "uppercase tracking-wider whitespace-nowrap",
                "-rotate-90"
              )}
            >
              {label}
            </span>
            {(labelPosition === "center" || labelPosition === "bottom") && (
              <SeparatorPrimitive.Root
                ref={ref}
                decorative={decorative}
                orientation={orientation}
                className={cn(
                  "flex-1",
                  sizeClasses[size] || sizeClasses.default,
                  variantClasses[variant] || variantClasses.default,
                  labelPosition === "center" && "mt-3",
                  labelPosition === "bottom" && "mt-3"
                )}
                {...props}
              />
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0",
        sizeClasses[size] || sizeClasses.default,
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    />
  );
});
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
