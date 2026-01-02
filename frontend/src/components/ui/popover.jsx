import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef(({
  className,
  align = "center",
  side = "bottom",
  sideOffset = 4,
  alignOffset = 0,
  collisionPadding = 8,
  arrow = true,
  arrowSize = "default",
  avoidCollisions = true,
  sticky = "partial",
  hideWhenDetached = false,
  ...props
}, ref) => {
  const arrowSizeClasses = {
    sm: "w-2 h-1",
    default: "w-3 h-1.5",
    lg: "w-4 h-2",
  };

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        side={side}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        avoidCollisions={avoidCollisions}
        sticky={sticky}
        hideWhenDetached={hideWhenDetached}
        className={cn(
          "z-50 w-72 rounded-xl border p-4",
          "bg-white dark:bg-gray-900",
          "text-gray-900 dark:text-gray-100",
          "shadow-2xl shadow-black/10 dark:shadow-black/30",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          "origin-[--radix-popover-content-transform-origin]",
          "border-gray-200 dark:border-gray-800",
          "will-change-transform",
          "outline-none",
          className
        )}
        {...props}
      >
        {props.children}
        {arrow && (
          <PopoverPrimitive.Arrow
            className={cn(
              "fill-white dark:fill-gray-900",
              "stroke-gray-200 dark:stroke-gray-800",
              arrowSizeClasses[arrowSize] || arrowSizeClasses.default
            )}
          />
        )}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// Compound components for better DX
const PopoverHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 pb-3 mb-3",
        "border-b border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    />
  )
);
PopoverHeader.displayName = "PopoverHeader";

const PopoverTitle = React.forwardRef<HTMLHeadingElement, React.ComponentProps<"h3">>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        "text-gray-900 dark:text-gray-100",
        className
      )}
      {...props}
    />
  )
);
PopoverTitle.displayName = "PopoverTitle";

const PopoverDescription = React.forwardRef<HTMLParagraphElement, React.ComponentProps<"p">>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-sm text-gray-600 dark:text-gray-400",
        "leading-relaxed",
        className
      )}
      {...props}
    />
  )
);
PopoverDescription.displayName = "PopoverDescription";

const PopoverFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-end gap-2 pt-3 mt-3",
        "border-t border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    />
  )
);
PopoverFooter.displayName = "PopoverFooter";

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
  PopoverFooter,
};
