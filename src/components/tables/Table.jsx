import { Loader } from '../ui/Loader.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';

/**
 * Generic data table. `columns` is `[{ key, header, render?, className? }]`;
 * `render(row)` lets callers format a cell however they need without the
 * table itself knowing about domain-specific formatting.
 */
export function Table({ columns, data = [], keyExtractor, isLoading, emptyTitle = 'No records found', emptyDescription }) {
  if (isLoading) return <Loader label="Loading data…" />;

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-max text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="whitespace-nowrap px-4 py-3 font-medium text-slate-500">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row, rowIndex) => (
            <tr key={keyExtractor ? keyExtractor(row) : rowIndex} className="hover:bg-slate-50/70">
              {columns.map((column) => (
                <td key={column.key} className={`whitespace-nowrap px-4 py-3 text-slate-700 ${column.className || ''}`}>
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
