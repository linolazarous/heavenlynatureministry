import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
  [
    "inline-flex items-center justify-center rounded-lg",
    "text-sm font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=on]:bg-blue-600 data-[state=on]:text-white",
    "dark:data-[state=on]:bg-blue-500",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-white dark:bg-gray-900",
          "border border-gray-300 dark:border-gray-700",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "data-[state=on]:border-blue-600 dark:data-[state=on]:border-blue-500",
        ],
        outline: [
          "border border-gray-300 dark:border-gray-700",
          "bg-transparent",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "data-[state=on]:border-blue-600 dark:data-[state=on]:border-blue-500",
        ],
        ghost: [
          "bg-transparent",
          "border border-transparent",
          "hover:bg-gray-100 dark:hover:bg-gray-800",
          "data-[state=on]:bg-blue-600 dark:data-[state=on]:bg-blue-500",
        ],
        solid: [
          "bg-gray-200 dark:bg-gray-800",
          "border border-transparent",
          "hover:bg-gray-300 dark:hover:bg-gray-700",
          "data-[state=on]:bg-blue-600 dark:data-[state=on]:bg-blue-500",
        ],
      },
      size: {
        xs: "h-7 px-2 text-xs min-w-7",
        sm: "h-8 px-2.5 text-sm min-w-8",
        default: "h-9 px-3 text-sm min-w-9",
        lg: "h-10 px-4 text-base min-w-10",
        xl: "h-12 px-5 text-lg min-w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Toggle = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  pressed,
  defaultPressed = false,
  onPressedChange,
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  children,
  ...props
}, ref) => {
  const [isPressed, setIsPressed] = React.useState(defaultPressed || pressed || false);

  React.useEffect(() => {
    if (pressed !== undefined) {
      setIsPressed(pressed);
    }
  }, [pressed]);

  const handlePressedChange = (pressedState: boolean) => {
    setIsPressed(pressedState);
    onPressedChange?.(pressedState);
  };

  return (
    <TogglePrimitive.Root
      ref={ref}
      pressed={isPressed}
      onPressedChange={handlePressedChange}
      disabled={disabled || loading}
      className={cn(
        toggleVariants({ variant, size }),
        loading && "relative opacity-70",
        className
      )}
      data-state={isPressed ? "on" : "off"}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        </div>
      )}
      <div className={cn("flex items-center gap-2", loading && "opacity-0")}>
        {icon && iconPosition === "left" && <span>{icon}</span>}
        {children && <span>{children}</span>}
        {icon && iconPosition === "right" && <span>{icon}</span>}
      </div>
    </TogglePrimitive.Root>
  );
});
Toggle.displayName = TogglePrimitive.Root.displayName;

// Enhanced Toggle components
const ToggleButton = React.forwardRef<
  typeof Toggle,
  React.ComponentProps<typeof Toggle> & {
    label: string;
    description?: string;
    badge?: string | number;
  }
>(({ className, label, description, badge, children, ...props }, ref) => {
  return (
    <Toggle
      ref={ref}
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
          {badge && (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {badge}
            </span>
          )}
        </>
      )}
    </Toggle>
  );
});
ToggleButton.displayName = "ToggleButton";

const ToggleSwitch = React.forwardRef<
  typeof Toggle,
  React.ComponentProps<typeof Toggle>
>(({ className, children, ...props }, ref) => {
  return (
    <Toggle
      ref={ref}
      variant="solid"
      className={cn("relative w-12 px-0", className)}
      {...props}
    >
      <span className="sr-only">{children}</span>
      <div className="flex h-full w-full items-center justify-center">
        <div
          className={cn(
            "h-5 w-10 rounded-full transition-colors duration-200",
            "bg-gray-300 dark:bg-gray-700",
            "data-[state=on]:bg-blue-600 dark:data-[state=on]:bg-blue-500"
          )}
          data-state={props.pressed ? "on" : "off"}
        >
          <div
            className={cn(
              "h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
              "translate-x-0.5 translate-y-0.5",
              "data-[state=on]:translate-x-6"
            )}
            data-state={props.pressed ? "on" : "off"}
          />
        </div>
      </div>
    </Toggle>
  );
});
ToggleSwitch.displayName = "ToggleSwitch";

export { Toggle, toggleVariants, ToggleButton, ToggleSwitch };
