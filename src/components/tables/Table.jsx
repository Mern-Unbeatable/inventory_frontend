import { Loader } from '../ui/Loader.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';

/**
 * Generic data table. `columns` is `[{ key, header, render?, className?, sticky? }]`.
 * Horizontally scrollable on small screens via overflow-x-auto.
 */
export function Table({
  columns,
  data = [],
  keyExtractor,
  isLoading,
  emptyTitle = 'No records found',
  emptyDescription,
  minWidthClassName = 'min-w-[40rem]',
}) {
  if (isLoading) return <Loader label="Loading data…" />;

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="-mx-px overflow-x-auto overscroll-x-contain">
      <table className={`w-full ${minWidthClassName} text-left text-sm`}>
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`whitespace-nowrap px-3 py-2.5 font-medium text-slate-500 sm:px-4 sm:py-3 ${
                  column.sticky === 'right'
                    ? 'sticky right-0 z-10 bg-slate-50 shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.12)]'
                    : ''
                } ${column.headerClassName || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIndex) => (
            <tr
              key={keyExtractor ? keyExtractor(row) : rowIndex}
              className="group hover:bg-slate-50/70"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`whitespace-nowrap px-3 py-2.5 text-slate-700 sm:px-4 sm:py-3 ${
                    column.sticky === 'right'
                      ? 'sticky right-0 z-10 bg-white shadow-[-4px_0_8px_-4px_rgba(15,23,42,0.12)] group-hover:bg-slate-50'
                      : ''
                  } ${column.className || ''}`}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
