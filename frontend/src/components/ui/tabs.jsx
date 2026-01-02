import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = React.forwardRef(({
  className,
  defaultValue,
  value,
  onValueChange,
  orientation = "horizontal",
  activationMode = "automatic",
  children,
  ...props
}, ref) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || value || "");

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsPrimitive.Root
      ref={ref}
      value={activeTab}
      onValueChange={handleValueChange}
      orientation={orientation}
      activationMode={activationMode}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </TabsPrimitive.Root>
  );
});
Tabs.displayName = TabsPrimitive.Root.displayName;

const TabsList = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  fullWidth = false,
  ...props
}, ref) => {
  const variantClasses = {
    default: "bg-gray-100 dark:bg-gray-800",
    outline: "bg-transparent border border-gray-300 dark:border-gray-700",
    pills: "bg-transparent",
    underline: "bg-transparent border-b border-gray-200 dark:border-gray-800",
  };

  const sizeClasses = {
    sm: "h-8 rounded-md",
    default: "h-10 rounded-lg",
    lg: "h-12 rounded-xl",
  };

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center",
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.default,
        fullWidth && "w-full",
        variant === "underline" && "rounded-none",
        className
      )}
      {...props}
    />
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(({
  className,
  icon,
  iconPosition = "left",
  badge,
  disabled = false,
  ...props
}, ref) => {
  const variantClasses = {
    default: cn(
      "data-[state=active]:bg-white data-[state=active]:text-gray-900",
      "data-[state=active]:shadow-sm",
      "dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100",
      "hover:bg-gray-200 dark:hover:bg-gray-700",
    ),
    outline: cn(
      "data-[state=active]:bg-white data-[state=active]:text-gray-900",
      "data-[state=active]:border-gray-300 data-[state=active]:shadow-sm",
      "dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-gray-100",
      "dark:data-[state=active]:border-gray-700",
      "hover:bg-gray-100 dark:hover:bg-gray-800",
      "border border-transparent",
    ),
    pills: cn(
      "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
      "dark:data-[state=active]:bg-blue-500",
      "hover:bg-gray-200 dark:hover:bg-gray-700",
      "rounded-full",
    ),
    underline: cn(
      "data-[state=active]:text-blue-600 data-[state=active]:border-b-2",
      "data-[state=active]:border-blue-600",
      "dark:data-[state=active]:text-blue-400 dark:data-[state=active]:border-blue-400",
      "hover:text-gray-900 dark:hover:text-gray-100",
      "border-b-2 border-transparent",
      "rounded-none",
    ),
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap",
        "px-4 py-2 text-sm font-medium transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses.default,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <span className="mr-2">{icon}</span>
      )}
      <span>{props.children}</span>
      {icon && iconPosition === "right" && (
        <span className="ml-2">{icon}</span>
      )}
      {badge && (
        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {badge}
        </span>
      )}
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(({
  className,
  lazy = false,
  keepMounted = false,
  unmountOnExit = true,
  ...props
}, ref) => {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn(
        "mt-4 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "dark:ring-offset-gray-900",
        "data-[state=inactive]:hidden",
        !unmountOnExit && "data-[state=inactive]:hidden",
        className
      )}
      forceMount={keepMounted}
      {...props}
    />
  );
});
TabsContent.displayName = TabsPrimitive.Content.displayName;

// Enhanced Tabs components
const TabsPanel = React.forwardRef(({
  className,
  value,
  lazy,
  unmountOnExit,
  children,
  ...props
}, ref) => {
  const [isLoaded, setIsLoaded] = React.useState(!lazy);

  React.useEffect(() => {
    if (lazy && !isLoaded) {
      setIsLoaded(true);
    }
  }, [lazy, isLoaded]);

  if (lazy && !isLoaded) {
    return null;
  }

  return (
    <TabsContent
      ref={ref}
      value={value}
      className={className}
      unmountOnExit={unmountOnExit}
      {...props}
    >
      {children}
    </TabsContent>
  );
});
TabsPanel.displayName = "TabsPanel";

const TabsIndicator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute bottom-0 h-0.5 bg-blue-600 dark:bg-blue-500",
      "transition-all duration-300 ease-out",
      className
    )}
    {...props}
  />
));
TabsIndicator.displayName = "TabsIndicator";
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsPanel,
  TabsIndicator,
};
