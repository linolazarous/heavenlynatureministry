import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef(({
  className,
  children,
  size = "default",
  variant = "default",
  error,
  success,
  disabled,
  leftIcon,
  fullWidth = true,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: "h-8 text-sm px-3",
    default: "h-10 text-sm px-3.5",
    lg: "h-12 text-base px-4",
  };

  const variantClasses = {
    default: cn(
      "bg-white dark:bg-gray-900",
      "border-gray-300 dark:border-gray-700",
      "hover:border-gray-400 dark:hover:border-gray-600",
      "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
      "dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
    ),
    outline: cn(
      "bg-transparent",
      "border-gray-300 dark:border-gray-700",
      "hover:border-gray-400 dark:hover:border-gray-600",
      "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
      "dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
    ),
    ghost: cn(
      "bg-gray-50 dark:bg-gray-800",
      "border-transparent",
      "hover:bg-gray-100 dark:hover:bg-gray-700",
      "focus:bg-white dark:focus:bg-gray-900",
      "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
      "dark:focus:border-blue-400 dark:focus:ring-blue-400/20",
    ),
  };

  return (
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex items-center justify-between rounded-lg border shadow-sm",
        "text-gray-900 dark:text-gray-100",
        "placeholder:text-gray-500 dark:placeholder:text-gray-400",
        "focus:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size] || sizeClasses.default,
        variantClasses[variant] || variantClasses.default,
        error && [
          "border-red-500 dark:border-red-400",
          "focus:border-red-500 focus:ring-2 focus:ring-red-500/20",
          "dark:focus:border-red-400 dark:focus:ring-red-400/20",
        ],
        success && [
          "border-green-500 dark:border-green-400",
          "focus:border-green-500 focus:ring-2 focus:ring-green-500/20",
          "dark:focus:border-green-400 dark:focus:ring-green-400/20",
        ],
        leftIcon && "pl-10",
        fullWidth && "w-full",
        "transition-all duration-200",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {leftIcon && (
        <span className="absolute left-3.5 text-gray-500 dark:text-gray-400">
          {leftIcon}
        </span>
      )}
      <span className="flex-1 truncate text-left">{children}</span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 flex-shrink-0",
            "text-gray-500 dark:text-gray-400",
            "transition-transform duration-200"
          )}
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-2",
      "text-gray-500 dark:text-gray-400",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-2",
      "text-gray-500 dark:text-gray-400",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = React.forwardRef(({
  className,
  children,
  position = "popper",
  align = "center",
  sideOffset = 4,
  collisionPadding = 8,
  portal = true,
  ...props
}, ref) => {
  const Content = (
    <SelectPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      collisionPadding={collisionPadding}
      position={position}
      className={cn(
        "relative z-50 max-h-[--radix-select-content-available-height]",
        "min-w-[8rem] overflow-hidden rounded-xl border shadow-2xl",
        "bg-white dark:bg-gray-900",
        "text-gray-900 dark:text-gray-100",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        "origin-[--radix-select-content-transform-origin]",
        "border-gray-200 dark:border-gray-800",
        "will-change-transform",
        className
      )}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-2",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  );

  return portal ? <SelectPrimitive.Portal>{Content}</SelectPrimitive.Portal> : Content;
});
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn(
      "px-3 py-2 text-xs font-semibold",
      "text-gray-600 dark:text-gray-400",
      "uppercase tracking-wider",
      className
    )}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef(({
  className,
  children,
  disabled,
  selected,
  icon,
  description,
  ...props
}, ref) => {
  return (
    <SelectPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-lg",
        "px-3 py-2.5 text-sm outline-none",
        "focus:bg-gray-100 focus:text-gray-900",
        "dark:focus:bg-gray-800 dark:focus:text-gray-100",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "transition-colors duration-150",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && (
        <span className="mr-3 text-gray-500 dark:text-gray-400">{icon}</span>
      )}
      <div className="flex-1">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        {description && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {description}
          </div>
        )}
      </div>
      <span className="ml-3 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
});
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn(
      "-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700",
      "shrink-0",
      className
    )}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

const SelectSearch = React.forwardRef(({
  className,
  placeholder = "Search...",
  onChange,
  ...props
}, ref) => {
  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 px-3 py-2 border-b border-gray-200 dark:border-gray-800">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          ref={ref}
          type="search"
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg border border-gray-300 dark:border-gray-700",
            "bg-white dark:bg-gray-900 px-10 py-2 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
            className
          )}
          onChange={onChange}
          {...props}
        />
      </div>
    </div>
  );
});
SelectSearch.displayName = "SelectSearch";

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectSearch,
};
