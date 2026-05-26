"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "./table-pagination";
import { TableSkeleton } from "./table-skeleton-loader";

export type DataTableFilterOption = {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
};

export type DataTablePaginationState = {
  totalItems?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
};

type DataTableProps<TData, TValue = unknown> = {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  searchPlaceholder?: string;
  showSearch?: boolean;
  filters?: DataTableFilterOption[];
  renderFilter?: React.ReactNode;
  className?: string;
  toolbarClassName?: string;
  tableClassName?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  selection?: boolean;
  isLoading?: boolean;
  skeletonRows?: number;
  isShowPagination?: boolean;
  pagination?: DataTablePaginationState;
  pageSizeOptions?: number[];
  onSearch?: (term: string) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  onPageChange?: (pageNumber: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
};

export function DataTable<TData, TValue = unknown>({
  data,
  columns,
  searchPlaceholder = "Search...",
  showSearch = true,
  filters = [],
  renderFilter,
  className,
  toolbarClassName,
  tableClassName,
  emptyTitle = "No records found",
  emptyDescription = "Try changing your search or filters.",
  selection = false,
  isLoading = false,
  skeletonRows = 10,
  isShowPagination = true,
  pagination,
  pageSizeOptions,
  onSearch,
  onFilterChange,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  // TanStack Table returns function-heavy instances that React Compiler intentionally skips.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: selection ? rowSelection : {},
    },
    enableRowSelection: selection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: selection ? setRowSelection : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const hasActiveFilters = Object.values(filterValues).some(
    (value) => value && value !== "all"
  );
  const hasSelection = Object.keys(rowSelection).length > 0;
  const showReset = Boolean(searchTerm.trim() || hasActiveFilters || hasSelection);
  const showToolbar = showSearch || renderFilter || filters.length > 0 || showReset;

  const handleSearch = (value: string) => {
    if (isLoading) return;
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    if (isLoading) return;
    const nextFilters = { ...filterValues, [key]: value };
    setFilterValues(nextFilters);
    onFilterChange?.(nextFilters);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilterValues({});
    setRowSelection({});
    onSearch?.("");
    onFilterChange?.({});
  };

  return (
    <div className={cn("w-full", className)}>
      {showToolbar && (
        <div
          className={cn(
            "mb-4 flex w-full flex-wrap items-center gap-2",
            toolbarClassName
          )}
        >
          {showSearch && (
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder={searchPlaceholder}
                disabled={isLoading}
                className="h-10 rounded-full pl-9"
              />
            </div>
          )}

          {renderFilter}

          {filters.map(({ key, label, options }) => (
            <Select
              key={key}
              value={filterValues[key] ?? ""}
              disabled={isLoading}
              onValueChange={(value) => handleFilterChange(key, value)}
            >
              <SelectTrigger className="h-10 min-w-[160px] rounded-full">
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}

          {showReset && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={handleReset}
            >
              <X className="mr-1 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TableSkeleton
              columns={columns.length || 1}
              rows={skeletonRows}
              className="border-0"
            />
          ) : (
            <div className={cn("overflow-x-auto", tableClassName)}>
              <Table>
                <TableHeader className="bg-muted/50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="text-xs font-medium">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() ? "selected" : undefined}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-40">
                        <Empty className="border-0">
                          <EmptyHeader>
                            <EmptyTitle>{emptyTitle}</EmptyTitle>
                            {emptyDescription && (
                              <EmptyDescription>{emptyDescription}</EmptyDescription>
                            )}
                          </EmptyHeader>
                          <EmptyContent />
                        </Empty>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {isShowPagination && (
        <DataTablePagination
          className="mt-4"
          pageNumber={pagination?.pageNumber ?? 1}
          pageSize={pagination?.pageSize ?? 10}
          totalItems={pagination?.totalItems ?? data.length}
          totalPages={pagination?.totalPages ?? 1}
          pageSizeOptions={pageSizeOptions}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}

export type { ColumnDef };
export { DataTablePagination, TableSkeleton };
