import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const NavigationMenu = React.forwardRef(({
  className,
  children,
  orientation = "horizontal",
  viewport = true,
  ...props
}, ref) => {
  return (
    <NavigationMenuPrimitive.Root
      ref={ref}
      className={cn(
        "relative z-50",
        orientation === "horizontal"
          ? "flex max-w-max flex-1 items-center justify-center"
          : "flex flex-col",
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
});
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef(({
  className,
  orientation = "horizontal",
  ...props
}, ref) => {
  return (
    <NavigationMenuPrimitive.List
      ref={ref}
      className={cn(
        "group flex list-none items-center",
        orientation === "horizontal"
          ? "space-x-1"
          : "flex-col space-y-1",
        className
      )}
      {...props}
    />
  );
});
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  [
    "group inline-flex items-center justify-center rounded-lg",
    "text-sm font-medium transition-all duration-200",
    "hover:bg-gray-100 hover:text-gray-900",
    "dark:hover:bg-gray-800 dark:hover:text-gray-100",
    "focus:bg-gray-100 focus:text-gray-900 focus:outline-none",
    "dark:focus:bg-gray-800 dark:focus:text-gray-100",
    "data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900",
    "dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-100",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-3",
        default: "h-10 px-4",
        lg: "h-12 px-5",
      },
      variant: {
        default: "",
        outline: "border border-gray-300 dark:border-gray-700",
        ghost: "hover:bg-transparent hover:text-current",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

const NavigationMenuTrigger = React.forwardRef(({
  className,
  children,
  showChevron = true,
  chevronPosition = "right",
  size = "default",
  variant = "default",
  ...props
}, ref) => {
  return (
    <NavigationMenuPrimitive.Trigger
      ref={ref}
      className={cn(
        navigationMenuTriggerStyle({ size, variant }),
        "group",
        "data-[state=open]:shadow-sm",
        className
      )}
      {...props}
    >
      {chevronPosition === "left" && showChevron && (
        <ChevronDown
          className="mr-2 h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      )}
      {children}
      {chevronPosition === "right" && showChevron && (
        <ChevronDown
          className="ml-2 h-4 w-4 transition-transform duration-300 group-data-[state=open]:rotate-180"
          aria-hidden="true"
        />
      )}
    </NavigationMenuPrimitive.Trigger>
  );
});
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef(({
  className,
  width = "auto",
  align = "center",
  ...props
}, ref) => {
  const widthClasses = {
    sm: "w-48",
    default: "w-56",
    lg: "w-64",
    xl: "w-80",
    auto: "w-auto",
    full: "w-screen max-w-sm",
  };

  return (
    <NavigationMenuPrimitive.Content
      ref={ref}
      className={cn(
        "left-0 top-0 w-full",
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out",
        "data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out",
        "data-[motion=from-end]:slide-in-from-right-52",
        "data-[motion=from-start]:slide-in-from-left-52",
        "data-[motion=to-end]:slide-out-to-right-52",
        "data-[motion=to-start]:slide-out-to-left-52",
        "md:absolute md:w-auto",
        widthClasses[width] || widthClasses.default,
        "origin-top",
        className
      )}
      {...props}
    />
  );
});
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = React.forwardRef(({
  className,
  active,
  disabled,
  icon,
  iconPosition = "left",
  description,
  children,
  ...props
}, ref) => {
  return (
    <NavigationMenuPrimitive.Link
      ref={ref}
      className={cn(
        "block select-none rounded-lg p-3",
        "text-sm leading-none no-underline outline-none",
        "hover:bg-gray-100 hover:text-gray-900",
        "dark:hover:bg-gray-800 dark:hover:text-gray-100",
        "focus:bg-gray-100 focus:text-gray-900",
        "dark:focus:bg-gray-800 dark:focus:text-gray-100",
        "transition-colors duration-150",
        active && [
          "bg-blue-50 text-blue-700",
          "dark:bg-blue-900/20 dark:text-blue-400",
          "hover:bg-blue-100 hover:text-blue-800",
          "dark:hover:bg-blue-900/30 dark:hover:text-blue-300",
        ],
        disabled && "pointer-events-none opacity-50",
        className
      )}
      disabled={disabled}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && iconPosition === "left" && (
          <span className="text-gray-500 dark:text-gray-400">{icon}</span>
        )}
        <div className="flex-1">
          <div className="font-medium">{children}</div>
          {description && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {description}
            </div>
          )}
        </div>
        {icon && iconPosition === "right" && (
          <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    </NavigationMenuPrimitive.Link>
  );
});
NavigationMenuLink.displayName = "NavigationMenuLink";

const NavigationMenuViewport = React.forwardRef(({
  className,
  position = "center",
  ...props
}, ref) => {
  const positionClasses = {
    left: "left-0",
    center: "left-1/2 -translate-x-1/2",
    right: "right-0",
  };

  return (
    <div className={cn("absolute left-0 top-full flex", positionClasses[position])}>
      <NavigationMenuPrimitive.Viewport
        ref={ref}
        className={cn(
          "origin-top-center relative mt-1.5",
          "h-[var(--radix-navigation-menu-viewport-height)]",
          "w-full overflow-hidden rounded-xl border shadow-2xl",
          "bg-white dark:bg-gray-900",
          "text-gray-900 dark:text-gray-100",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90",
          "md:w-[var(--radix-navigation-menu-viewport-width)]",
          "border-gray-200 dark:border-gray-800",
          "will-change-transform",
          className
        )}
        {...props}
      />
    </div>
  );
});
NavigationMenuViewport.displayName = NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <NavigationMenuPrimitive.Indicator
      ref={ref}
      className={cn(
        "top-full z-[1] flex h-2 items-end justify-center overflow-hidden",
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out",
        "data-[state=hidden]:fade-out data-[state=visible]:fade-in",
        className
      )}
      {...props}
    >
      <div
        className="relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm bg-gray-200 dark:bg-gray-700 shadow"
      />
    </NavigationMenuPrimitive.Indicator>
  );
});
NavigationMenuIndicator.displayName = NavigationMenuPrimitive.Indicator.displayName;

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
