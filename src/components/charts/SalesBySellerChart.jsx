import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className='rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md'>
      <p className='font-medium text-slate-900'>{row.sellerName}</p>
      <p className='mt-1 text-slate-600'>
        Revenue: {formatCurrency(row.revenue)}
      </p>
      <p className='text-slate-600'>
        Units sold: {formatNumber(row.unitsSold)}
      </p>
    </div>
  );
}

export function SalesBySellerChart({ data = [] }) {
  const hasData = data.some((row) => row.revenue > 0 || row.unitsSold > 0);

  return (
    <section className='overflow-hidden  rounded-xl border border-slate-200 bg-white shadow-sm'>
      <div className='flex bg-black items-center gap-2 border-b border-slate-200 px-4 py-4 sm:px-5'>
        <BarChart3 className='size-5 shrink-0 text-slate-500 sm:size-6' />
        <div className='min-w-0'>
          <h3 className='text-sm font-semibold text-slate-100'>
            Sales by seller
          </h3>
          <p className='text-xs text-slate-200'>
            Total revenue recorded per seller
          </p>
        </div>
      </div>

      <div className='h-72 p-4 sm:h-80 sm:p-5'>
        {!data.length ? (
          <div className='flex h-full items-center justify-center text-sm text-slate-500'>
            No sellers found yet.
          </div>
        ) : !hasData ? (
          <div className='flex h-full items-center justify-center text-sm text-slate-500'>
            No sales recorded yet.
          </div>
        ) : (
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                stroke='#e2e8f0'
                vertical={false}
              />
              <XAxis
                dataKey='sellerName'
                tick={{ fontSize: 12, fill: '#64748b' }}
                interval={0}
                angle={-20}
                textAnchor='end'
                height={70}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(value) =>
                  value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
                }
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
              />
              <Bar
                dataKey='revenue'
                name='Revenue'
                fill='#000011'
                radius={[6, 6, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
