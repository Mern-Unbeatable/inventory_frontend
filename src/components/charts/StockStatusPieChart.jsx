import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatNumber } from '@/utils/format/currency.js';

const STATUS_COLORS = {
  available: '#000011',
  lowStock: '#d97706',
  outOfStock: '#dc2626',
};

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload;
  if (!row) return null;

  const total = row.total || 0;
  const percent = total > 0 ? ((row.count / total) * 100).toFixed(1) : '0.0';

  return (
    <div className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md'>
      <p className='font-medium text-slate-900'>{row.label}</p>
      <p className='mt-1 text-slate-600'>Products: {formatNumber(row.count)}</p>
      <p className='text-slate-600'>{percent}% of catalog</p>
    </div>
  );
}

export function StockStatusPieChart({ data = [] }) {
  const total = data.reduce((sum, row) => sum + (row.count ?? 0), 0);
  const chartData = data.map((row) => ({
    ...row,
    total,
    fill: STATUS_COLORS[row.status] ?? '#64748b',
  }));

  return (
    <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
      <div className='flex bg-black items-center gap-2 border-b border-slate-200 px-4 py-4 sm:px-5'>
        <PieChartIcon className='size-5 shrink-0 text-slate-500 sm:size-6' />
        <div className='min-w-0'>
          <h3 className='text-sm font-semibold text-slate-100'>
            Products by stock status
          </h3>
          <p className='text-xs text-slate-200'>
            Catalog-wide stock levels (low stock ≤ 5 units)
          </p>
        </div>
      </div>

      <div className='h-72 p-4 sm:h-80 sm:p-5'>
        {!total ? (
          <div className='flex h-full items-center justify-center text-sm text-slate-500'>
            No product inventory data yet.
          </div>
        ) : (
          <div className='flex h-full flex-col gap-4 lg:flex-row lg:items-center'>
            <div className='h-52 flex-1 lg:h-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey='count'
                    nameKey='label'
                    cx='50%'
                    cy='50%'
                    innerRadius='40%'
                    outerRadius='80%'
                    paddingAngle={2}
                  >
                    {chartData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={entry.fill}
                        stroke='#fff'
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className='grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-1 lg:gap-3'>
              {chartData.map((row) => {
                const percent =
                  total > 0 ? ((row.count / total) * 100).toFixed(1) : '0.0';
                return (
                  <li
                    key={row.status}
                    className='flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm'
                  >
                    <div className='flex min-w-0 items-center gap-2'>
                      <span
                        className='size-2.5 shrink-0 rounded-full'
                        style={{ backgroundColor: row.fill }}
                      />
                      <span className='truncate text-slate-700'>
                        {row.label}
                      </span>
                    </div>
                    <span className='shrink-0 font-medium text-slate-900'>
                      {formatNumber(row.count)} ({percent}%)
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
