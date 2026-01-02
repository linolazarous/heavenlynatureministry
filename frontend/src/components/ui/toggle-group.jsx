import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/toggle";

const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
  orientation: "horizontal",
});

const ToggleGroup = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  orientation = "horizontal",
  exclusive = true,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  children,
  ...props
}, ref) => {
  const [internalValue, setInternalValue] = React.useState<string[]>(
    defaultValue || value || []
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: string[]) => {
    setInternalValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      type={exclusive ? "single" : "multiple"}
      value={internalValue}
      onValueChange={handleValueChange}
      disabled={disabled}
      className={cn(
        "flex items-center",
        orientation === "horizontal" ? "flex-row gap-1" : "flex-col gap-1",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      orientation={orientation}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, orientation }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
});
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

const ToggleGroupItem = React.forwardRef(({
  className,
  children,
  variant,
  size,
  icon,
  iconPosition = "left",
  selected,
  disabled = false,
  ...props
}, ref) => {
  const context = React.useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: variant || context.variant,
          size: size || context.size,
        }),
        "relative",
        "data-[state=on]:bg-blue-600 data-[state=on]:text-white",
        "dark:data-[state=on]:bg-blue-500",
        "data-[state=on]:border-blue-600 dark:data-[state=on]:border-blue-500",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        "transition-all duration-200",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <span className="mr-2">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === "right" && (
        <span className="ml-2">{icon}</span>
      )}
    </ToggleGroupPrimitive.Item>
  );
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

// Enhanced ToggleGroup components
const ToggleGroupOption = React.forwardRef<
  typeof ToggleGroupItem,
  React.ComponentProps<typeof ToggleGroupItem> & {
    value: string;
    label: string;
    description?: string;
  }
>(({ className, value, label, description, children, ...props }, ref) => {
  return (
    <ToggleGroupItem
      ref={ref}
      value={value}
      className={cn("flex flex-col items-center justify-center p-4", className)}
      {...props}
    >
      {children || (
        <>
          <span className="text-sm font-medium">{label}</span>
          {description && (
            <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {description}
            </span>
          )}
        </>
      )}
    </ToggleGroupItem>
  );
});
ToggleGroupOption.displayName = "ToggleGroupOption";

const ToggleGroupSegment = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex rounded-lg border border-gray-300 dark:border-gray-700 p-1",
        className
      )}
      {...props}
    />
  )
);
ToggleGroupSegment.displayName = "ToggleGroupSegment";

export {
  ToggleGroup,
  ToggleGroupItem,
  ToggleGroupOption,
  ToggleGroupSegment,
  ToggleGroupContext,
};
