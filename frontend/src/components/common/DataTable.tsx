import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  selectedId?: string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectedId,
  onRowClick,
  emptyMessage = 'NO RECORDS FOUND',
  className = '',
}: DataTableProps<T>) {
  return (
    <div className={`overflow-x-auto w-full border border-gray-200 bg-white select-none rounded-[2px] ${className}`}>
      <table className="w-full text-left border-collapse font-sans text-[12px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-charcoal-500 uppercase text-[10px] font-mono tracking-wider font-semibold">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`py-2 px-3 ${
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-charcoal-400 font-mono text-xs uppercase tracking-wider"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => {
              const rowId = keyExtractor(row, idx);
              const isSelected = selectedId === rowId;
              return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${
                    isSelected
                      ? 'bg-blue-50/90 border-l-2 border-l-blue-600 text-charcoal-900 font-medium'
                      : 'hover:bg-gray-50/80 text-charcoal-800'
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-2 px-3 whitespace-nowrap ${
                        col.align === 'center'
                          ? 'text-center'
                          : col.align === 'right'
                          ? 'text-right'
                          : 'text-left'
                      }`}
                    >
                      {col.render
                        ? col.render(row, idx)
                        : (row as Record<string, unknown>)[col.key] != null
                        ? String((row as Record<string, unknown>)[col.key])
                        : '--'}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
