import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Drawer = React.forwardRef(({
  shouldScaleBackground = true,
  dismissible = true,
  snapPoints = [0.5, 1],
  defaultSnap = 0,
  open,
  onOpenChange,
  modal = true,
  nested = false,
  direction = "bottom",
  ...props
}, ref) => {
  return (
    <DrawerPrimitive.Root
      ref={ref}
      shouldScaleBackground={shouldScaleBackground}
      dismissible={dismissible}
      snapPoints={snapPoints}
      defaultSnap={defaultSnap}
      open={open}
      onOpenChange={onOpenChange}
      modal={modal}
      nested={nested}
      direction={direction}
      {...props}
    />
  );
});
Drawer.displayName = "Drawer";

const DrawerTrigger = DrawerPrimitive.Trigger;

const DrawerPortal = DrawerPrimitive.Portal;

const DrawerClose = DrawerPrimitive.Close;

const DrawerOverlay = React.forwardRef(({
  className,
  blur = true,
  ...props
}, ref) => (
  <DrawerPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      blur ? "bg-black/50 backdrop-blur-sm" : "bg-black/80",
      "transition-opacity duration-300 ease-out",
      "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      className
    )}
    {...props}
  />
));
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef(({
  className,
  children,
  direction = "bottom",
  hideHandle = false,
  overlayClassName,
  preventClose = false,
  ...props
}, ref) => {
  const directionClasses = {
    bottom: cn(
      "inset-x-0 bottom-0 mt-24",
      "rounded-t-[10px] sm:rounded-t-[20px]"
    ),
    top: cn(
      "inset-x-0 top-0 mb-24",
      "rounded-b-[10px] sm:rounded-b-[20px]"
    ),
    left: cn(
      "inset-y-0 left-0 mr-24",
      "rounded-r-[10px] sm:rounded-r-[20px]"
    ),
    right: cn(
      "inset-y-0 right-0 ml-24",
      "rounded-l-[10px] sm:rounded-l-[20px]"
    ),
  };

  return (
    <DrawerPortal>
      <DrawerOverlay className={overlayClassName} />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 flex h-auto flex-col",
          "bg-white dark:bg-gray-900",
          "border border-gray-200 dark:border-gray-800",
          "shadow-2xl shadow-black/20 dark:shadow-black/40",
          directionClasses[direction] || directionClasses.bottom,
          "focus:outline-none",
          "data-[state=open]:animate-slide-in data-[state=closed]:animate-slide-out",
          "duration-300 ease-out",
          "will-change-transform",
          className
        )}
        {...props}
      >
        {!hideHandle && direction !== "left" && direction !== "right" && (
          <div className="mx-auto mt-3 flex h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700" />
        )}
        {children}
        {!preventClose && (
          <DrawerPrimitive.Close
            className={cn(
              "absolute right-3 top-3 z-10",
              "rounded-lg p-1.5",
              "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              "transition-all duration-200",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </DrawerPrimitive.Close>
        )}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
});
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = React.memo(({
  className,
  padding = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "grid gap-1.5",
        padding && "p-4 sm:p-6",
        "text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
});
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = React.memo(({
  className,
  padding = true,
  sticky = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "mt-auto flex flex-col gap-2",
        padding && "p-4 sm:p-6",
        sticky && "sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    />
  );
});
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef(({
  className,
  as: Component = DrawerPrimitive.Title,
  size = "default",
  ...props
}, ref) => {
  const sizeClasses = {
    sm: "text-lg font-semibold",
    default: "text-xl font-bold",
    lg: "text-2xl font-bold",
  };

  return (
    <Component
      ref={ref}
      className={cn(
        "leading-none tracking-tight",
        "text-gray-900 dark:text-gray-100",
        sizeClasses[size] || sizeClasses.default,
        className
      )}
      {...props}
    />
  );
});
DrawerTitle.displayName = DrawerPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef(({
  className,
  as: Component = DrawerPrimitive.Description,
  ...props
}, ref) => {
  return (
    <Component
      ref={ref}
      className={cn(
        "text-sm text-gray-600 dark:text-gray-400",
        "leading-relaxed",
        className
      )}
      {...props}
    />
  );
});
DrawerDescription.displayName = DrawerPrimitive.Description.displayName;

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
