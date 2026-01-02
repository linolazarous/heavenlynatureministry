import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const Breadcrumb = React.forwardRef(({ 
  className, 
  separator = "/",
  ariaLabel = "Breadcrumb navigation",
  ...props 
}, ref) => {
  const ariaProps = {
    "aria-label": ariaLabel,
    role: "navigation",
  };

  return (
    <nav
      ref={ref}
      className={cn(
        "flex items-center",
        "text-sm text-gray-600 dark:text-gray-400",
        className
      )}
      {...ariaProps}
      {...props}
    />
  );
});
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 md:gap-2.5",
      "list-none m-0 p-0",
      "overflow-hidden",
      className
    )}
    itemScope
    itemType="https://schema.org/BreadcrumbList"
    {...props}
  />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef(({ 
  className, 
  position = 1,
  isCurrentPage = false,
  ...props 
}, ref) => {
  const itemProps = {
    itemScope: true,
    itemProp: "itemListElement",
    itemType: "https://schema.org/ListItem",
    ...(position && {
      "data-position": position,
    }),
  };

  return (
    <li
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 md:gap-2",
        "min-w-0",
        className
      )}
      {...itemProps}
      {...props}
    />
  );
});
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef(({ 
  asChild, 
  className, 
  href,
  itemProp = "item",
  ...props 
}, ref) => {
  const Comp = asChild ? Slot : "a";
  
  const linkProps = {
    itemProp,
    itemScope: true,
    itemType: "https://schema.org/Thing",
    ...(href && { href }),
  };

  return (
    <Comp
      ref={ref}
      className={cn(
        "transition-colors duration-200",
        "hover:text-gray-900 dark:hover:text-gray-100",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:rounded",
        "truncate",
        "inline-flex items-center",
        className
      )}
      {...linkProps}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef(({ 
  className, 
  itemProp = "item",
  children,
  ...props 
}, ref) => {
  const pageProps = {
    itemProp,
    itemScope: true,
    itemType: "https://schema.org/Thing",
    "aria-current": "page",
  };

  return (
    <span
      ref={ref}
      className={cn(
        "font-semibold text-gray-900 dark:text-gray-100",
        "truncate",
        className
      )}
      {...pageProps}
      {...props}
    >
      <span itemProp="name">{children}</span>
    </span>
  );
});
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = React.memo(({ 
  children, 
  className,
  hideOnMobile = false,
  ...props 
}) => {
  const separatorContent = children ?? <ChevronRight className="h-3.5 w-3.5" />;

  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex items-center text-gray-400 dark:text-gray-500",
        hideOnMobile && "hidden sm:inline-flex",
        "[&>svg]:w-3.5 [&>svg]:h-3.5",
        className
      )}
      {...props}
    >
      {separatorContent}
    </li>
  );
});
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = React.memo(({ 
  className,
  title = "More items",
  ...props 
}) => {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex h-8 w-8 items-center justify-center",
        "text-gray-500 dark:text-gray-400",
        className
      )}
      title={title}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">{title}</span>
    </span>
  );
});
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

// Compound component export
export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
