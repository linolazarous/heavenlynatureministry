import * as React from "react";
import { GripVertical, GripHorizontal } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";

const ResizablePanelGroup = React.forwardRef(({
  className,
  direction = "horizontal",
  autoSaveId,
  ...props
}, ref) => {
  return (
    <ResizablePrimitive.PanelGroup
      ref={ref}
      className={cn(
        "flex h-full w-full",
        direction === "vertical" ? "flex-col" : "flex-row",
        "data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      direction={direction}
      autoSaveId={autoSaveId}
      {...props}
    />
  );
});
ResizablePanelGroup.displayName = "ResizablePrimitive.PanelGroup.displayName";

const ResizablePanel = ResizablePrimitive.Panel;

const ResizableHandle = React.forwardRef(({
  className,
  withHandle = true,
  handleIcon: HandleIcon,
  direction = "horizontal",
  disabled = false,
  ...props
}, ref) => {
  const defaultIcon = direction === "vertical" ? GripHorizontal : GripVertical;

  return (
    <ResizablePrimitive.PanelResizeHandle
      ref={ref}
      disabled={disabled}
      className={cn(
        "relative flex items-center justify-center",
        "bg-gray-100 dark:bg-gray-800",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500",
        "transition-colors duration-150",
        "hover:bg-gray-200 dark:hover:bg-gray-700",
        disabled && "cursor-not-allowed opacity-50",
        direction === "horizontal"
          ? "w-1.5 min-w-1.5"
          : "h-1.5 min-h-1.5",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div
          className={cn(
            "z-10 flex items-center justify-center rounded-sm",
            "bg-gray-300 dark:bg-gray-600",
            "hover:bg-gray-400 dark:hover:bg-gray-500",
            direction === "horizontal"
              ? "h-8 w-2"
              : "h-2 w-8"
          )}
        >
          {HandleIcon ? (
            <HandleIcon className="h-2.5 w-2.5" />
          ) : (
            <defaultIcon className="h-2.5 w-2.5 text-gray-600 dark:text-gray-400" />
          )}
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
});
ResizableHandle.displayName = "ResizablePrimitive.PanelResizeHandle.displayName";

// Compound components for better DX
const ResizableContext = React.createContext<{
  direction: "horizontal" | "vertical";
}>({ direction: "horizontal" });

const ResizableRoot = React.forwardRef<
  typeof ResizablePanelGroup,
  React.ComponentProps<typeof ResizablePanelGroup>
>(({ direction = "horizontal", className, children, ...props }, ref) => {
  return (
    <ResizableContext.Provider value={{ direction }}>
      <ResizablePanelGroup
        ref={ref}
        direction={direction}
        className={cn("border border-gray-200 dark:border-gray-800 rounded-lg", className)}
        {...props}
      >
        {children}
      </ResizablePanelGroup>
    </ResizableContext.Provider>
  );
});
ResizableRoot.displayName = "ResizableRoot";

const ResizableSection = React.forwardRef<
  typeof ResizablePanel,
  React.ComponentProps<typeof ResizablePanel> & {
    minSize?: number;
    defaultSize?: number;
    collapsible?: boolean;
  }
>(({ className, minSize = 10, defaultSize, collapsible = false, children, ...props }, ref) => {
  return (
    <ResizablePanel
      ref={ref}
      minSize={minSize}
      defaultSize={defaultSize}
      collapsible={collapsible}
      className={cn(
        "flex flex-col overflow-hidden",
        "data-[collapsed=true]:overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </ResizablePanel>
  );
});
ResizableSection.displayName = "ResizableSection";

export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  ResizableRoot,
  ResizableSection,
};
