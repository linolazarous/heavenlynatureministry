import * as React from "react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  striped = false,
  hoverable = true,
  border = true,
  responsive = true,
  ...props
}, ref) => {
  const variantClasses = {
    default: "bg-white dark:bg-gray-900",
    ghost: "bg-transparent",
    outline: "bg-transparent",
  };

  const sizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  const TableComponent = (
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom",
        sizeClasses[size] || sizeClasses.default,
        variantClasses[variant] || variantClasses.default,
        border && "border border-gray-200 dark:border-gray-800",
        className
      )}
      {...props}
    />
  );

  if (responsive) {
    return (
      <div className="relative w-full overflow-auto rounded-lg">
        {TableComponent}
      </div>
    );
  }

  return TableComponent;
});
Table.displayName = "Table";

const TableHeader = React.forwardRef(({
  className,
  sticky = false,
  ...props
}, ref) => (
  <thead
    ref={ref}
    className={cn(
      "[&_tr]:border-b",
      "border-gray-200 dark:border-gray-800",
      sticky && [
        "sticky top-0 z-10",
        "bg-white/95 dark:bg-gray-900/95",
        "backdrop-blur supports-[backdrop-filter]:bg-white/60",
        "supports-[backdrop-filter]:dark:bg-gray-900/60",
      ],
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(({
  className,
  striped = false,
  hoverable = true,
  ...props
}, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0",
      striped && "[&_tr:nth-child(even)]:bg-gray-50 dark:[&_tr:nth-child(even)]:bg-gray-900/50",
      hoverable && "[&_tr:hover]:bg-gray-50 dark:[&_tr:hover]:bg-gray-800/50",
      className
    )}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef(({
  className,
  sticky = false,
  ...props
}, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-gray-50/50 dark:bg-gray-900/50",
      "font-medium [&>tr]:last:border-b-0",
      "border-gray-200 dark:border-gray-800",
      sticky && [
        "sticky bottom-0 z-10",
        "bg-white/95 dark:bg-gray-900/95",
        "backdrop-blur supports-[backdrop-filter]:bg-white/60",
        "supports-[backdrop-filter]:dark:bg-gray-900/60",
      ],
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef(({
  className,
  selected = false,
  clickable = false,
  onClick,
  ...props
}, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors",
      "border-gray-200 dark:border-gray-800",
      "hover:bg-gray-50 dark:hover:bg-gray-800/50",
      selected && "bg-blue-50/50 dark:bg-blue-900/20",
      clickable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
      className
    )}
    onClick={onClick}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef(({
  className,
  align = "left",
  sortable = false,
  sorted,
  onSort,
  ...props
}, ref) => {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 align-middle font-semibold",
        "text-gray-700 dark:text-gray-300",
        "bg-gray-50 dark:bg-gray-800",
        "[&:has([role=checkbox])]:pr-0",
        "[&>[role=checkbox]]:translate-y-[2px]",
        alignClasses[align] || alignClasses.left,
        sortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
        className
      )}
      onClick={sortable && onSort ? () => onSort() : undefined}
      {...props}
    >
      <div className="flex items-center gap-2">
        {props.children}
        {sortable && sorted && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {sorted === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );
});
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(({
  className,
  align = "left",
  variant = "default",
  ...props
}, ref) => {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  const variantClasses = {
    default: "text-gray-900 dark:text-gray-100",
    muted: "text-gray-600 dark:text-gray-400",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
    destructive: "text-red-600 dark:text-red-400",
  };

  return (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle",
        "[&:has([role=checkbox])]:pr-0",
        "[&>[role=checkbox]]:translate-y-[2px]",
        alignClasses[align] || alignClasses.left,
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    />
  );
});
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef(({
  className,
  position = "bottom",
  ...props
}, ref) => {
  const positionClasses = {
    top: "mb-4",
    bottom: "mt-4",
  };

  return (
    <caption
      ref={ref}
      className={cn(
        "text-sm text-gray-600 dark:text-gray-400",
        positionClasses[position] || positionClasses.bottom,
        className
      )}
      {...props}
    />
  );
});
TableCaption.displayName = "TableCaption";

// Enhanced Table components
const TableContainer = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden", className)}
      {...props}
    />
  )
);
TableContainer.displayName = "TableContainer";

const TableEmpty = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}>(
  ({ className, title = "No data", description, icon, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4",
        "text-center",
        className
      )}
      {...props}
    >
      {icon && <div className="mb-4 text-gray-400 dark:text-gray-500">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
          {description}
        </p>
      )}
      {children}
    </div>
  )
);
TableEmpty.displayName = "TableEmpty";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableContainer,
  TableEmpty,
};
