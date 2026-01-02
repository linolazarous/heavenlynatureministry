import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import {
  Search,
  Command as CommandIcon,
  ChevronRight,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const Command = React.forwardRef(({
  className,
  size = "default",
  variant = "default",
  loading = false,
  filter,
  loop = true,
  shouldFilter = true,
  value,
  onValueChange,
  ...props
}, ref) => {
  const inputRef = React.useRef(null);
  const listRef = React.useRef(null);
  const [isOpen, setIsOpen] = React.useState(false);

  const sizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  const variantClasses = {
    default: "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
    ghost: "bg-transparent border-transparent",
    outline: "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700",
  };

  return (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-lg",
        "border shadow-sm",
        "transition-all duration-200",
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.default,
        className
      )}
      loop={loop}
      shouldFilter={shouldFilter}
      filter={filter}
      value={value}
      onValueChange={onValueChange}
      {...props}
    />
  );
});
Command.displayName = "Command";

const CommandDialog = React.forwardRef(({
  children,
  open,
  onOpenChange,
  size = "lg",
  overlayClassName,
  contentClassName,
  ...props
}, ref) => {
  const dialogSize = {
    sm: "max-w-sm",
    default: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full mx-4",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} {...props}>
      <DialogContent
        ref={ref}
        className={cn(
          "overflow-hidden p-0",
          dialogSize[size] || dialogSize.lg,
          contentClassName
        )}
        overlayClassName={cn(
          "bg-black/60 backdrop-blur-sm",
          overlayClassName
        )}
      >
        <Command
          className={cn(
            "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2",
            "[&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-gray-700 dark:[&_[cmdk-group-heading]]:text-gray-300",
            "[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0",
            "[&_[cmdk-group]]:px-2",
            "[&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4",
            "[&_[cmdk-input]]:h-12",
            "[&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-2.5",
            "[&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4"
          )}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
});
CommandDialog.displayName = "CommandDialog";

const CommandInput = React.forwardRef(({
  className,
  placeholder = "Search...",
  loading = false,
  clearable = true,
  onClear,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  ...props
}, ref) => {
  const [value, setValue] = React.useState("");
  const inputRef = React.useRef(null);

  const handleClear = () => {
    setValue("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      {LeftIcon ? (
        <LeftIcon className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
      ) : loading ? (
        <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin text-gray-400" />
      ) : (
        <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
      )}
      <CommandPrimitive.Input
        ref={(node) => {
          inputRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none",
          "placeholder:text-gray-500 dark:placeholder:text-gray-400",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "autofill:bg-transparent",
          className
        )}
        placeholder={placeholder}
        {...props}
      />
      {clearable && value && (
        <button
          type="button"
          onClick={handleClear}
          className="ml-2 rounded p-0.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5 text-gray-400" />
        </button>
      )}
      {RightIcon && !value && (
        <RightIcon className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
      )}
    </div>
  );
});
CommandInput.displayName = "CommandPrimitive.Input.displayName";

const CommandList = React.forwardRef(({
  className,
  maxHeight = "300px",
  virtual = false,
  ...props
}, ref) => {
  return (
    <CommandPrimitive.List
      ref={ref}
      className={cn(
        "max-h-[300px] overflow-y-auto overflow-x-hidden",
        "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
        "scrollbar-track-transparent",
        className
      )}
      style={{ maxHeight }}
      {...props}
    />
  );
});
CommandList.displayName = "CommandPrimitive.List.displayName";

const CommandEmpty = React.forwardRef(({
  className,
  children = "No results found.",
  icon,
  ...props
}, ref) => {
  return (
    <CommandPrimitive.Empty
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center",
        className
      )}
      {...props}
    >
      {icon || <CommandIcon className="mb-2 h-8 w-8 text-gray-400" />}
      <p className="text-sm text-gray-500 dark:text-gray-400">{children}</p>
    </CommandPrimitive.Empty>
  );
});
CommandEmpty.displayName = "CommandPrimitive.Empty.displayName";

const CommandGroup = React.forwardRef(({
  className,
  heading,
  headingClassName,
  children,
  ...props
}, ref) => {
  return (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        "overflow-hidden p-1 text-gray-900 dark:text-gray-100",
        "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5",
        "[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold",
        "[&_[cmdk-group-heading]]:text-gray-700 dark:[&_[cmdk-group-heading]]:text-gray-300",
        "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider",
        className
      )}
      {...props}
    >
      {heading && (
        <CommandPrimitive.GroupHeading
          className={cn(
            "sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm",
            headingClassName
          )}
        >
          {heading}
        </CommandPrimitive.GroupHeading>
      )}
      {children}
    </CommandPrimitive.Group>
  );
});
CommandGroup.displayName = "CommandPrimitive.Group.displayName";

const CommandSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn(
      "-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700",
      "shrink-0",
      className
    )}
    {...props}
  />
));
CommandSeparator.displayName = "CommandPrimitive.Separator.displayName";

const CommandItem = React.forwardRef(({
  className,
  children,
  selected,
  disabled,
  onSelect,
  value,
  icon,
  shortcut,
  showCheck = true,
  ...props
}, ref) => {
  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center gap-2",
        "rounded-md px-2 py-1.5 text-sm",
        "outline-none",
        "data-[selected=true]:bg-gray-100 data-[selected=true]:text-gray-900",
        "dark:data-[selected=true]:bg-gray-800 dark:data-[selected=true]:text-gray-100",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        "transition-colors duration-150",
        className
      )}
      onSelect={onSelect}
      value={value}
      disabled={disabled}
      data-selected={selected}
      {...props}
    >
      {showCheck && (
        <div className="flex h-4 w-4 items-center justify-center">
          <Check
            className={cn(
              "h-3 w-3",
              "text-blue-600 dark:text-blue-400",
              "opacity-0 transition-opacity",
              "data-[selected=true]:opacity-100"
            )}
            data-selected={selected}
          />
        </div>
      )}
      {icon && <span className="text-gray-500 dark:text-gray-400">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
      {shortcut && (
        <kbd
          className={cn(
            "ml-auto text-xs tracking-widest text-gray-500 dark:text-gray-400",
            "font-mono"
          )}
        >
          {shortcut}
        </kbd>
      )}
    </CommandPrimitive.Item>
  );
});
CommandItem.displayName = "CommandPrimitive.Item.displayName";

const CommandShortcut = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <kbd
      ref={ref}
      className={cn(
        "ml-auto text-xs tracking-widest text-gray-500 dark:text-gray-400",
        "font-mono bg-gray-100 dark:bg-gray-800",
        "px-1.5 py-0.5 rounded",
        className
      )}
      {...props}
    />
  );
});
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
