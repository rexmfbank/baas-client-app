"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type TableSkeletonProps = {
  columns: number;
  rows?: number;
  className?: string;
};

export function TableSkeleton({ columns, rows = 10, className }: TableSkeletonProps) {
  return (
    <div className={cn("w-full rounded-md border", className)}>
      <div
        className="grid border-b bg-muted/50"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div key={`table-skeleton-header-${index}`} className="px-4 py-3">
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`table-skeleton-row-${rowIndex}`}
            className="grid"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, columnIndex) => (
              <div
                key={`table-skeleton-cell-${rowIndex}-${columnIndex}`}
                className="px-4 py-3"
              >
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
