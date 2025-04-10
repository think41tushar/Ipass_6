import React from "react"
import { cn } from "@/lib/utils"

export const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(({ className, children, ...props }, ref) => (
  <div className={cn("w-full overflow-x-auto border-2 border-[#353232] rounded-[10px] h-[15rem]", className)}>
    <table
      ref={ref}
      className={cn("min-w-full divide-y divide-gray-200", className)}
      {...props}
    >
      {children}
    </table>
  </div>
))
Table.displayName = "Table"

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-[#0f1219]", className)} {...props}>
    {children}
  </thead>
))
TableHeader.displayName = "TableHeader"

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
  <tbody ref={ref} className={cn("bg-[#0f1219] divide-y divide-gray-200", className)} {...props}>
    {children}
  </tbody>
))
TableBody.displayName = "TableBody"

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, children, ...props }, ref) => (
  <tr ref={ref} className={cn("", className)} {...props}>
    {children}
  </tr>
))
TableRow.displayName = "TableRow"

export const TableHead = React.forwardRef<
  HTMLTableHeaderCellElement,
  React.ThHTMLAttributes<HTMLTableHeaderCellElement>
>(({ className, children, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
      className
    )}
    {...props}
  >
    {children}
  </th>
))
TableHead.displayName = "TableHead"

export const TableCell = React.forwardRef<
  HTMLTableDataCellElement,
  React.TdHTMLAttributes<HTMLTableDataCellElement>
>(({ className, children, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("px-6 py-4 whitespace-nowrap text-sm text-gray-900", className)}
    {...props}
  >
    {children}
  </td>
))
TableCell.displayName = "TableCell"
