import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn(
      "border-b last:border-b-0 border-gray-200 dark:border-gray-800",
      className
    )}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg px-3 text-left",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
          "data-[state=open]:text-blue-600 dark:data-[state=open]:text-blue-400",
          "text-gray-900 dark:text-gray-100",
          className
        )}
        aria-expanded={props["data-state"] === "open"}
        {...props}
      >
        <span className="flex-1 pr-2">{children}</span>
        {isMounted && (
          <ChevronDown
            className="h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400 transition-transform duration-300 ease-in-out"
            aria-hidden="true"
          />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden",
      "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
      "will-change-[height,opacity] motion-reduce:transition-none"
    )}
    style={{
      '--accordion-content-height': '0px',
    }}
    {...props}
  >
    <div className={cn(
      "pb-4 pt-0 px-3 text-gray-600 dark:text-gray-300 leading-relaxed",
      "transition-all duration-300 ease-in-out",
      className
    )}>
      {children}
    </div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
