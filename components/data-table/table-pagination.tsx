"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type DataTablePaginationProps = {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  pageSizeOptions?: number[];
  onPageChange?: (pageNumber: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
};

function getVisiblePages(pageNumber: number, totalPages: number) {
  const pages: Array<number | "ellipsis"> = [];

  for (let page = 1; page <= totalPages; page += 1) {
    const isBoundary = page === 1 || page === totalPages;
    const isNearCurrent = page >= pageNumber - 1 && page <= pageNumber + 1;

    if (isBoundary || isNearCurrent) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return pages;
}

export function DataTablePagination({
  pageNumber,
  pageSize,
  totalItems,
  totalPages,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  className,
}: DataTablePaginationProps) {
  if (totalPages <= 0) return null;

  const start = totalItems === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const end = Math.min(pageNumber * pageSize, totalItems);
  const visiblePages = getVisiblePages(pageNumber, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="text-sm text-muted-foreground">
        Showing {start}-{end} of {totalItems}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {onPageSizeChange && (
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[92px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange?.(pageNumber - 1)}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {visiblePages.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`pagination-ellipsis-${index}`}
                className="px-2 text-sm text-muted-foreground"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={page === pageNumber ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
                onClick={() => onPageChange?.(page)}
              >
                {page}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange?.(pageNumber + 1)}
            disabled={pageNumber >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
