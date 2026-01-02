import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const MenubarMenu = MenubarPrimitive.Menu;

const MenubarGroup = React.forwardRef(({ className, ...props }, ref) => (
  <MenubarPrimitive.Group
    ref={ref}
    className={cn("py-1", className)}
    {...props}
  />
));
MenubarGroup.displayName = "MenubarPrimitive.Group.displayName";

const MenubarPortal = MenubarPrimitive.Portal;

const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

const MenubarSub = MenubarPrimitive.Sub;

const Menubar = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  ...props
}, ref) => {
  const variantClasses = {
    default: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
    ghost: "bg-transparent border-transparent",
    outline: "bg-transparent border-gray-300 dark:border-gray-700",
  };

  const sizeClasses = {
    sm: "h-8 text-sm rounded-md",
    default: "h-10 text-sm rounded-lg",
    lg: "h-12 text-base rounded-xl",
  };

  return (
    <MenubarPrimitive.Root
      ref={ref}
      className={cn(
        "flex items-center space-x-1 border shadow-sm",
        "focus:outline-none",
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.default,
        className
      )}
      {...props}
    />
  );
});
Menubar.displayName = "MenubarPrimitive.Root.displayName";

const MenubarTrigger = React.forwardRef(({
  className,
  active,
  ...props
}, ref) => {
  return (
    <MenubarPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-md px-3 py-1.5",
        "text-sm font-medium",
        "text-gray-700 dark:text-gray-300",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-100",
        "data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900",
        "dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-100",
        "outline-none",
        "transition-colors duration-150",
        active && "bg-gray-100 dark:bg-gray-800",
        className
      )}
      {...props}
    />
  );
});
MenubarTrigger.displayName = "MenubarPrimitive.Trigger.displayName";

const MenubarSubTrigger = React.forwardRef(({
  className,
  inset = false,
  children,
  showArrow = true,
  ...props
}, ref) => {
  return (
    <MenubarPrimitive.SubTrigger
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm",
        "outline-none focus:bg-gray-100 focus:text-gray-900",
        "dark:focus:bg-gray-800 dark:focus:text-gray-100",
        "data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900",
        "dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-100",
        "transition-colors duration-150",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      {showArrow && (
        <ChevronRight
          className="ml-auto h-4 w-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
        />
      )}
    </MenubarPrimitive.SubTrigger>
  );
});
MenubarSubTrigger.displayName = "MenubarPrimitive.SubTrigger.displayName";

const MenubarSubContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <MenubarPrimitive.SubContent
      ref={ref}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden rounded-lg border",
        "bg-white dark:bg-gray-900",
        "text-gray-900 dark:text-gray-100",
        "shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2",
        "data-[side=left]:slide-in-from-right-2",
        "data-[side=right]:slide-in-from-left-2",
        "data-[side=top]:slide-in-from-bottom-2",
        "origin-[--radix-menubar-content-transform-origin]",
        "border-gray-200 dark:border-gray-800",
        "will-change-transform",
        className
      )}
      {...props}
    />
  );
});
MenubarSubContent.displayName = "MenubarPrimitive.SubContent.displayName";

const MenubarContent = React.forwardRef(({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  collisionPadding = 8,
  ...props
}, ref) => {
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "z-50 min-w-[12rem] overflow-hidden rounded-lg border",
          "bg-white dark:bg-gray-900",
          "text-gray-900 dark:text-gray-100",
          "shadow-xl shadow-black/5 dark:shadow-black/30",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          "origin-[--radix-menubar-content-transform-origin]",
          "border-gray-200 dark:border-gray-800",
          "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
          "scrollbar-track-transparent",
          "will-change-transform",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  );
});
MenubarContent.displayName = "MenubarPrimitive.Content.displayName";

const MenubarItem = React.forwardRef(({
  className,
  inset = false,
  variant = "default",
  icon,
  shortcut,
  destructive = false,
  ...props
}, ref) => {
  const variantClasses = {
    default: cn(
      "focus:bg-gray-100 focus:text-gray-900",
      "dark:focus:bg-gray-800 dark:focus:text-gray-100",
      destructive && [
        "text-red-600 dark:text-red-400",
        "focus:bg-red-50 focus:text-red-700",
        "dark:focus:bg-red-900/20 dark:focus:text-red-300",
      ],
    ),
  };

  return (
    <MenubarPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm",
        "outline-none",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "transition-colors duration-150",
        inset && "pl-8",
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    >
      {icon && (
        <span className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{props.children}</span>
      {shortcut && (
        <kbd className="ml-auto text-xs tracking-widest text-gray-500 dark:text-gray-400 font-mono">
          {shortcut}
        </kbd>
      )}
    </MenubarPrimitive.Item>
  );
});
MenubarItem.displayName = "MenubarPrimitive.Item.displayName";

const MenubarCheckboxItem = React.forwardRef(({
  className,
  children,
  checked,
  disabled,
  onCheckedChange,
  indeterminate,
  ...props
}, ref) => {
  return (
    <MenubarPrimitive.CheckboxItem
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm",
        "outline-none focus:bg-gray-100 focus:text-gray-900",
        "dark:focus:bg-gray-800 dark:focus:text-gray-100",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "transition-colors duration-150",
        className
      )}
      checked={indeterminate ? "indeterminate" : checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          {indeterminate ? (
            <Minus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
});
MenubarCheckboxItem.displayName = "MenubarPrimitive.CheckboxItem.displayName";

const MenubarRadioItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <MenubarPrimitive.RadioItem
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm",
        "outline-none focus:bg-gray-100 focus:text-gray-900",
        "dark:focus:bg-gray-800 dark:focus:text-gray-100",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "transition-colors duration-150",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-blue-600 dark:fill-blue-400" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
});
MenubarRadioItem.displayName = "MenubarPrimitive.RadioItem.displayName";

const MenubarLabel = React.forwardRef(({
  className,
  inset = false,
  ...props
}, ref) => {
  return (
    <MenubarPrimitive.Label
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400",
        "uppercase tracking-wider",
        "select-none",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  );
});
MenubarLabel.displayName = "MenubarPrimitive.Label.displayName";

const MenubarSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <MenubarPrimitive.Separator
      ref={ref}
      className={cn(
        "-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700",
        "shrink-0",
        className
      )}
      {...props}
    />
  );
});
MenubarSeparator.displayName = "MenubarPrimitive.Separator.displayName";

const MenubarShortcut = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <kbd
      ref={ref}
      className={cn(
        "ml-auto text-xs tracking-widest text-gray-500 dark:text-gray-400",
        "font-mono",
        className
      )}
      {...props}
    />
  );
});
MenubarShortcut.displayName = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};
