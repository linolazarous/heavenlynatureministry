import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

interface PaginationProps extends React.ComponentProps<"nav"> {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showBoundaries?: boolean;
  siblingCount?: number;
  disabled?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(({
  className,
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  showFirstLast = true,
  showBoundaries = true,
  siblingCount = 1,
  disabled = false,
  size = "default",
  variant = "outline",
  ...props
}, ref) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pageNumbers = [];
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    if (showBoundaries) {
      pageNumbers.push(1);
      if (leftSiblingIndex > 2) {
        pageNumbers.push("ellipsis-left");
      }
    }

    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i > 0 && i <= totalPages) {
        pageNumbers.push(i);
      }
    }

    if (showBoundaries) {
      if (rightSiblingIndex < totalPages - 1) {
        pageNumbers.push("ellipsis-right");
      }
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers;
  };

  const pageNumbers = generatePageNumbers();

  const handlePageChange = (page: number) => {
    if (!disabled && page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const buttonSize = {
    sm: "sm",
    default: "default",
    lg: "lg",
  }[size];

  return (
    <nav
      ref={ref}
      role="navigation"
      aria-label="Pagination"
      className={cn(
        "mx-auto flex w-full items-center justify-center",
        "space-x-1 sm:space-x-2",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      {showFirstLast && (
        <PaginationItem>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            disabled={disabled || currentPage === 1}
            size={buttonSize}
            variant={variant}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-2">First</span>
          </PaginationLink>
        </PaginationItem>
      )}

      <PaginationItem>
        <PaginationLink
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          size={buttonSize}
          variant={variant}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:ml-2">Previous</span>
        </PaginationLink>
      </PaginationItem>

      <div className="flex items-center space-x-1">
        {pageNumbers.map((page, index) => {
          if (page === "ellipsis-left" || page === "ellipsis-right") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => handlePageChange(page as number)}
                isActive={currentPage === page}
                disabled={disabled}
                size={buttonSize}
                variant={variant}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}
      </div>

      <PaginationItem>
        <PaginationLink
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          size={buttonSize}
          variant={variant}
          aria-label="Go to next page"
        >
          <span className="sr-only sm:not-sr-only sm:mr-2">Next</span>
          <ChevronRight className="h-4 w-4" />
        </PaginationLink>
      </PaginationItem>

      {showFirstLast && (
        <PaginationItem>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            disabled={disabled || currentPage === totalPages}
            size={buttonSize}
            variant={variant}
            aria-label="Go to last page"
          >
            <span className="sr-only sm:not-sr-only sm:mr-2">Last</span>
            <ChevronsRight className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      )}

      {totalItems > 0 && (
        <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium">
            {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>
          <span className="mx-1">of</span>
          <span className="font-medium">{totalItems}</span>
        </div>
      )}
    </nav>
  );
});
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul
      ref={ref}
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  )
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
  )
);
PaginationItem.displayName = "PaginationItem";

const PaginationLink = React.forwardRef<HTMLAnchorElement, {
  isActive?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
} & React.ComponentProps<"a">>(
  ({ className, isActive, size = "default", variant = "outline", ...props }, ref) => {
    return (
      <a
        ref={ref}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          buttonVariants({ variant: isActive ? "default" : variant, size }),
          "min-w-[2.5rem]",
          isActive && [
            "bg-blue-600 text-white",
            "hover:bg-blue-700 hover:text-white",
            "dark:bg-blue-500 dark:hover:bg-blue-600",
          ],
          "transition-all duration-200",
          className
        )}
        {...props}
      />
    );
  }
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = React.forwardRef<
  typeof PaginationLink,
  React.ComponentProps<typeof PaginationLink>
>(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 px-3 sm:px-4", className)}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span className="hidden sm:inline">Previous</span>
  </PaginationLink>
));
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = React.forwardRef<
  typeof PaginationLink,
  React.ComponentProps<typeof PaginationLink>
>(({ className, ...props }, ref) => (
  <PaginationLink
    ref={ref}
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 px-3 sm:px-4", className)}
    {...props}
  >
    <span className="hidden sm:inline">Next</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
));
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(
        "flex h-9 w-9 items-center justify-center",
        "text-gray-500 dark:text-gray-400",
        className
      )}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
