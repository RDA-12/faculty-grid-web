'use client'

import {
  tableFeatures,
  useTable,
  type RowData,
  type TableOptions,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'

export const defaultTableFeatures = tableFeatures({})
export type DefaultTableFeatures = typeof defaultTableFeatures

const DEFAULT_SMALL_COLUMN_IDS = ['number', 'actions']

type DataTableProps<TData extends RowData> = {
  columns: TableOptions<DefaultTableFeatures, TData>['columns']
  data: TData[]
  emptyMessage: string
  testId?: string
  smallColumnIds?: string[]
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  emptyMessage,
  testId,
  smallColumnIds = DEFAULT_SMALL_COLUMN_IDS,
}: DataTableProps<TData>) {
  const table = useTable({
    features: defaultTableFeatures,
    columns,
    data,
  })

  return (
    <div
      className="w-full flex-1 min-h-0 overflow-auto rounded-md border"
      data-testid={testId}
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const smallHeader = smallColumnIds.includes(header.id)

                return (
                  <TableHead
                    key={header.id}
                    className={smallHeader ? 'w-16 text-center' : undefined}
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => {
                  const smallCell = smallColumnIds.includes(cell.column.id)
                  return (
                    <TableCell
                      key={cell.id}
                      className={smallCell ? 'text-center' : undefined}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="min-h-24 h-full text-center"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
