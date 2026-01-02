import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef(({
  className,
  blur = true,
  ...props
}, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50",
      blur ? "bg-black/50 backdrop-blur-sm" : "bg-black/80",
      "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      "transition-opacity duration-300 ease-out",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-white dark:bg-gray-900 shadow-2xl transition-all ease-in-out",
  {
    variants: {
      side: {
        top: cn(
          "inset-x-0 top-0 border-b border-gray-200 dark:border-gray-800",
          "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
          "data-[state=closed]:duration-300 data-[state=open]:duration-500"
        ),
        bottom: cn(
          "inset-x-0 bottom-0 border-t border-gray-200 dark:border-gray-800",
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          "data-[state=closed]:duration-300 data-[state=open]:duration-500"
        ),
        left: cn(
          "inset-y-0 left-0 h-full border-r border-gray-200 dark:border-gray-800",
          "w-full sm:max-w-sm",
          "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
          "data-[state=closed]:duration-300 data-[state=open]:duration-500"
        ),
        right: cn(
          "inset-y-0 right-0 h-full border-l border-gray-200 dark:border-gray-800",
          "w-full sm:max-w-sm",
          "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          "data-[state=closed]:duration-300 data-[state=open]:duration-500"
        ),
      },
      size: {
        sm: "",
        default: "",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
        full: "w-full",
      },
    },
    defaultVariants: {
      side: "right",
      size: "default",
    },
  }
);

const SheetContent = React.forwardRef(({
  className,
  side = "right",
  size = "default",
  children,
  hideClose = false,
  overlayClassName,
  preventClose = false,
  ...props
}, ref) => {
  return (
    <SheetPortal>
      <SheetOverlay className={overlayClassName} />
      <SheetPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side, size }), className)}
        {...props}
      >
        {!hideClose && !preventClose && (
          <SheetPrimitive.Close
            className={cn(
              "absolute right-4 top-4 z-10",
              "rounded-lg p-1.5",
              "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              "hover:bg-gray-100 dark:hover:bg-gray-800",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              "transition-all duration-200",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
            aria-label="Close sheet"
          >
            <X className="h-4 w-4" />
          </SheetPrimitive.Close>
        )}
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  );
});
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = React.memo(({
  className,
  padding = true,
  border = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col space-y-2",
        padding && "px-6 pt-6",
        border && "border-b border-gray-200 dark:border-gray-800 pb-4",
        "text-center sm:text-left",
        className
      )}
      {...props}
    />
  );
});
SheetHeader.displayName = "SheetHeader";

const SheetFooter = React.memo(({
  className,
  padding = true,
  border = true,
  sticky = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        padding && "px-6 pb-6",
        border && "border-t border-gray-200 dark:border-gray-800 pt-4",
        sticky && "sticky bottom-0 bg-white dark:bg-gray-900",
        className
      )}
      {...props}
    />
  );
});
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef(({
  className,
  as: Component = SheetPrimitive.Title,
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
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef(({
  className,
  as: Component = SheetPrimitive.Description,
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
SheetDescription.displayName = SheetPrimitive.Description.displayName;

// Enhanced Sheet components
const SheetBody = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, scrollable = true, padding = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex-1",
          scrollable && "overflow-y-auto",
          padding && "px-6 py-4",
          className
        )}
        {...props}
      />
    );
  }
);
SheetBody.displayName = "SheetBody";

const SheetSection = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  title?: string;
  description?: string;
}>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-4", className)}
        {...props}
      >
        {(title || description) && (
          <div className="space-y-2">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    );
  }
);
SheetSection.displayName = "SheetSection";

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetSection,
};
