import { useEffect } from 'react';

import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { Loader } from '@/components/ui/Loader.jsx';
import { useDashboard } from '@/features/dashboard/dashboardHooks.js';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';
import { resolveMediaUrl } from '@/utils/media/url.js';

export default function DashboardPage() {
  const { data, status, error, isLoading, loadDashboard } = useDashboard();

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (isLoading && !data) return <Loader label='Loading dashboard…' />;
  if (status === 'failed') {
    return (
      <ErrorState
        title='Could not load dashboard'
        description={error}
        onRetry={loadDashboard}
      />
    );
  }

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

      <section className='mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
        <div className='border-b border-slate-200 px-4 py-4 sm:px-5'>
          <h3 className='text-sm font-semibold text-slate-900'>
            Catalog snapshot
          </h3>
          <p className='text-xs text-slate-500'>
            Latest products and their available quantity
          </p>
        </div>

        <Table
          columns={productColumns}
          data={data?.products || []}
          keyExtractor={(row) => row.id}
          emptyTitle='No products yet'
          emptyDescription='Products will appear here once added to the catalog.'
        />
      </section>
    </div>
  );
}
