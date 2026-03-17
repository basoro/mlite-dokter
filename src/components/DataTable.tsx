import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from './EmptyState';
import { TableSkeleton } from './LoadingSkeleton';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  emptyMessage,
  onRowClick,
}: DataTableProps<T> & { onRowClick?: (item: T) => void }) {
  if (isLoading) return <TableSkeleton rows={5} />;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {columns.map((col) => (
              <TableHead key={col.key} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <EmptyState title={emptyMessage || 'Tidak ada data'} />
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, idx) => (
              <TableRow 
                key={idx} 
                className={`hover:bg-muted/30 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((col) => (
                  <TableCell key={col.key} className="text-sm whitespace-nowrap">
                    {col.render ? col.render(item, idx) : (item[col.key] as React.ReactNode) ?? '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
