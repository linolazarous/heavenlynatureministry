import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef(({
  className,
  children,
  type = "auto",
  scrollHideDelay = 600,
  orientation = "vertical",
  scrollbars = "both",
  ...props
}, ref) => {
  const [isScrolling, setIsScrolling] = React.useState(false);
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout>();

  const handleScroll = () => {
    setIsScrolling(true);
    clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, scrollHideDelay);
  };

  React.useEffect(() => {
    return () => {
      clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      type={type}
      scrollHideDelay={scrollHideDelay}
      className={cn("relative overflow-hidden", className)}
      onScroll={handleScroll}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        className={cn(
          "h-full w-full rounded-[inherit]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        )}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      
      {(scrollbars === "both" || scrollbars === "vertical") && (
        <ScrollBar orientation="vertical" isScrolling={isScrolling} />
      )}
      
      {(scrollbars === "both" || scrollbars === "horizontal") && (
        <ScrollBar orientation="horizontal" isScrolling={isScrolling} />
      )}
      
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef(({
  className,
  orientation = "vertical",
  isScrolling = false,
  ...props
}, ref) => {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-all duration-300",
        "bg-transparent",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px]",
        orientation === "horizontal" &&
          "h-2.5 w-full border-t border-t-transparent p-[1px]",
        isScrolling && "opacity-100",
        !isScrolling && "opacity-0 hover:opacity-100",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        className={cn(
          "relative flex-1 rounded-full",
          "bg-gray-300 dark:bg-gray-700",
          "hover:bg-gray-400 dark:hover:bg-gray-600",
          "transition-colors duration-200",
          "before:absolute before:left-1/2 before:top-1/2",
          "before:h-full before:min-h-[44px] before:w-full before:min-w-[44px]",
          "before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']"
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
});
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

// Enhanced Scroll Area Components
const ScrollAreaContainer = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, maxHeight, ...props }, ref) => {
    const style = maxHeight ? { maxHeight } : undefined;
    
    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        style={style}
        {...props}
      />
    );
  }
);
ScrollAreaContainer.displayName = "ScrollAreaContainer";

const ScrollAreaViewport = React.forwardRef<
  typeof ScrollAreaPrimitive.Viewport,
  React.ComponentProps<typeof ScrollAreaPrimitive.Viewport>
>(({ className, ...props }, ref) => {
  return (
    <ScrollAreaPrimitive.Viewport
      ref={ref}
      className={cn("h-full w-full rounded-[inherit]", className)}
      {...props}
    />
  );
});
ScrollAreaViewport.displayName = "ScrollAreaViewport";

export {
  ScrollArea,
  ScrollBar,
  ScrollAreaContainer,
  ScrollAreaViewport,
};
