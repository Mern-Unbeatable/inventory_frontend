import { Boxes, Package } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { StatCard } from '@/components/cards/StatCard.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';
import { resolveMediaUrl } from '@/utils/media/url.js';

/**
 * CUSTOMER dashboard view — extracted from DashboardPage for maintainability.
 * UI and data shape unchanged.
 */
export function CustomerDashboard({ data, totals }) {
  const productColumns = [
    {
      key: 'image',
      header: '',
      className: 'w-14',
      render: (row) => {
        const src = resolveMediaUrl(row.imageUrl);
        return src ? (
          <img
            src={src}
            alt=''
            className='size-9 rounded-lg object-cover ring-1 ring-slate-200'
          />
        ) : (
          <div className='flex size-9 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400'>
            —
          </div>
        );
      },
    },
    { key: 'title', header: 'Product', render: (row) => row.title },
    { key: 'sku', header: 'SKU', render: (row) => row.sku || '—' },
    {
      key: 'price',
      header: 'Price',
      render: (row) => formatCurrency(row.price),
    },
    {
      key: 'availableQuantity',
      header: 'Available',
      render: (row) => formatNumber(row.availableQuantity),
    },
  ];

  return (
    <div>
      <PageHeader
        title='Dashboard'
        description='Browse available products, stock, and prices'
      />

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4'>
        <StatCard
          title='Available products'
          value={formatNumber(totals.availableProducts)}
          icon={Package}
        />
        <StatCard
          title='Total stock across catalog'
          value={formatNumber(totals.totalStockAcrossCatalog)}
          icon={Boxes}
          tone='slate'
        />
      </div>

      <section className='mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
        <div className='border-b border-slate-200 px-4 py-4 sm:px-5'>
          <h3 className='text-sm font-semibold text-slate-900'>
            Catalog snapshot
          </h3>
          <p className='text-xs text-slate-500'>
            Latest products and their available quantity
          </p>
        </div>
        <div className='overflow-x-auto p-3 sm:p-4'>
          <Table
            columns={productColumns}
            data={data?.products || []}
            keyExtractor={(row) => row.id}
            emptyTitle='No products yet'
            emptyDescription='Products will appear here once added to the catalog.'
          />
        </div>
      </section>
    </div>
  );
}
