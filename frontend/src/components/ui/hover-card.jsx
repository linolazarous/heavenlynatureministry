import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { cn } from "@/lib/utils";

const HoverCard = HoverCardPrimitive.Root;

const HoverCardTrigger = HoverCardPrimitive.Trigger;

const HoverCardContent = React.forwardRef(({
  className,
  align = "center",
  side = "top",
  sideOffset = 4,
  alignOffset = 0,
  collisionPadding = 8,
  avoidCollisions = true,
  arrow = true,
  arrowSize = "default",
  interactive = true,
  delayDuration = 100,
  skipDelayDuration = 300,
  hideWhenDetached = false,
  ...props
}, ref) => {
  const arrowSizeClasses = {
    sm: "w-2 h-2",
    default: "w-3 h-3",
    lg: "w-4 h-4",
  };

  return (
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      side={side}
      sideOffset={sideOffset}
      alignOffset={alignOffset}
      collisionPadding={collisionPadding}
      avoidCollisions={avoidCollisions}
      hideWhenDetached={hideWhenDetached}
      className={cn(
        "z-50 overflow-hidden rounded-xl border shadow-2xl",
        "bg-white dark:bg-gray-900",
        "text-gray-900 dark:text-gray-100",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        "origin-[--radix-hover-card-content-transform-origin]",
        "border-gray-200 dark:border-gray-800",
        "will-change-transform",
        "outline-none",
        className
      )}
      {...props}
    >
      {arrow && (
        <HoverCardPrimitive.Arrow
          className={cn(
            "fill-white dark:fill-gray-900",
            "stroke-gray-200 dark:stroke-gray-800",
            arrowSizeClasses[arrowSize] || arrowSizeClasses.default
          )}
        />
      )}
      <div className="p-4">
        {props.children}
      </div>
    </HoverCardPrimitive.Content>
  );
});
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName;

export { HoverCard, HoverCardTrigger, HoverCardContent };
