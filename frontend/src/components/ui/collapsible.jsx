import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = React.forwardRef(({
  className,
  children,
  showArrow = true,
  arrowPosition = "left",
  arrowSize = "default",
  icon: CustomIcon,
  ...props
}, ref) => {
  const arrowSizeClasses = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const Icon = CustomIcon || ChevronRight;

  return (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between",
        "rounded-lg px-3 py-2",
        "text-sm font-medium text-gray-900 dark:text-gray-100",
        "hover:bg-gray-50 dark:hover:bg-gray-800",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "transition-all duration-200",
        "data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-gray-800",
        "data-[state=open]:text-blue-600 dark:data-[state=open]:text-blue-400",
        "select-none",
        className
      )}
      {...props}
    >
      {showArrow && arrowPosition === "left" && (
        <Icon
          className={cn(
            arrowSizeClasses[arrowSize] || arrowSizeClasses.default,
            "mr-2 shrink-0 transition-transform duration-200",
            "data-[state=open]:rotate-90"
          )}
          aria-hidden="true"
        />
      )}
      <span className="flex-1 text-left">{children}</span>
      {showArrow && arrowPosition === "right" && (
        <ChevronDown
          className={cn(
            arrowSizeClasses[arrowSize] || arrowSizeClasses.default,
            "ml-2 shrink-0 transition-transform duration-200",
            "data-[state=open]:rotate-180"
          )}
          aria-hidden="true"
        />
      )}
    </CollapsiblePrimitive.Trigger>
  );
});
CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = React.forwardRef(({
  className,
  children,
  animate = true,
  unmountOnExit = false,
  initialMount = false,
  ...props
}, ref) => {
  return (
    <CollapsiblePrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden",
        animate && [
          "data-[state=open]:animate-collapsible-down",
          "data-[state=closed]:animate-collapsible-up",
          "will-change-[height,opacity]",
        ],
        !animate && "transition-[height] duration-200",
        "motion-reduce:transition-none"
      )}
      forceMount={initialMount}
      {...props}
    >
      <div
        className={cn(
          "px-3 py-2 text-sm text-gray-600 dark:text-gray-300",
          "border-t border-gray-100 dark:border-gray-800",
          "animate-in fade-in-50 duration-200",
          className
        )}
      >
        {children}
      </div>
    </CollapsiblePrimitive.Content>
  );
});
CollapsibleContent.displayName = "CollapsibleContent";

// Compound export for better DX
export { Collapsible, CollapsibleTrigger, CollapsibleContent };
