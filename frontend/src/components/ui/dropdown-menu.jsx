import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight, Circle, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const DropdownMenu = DropdownMenuPrimitive.Root;

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuGroup = React.forwardRef(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Group
    ref={ref}
    className={cn("py-1", className)}
    {...props}
  />
));
DropdownMenuGroup.displayName = DropdownMenuPrimitive.Group.displayName;

const DropdownMenuPortal = DropdownMenuPrimitive.Portal;

const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef(({
  className,
  inset = false,
  children,
  showArrow = true,
  ...props
}, ref) => {
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
        "outline-none focus:bg-gray-100 focus:text-gray-900",
        "dark:focus:bg-gray-800 dark:focus:text-gray-100",
        "data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900",
        "dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-100",
        "transition-colors duration-150",
        "[&>svg]:size-4 [&>svg]:shrink-0",
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
    </DropdownMenuPrimitive.SubTrigger>
  );
});
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.SubContent
      ref={ref}
      className={cn(
        "z-50 min-w-[10rem] overflow-hidden rounded-lg border",
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
        "origin-[--radix-dropdown-menu-content-transform-origin]",
        "border-gray-200 dark:border-gray-800",
        "will-change-transform",
        className
      )}
      {...props}
    />
  );
});
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;

const DropdownMenuContent = React.forwardRef(({
  className,
  sideOffset = 4,
  align = "start",
  side = "bottom",
  collisionPadding = 8,
  ...props
}, ref) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        side={side}
        collisionPadding={collisionPadding}
        className={cn(
          "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)]",
          "min-w-[10rem] overflow-y-auto overflow-x-hidden rounded-lg border",
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
          "origin-[--radix-dropdown-menu-content-transform-origin]",
          "border-gray-200 dark:border-gray-800",
          "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
          "scrollbar-track-transparent",
          "will-change-transform",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef(({
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
    <DropdownMenuPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
        "outline-none",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "transition-colors duration-150",
        "[&>svg]:size-4 [&>svg]:shrink-0",
        inset && "pl-8",
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    >
      {icon && (
        <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      )}
      <span className="flex-1 truncate">{props.children}</span>
      {shortcut && (
        <kbd className="ml-auto text-xs tracking-widest text-gray-500 dark:text-gray-400">
          {shortcut}
        </kbd>
      )}
    </DropdownMenuPrimitive.Item>
  );
});
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef(({
  className,
  children,
  checked,
  disabled,
  onCheckedChange,
  indeterminate,
  ...props
}, ref) => {
  return (
    <DropdownMenuPrimitive.CheckboxItem
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
        <DropdownMenuPrimitive.ItemIndicator>
          {indeterminate ? (
            <Minus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.RadioItem
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
        <DropdownMenuPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-blue-600 dark:fill-blue-400" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
});
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef(({
  className,
  inset = false,
  ...props
}, ref) => {
  return (
    <DropdownMenuPrimitive.Label
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
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <DropdownMenuPrimitive.Separator
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
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

const DropdownMenuShortcut = React.forwardRef(({ className, ...props }, ref) => {
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
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
