import * as React from "react";
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import { Check, ChevronRight, Circle, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const ContextMenu = ContextMenuPrimitive.Root;

const ContextMenuTrigger = ContextMenuPrimitive.Trigger;

const ContextMenuGroup = React.forwardRef(({ className, ...props }, ref) => (
  <ContextMenuPrimitive.Group
    ref={ref}
    className={cn("py-1", className)}
    {...props}
  />
));
ContextMenuGroup.displayName = "ContextMenuPrimitive.Group.displayName";

const ContextMenuPortal = ContextMenuPrimitive.Portal;

const ContextMenuSub = ContextMenuPrimitive.Sub;

const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup;

const ContextMenuSubTrigger = React.forwardRef(({
  className,
  inset = false,
  children,
  showArrow = true,
  ...props
}, ref) => {
  return (
    <ContextMenuPrimitive.SubTrigger
      ref={ref}
      className={cn(
        "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm",
        "outline-none focus:bg-gray-100 focus:text-gray-900",
        "dark:focus:bg-gray-800 dark:focus:text-gray-100",
        "data-[state=open]:bg-gray-100 data-[state=open]:text-gray-900",
        "dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-100",
        inset && "pl-8",
        "transition-colors duration-150",
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
    </ContextMenuPrimitive.SubTrigger>
  );
});
ContextMenuSubTrigger.displayName = "ContextMenuPrimitive.SubTrigger.displayName";

const ContextMenuSubContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.SubContent
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
        "origin-[--radix-context-menu-content-transform-origin]",
        "border-gray-200 dark:border-gray-800",
        "will-change-transform",
        className
      )}
      {...props}
    />
  );
});
ContextMenuSubContent.displayName = "ContextMenuPrimitive.SubContent.displayName";

const ContextMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-h-[--radix-context-menu-content-available-height]",
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
          "origin-[--radix-context-menu-content-transform-origin]",
          "border-gray-200 dark:border-gray-800",
          "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
          "scrollbar-track-transparent",
          "will-change-transform",
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
});
ContextMenuContent.displayName = "ContextMenuPrimitive.Content.displayName";

const ContextMenuItem = React.forwardRef(({
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
    <ContextMenuPrimitive.Item
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
        <kbd className="ml-auto text-xs tracking-widest text-gray-500 dark:text-gray-400">
          {shortcut}
        </kbd>
      )}
    </ContextMenuPrimitive.Item>
  );
});
ContextMenuItem.displayName = "ContextMenuPrimitive.Item.displayName";

const ContextMenuCheckboxItem = React.forwardRef(({
  className,
  children,
  checked,
  disabled,
  onCheckedChange,
  indeterminate,
  ...props
}, ref) => {
  return (
    <ContextMenuPrimitive.CheckboxItem
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
        <ContextMenuPrimitive.ItemIndicator>
          {indeterminate ? (
            <Minus className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          )}
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
});
ContextMenuCheckboxItem.displayName = "ContextMenuPrimitive.CheckboxItem.displayName";

const ContextMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.RadioItem
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
        <ContextMenuPrimitive.ItemIndicator>
          <Circle className="h-4 w-4 fill-blue-600 text-blue-600 dark:fill-blue-400 dark:text-blue-400" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
});
ContextMenuRadioItem.displayName = "ContextMenuPrimitive.RadioItem.displayName";

const ContextMenuLabel = React.forwardRef(({
  className,
  inset = false,
  ...props
}, ref) => {
  return (
    <ContextMenuPrimitive.Label
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
ContextMenuLabel.displayName = "ContextMenuPrimitive.Label.displayName";

const ContextMenuSeparator = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <ContextMenuPrimitive.Separator
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
ContextMenuSeparator.displayName = "ContextMenuPrimitive.Separator.displayName";

const ContextMenuShortcut = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <span
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
ContextMenuShortcut.displayName = "ContextMenuShortcut";

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
