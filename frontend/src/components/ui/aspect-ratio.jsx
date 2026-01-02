import * as React from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

import { cn } from "@/lib/utils";

const AspectRatio = React.forwardRef(({ className, ratio = 16 / 9, style, ...props }, ref) => {
  // Validate ratio to prevent division by zero
  const safeRatio = ratio && !isNaN(ratio) && ratio > 0 ? ratio : 16 / 9;
  
  return (
    <AspectRatioPrimitive.Root
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden",
        "bg-gray-100 dark:bg-gray-800",
        className
      )}
      ratio={safeRatio}
      style={{
        '--aspect-ratio': safeRatio,
        ...style,
      }}
      {...props}
    />
  );
});
AspectRatio.displayName = "AspectRatio";

// Helper function to maintain backward compatibility
export { AspectRatio };
