import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef(({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  collisionPadding = 8,
  arrow = true,
  arrowSize = "default",
  maxWidth = "20rem",
  showDelay = 300,
  hideDelay = 0,
  ...props
}, ref) => {
  const arrowSizeClasses = {
    sm: "w-2 h-1",
    default: "w-3 h-1.5",
    lg: "w-4 h-2",
  };

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-50 overflow-hidden rounded-lg px-3 py-1.5 text-sm",
          "bg-gray-900 text-gray-50",
          "shadow-lg shadow-black/10",
          "animate-in fade-in-0 zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          "data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          "origin-[--radix-tooltip-content-transform-origin]",
          "will-change-transform",
          "max-w-[20rem]",
          className
        )}
        style={{ maxWidth }}
        {...props}
      >
        {props.children}
        {arrow && (
          <TooltipPrimitive.Arrow
            className={cn(
              "fill-gray-900",
              arrowSizeClasses[arrowSize] || arrowSizeClasses.default
            )}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

// Enhanced Tooltip components
const TooltipWithDelay = React.forwardRef<
  typeof Tooltip,
  React.ComponentProps<typeof Tooltip> & {
    showDelay?: number;
    hideDelay?: number;
  }
>(({ showDelay = 300, hideDelay = 0, children, ...props }, ref) => {
  return (
    <TooltipPrimitive.Provider
      delayDuration={{ open: showDelay, close: hideDelay }}
    >
      <Tooltip ref={ref} {...props}>
        {children}
      </Tooltip>
    </TooltipPrimitive.Provider>
  );
});
TooltipWithDelay.displayName = "TooltipWithDelay";

const TooltipIcon = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<"span"> & {
    icon?: React.ReactNode;
    tooltip: string;
    side?: "top" | "right" | "bottom" | "left";
  }
>(({ className, icon = "?", tooltip, side = "top", children, ...props }, ref) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          ref={ref}
          className={cn(
            "inline-flex h-4 w-4 items-center justify-center rounded-full",
            "bg-gray-200 text-xs text-gray-700",
            "dark:bg-gray-700 dark:text-gray-300",
            "cursor-help",
            className
          )}
          {...props}
        >
          {icon}
        </span>
      </TooltipTrigger>
      <TooltipContent side={side}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
});
TooltipIcon.displayName = "TooltipIcon";

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipWithDelay,
  TooltipIcon,
};
