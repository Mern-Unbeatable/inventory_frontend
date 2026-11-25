import { useEffect } from 'react';
import {
  AlertTriangle,
  Boxes,
  DollarSign,
  FileText,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { StatCard } from '@/components/cards/StatCard.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { Loader } from '@/components/ui/Loader.jsx';
import { useDashboard } from '@/features/dashboard/dashboardHooks.js';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';
import { formatDateTime } from '@/utils/format/date.js';

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

  const totals = data?.totals || {};

  const saleColumns = [
    {
      key: 'product',
      header: 'Product',
      render: (row) => row.product?.title || '—',
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (row) => row.product?.sku || '—',
    },
    {
      key: 'quantity',
      header: 'Sold qty',
      render: (row) => formatNumber(row.quantity),
    },
    {
      key: 'unitPrice',
      header: 'Unit price',
      render: (row) => formatCurrency(row.unitPrice),
    },
    {
      key: 'revenue',
      header: 'Sales',
      render: (row) => formatCurrency(row.revenue),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  return (
    <div>
      <PageHeader
        title='Dashboard'
        description='Your sales and assigned inventory summary'
      />

      <div className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'>
        {/* Inventory */}
        <StatCard
          title='Assigned products'
          value={formatNumber(totals.assignedProducts)}
          icon={Package}
          tone='primary'
        />
        <StatCard
          title='Remaining stock'
          value={formatNumber(totals.totalStockQuantity)}
          icon={Boxes}
          tone='slate'
        />
        <StatCard
          title='Received units'
          value={formatNumber(totals.receivedUnits)}
          icon={Warehouse}
          tone='slate'
        />
        <StatCard
          title='Low stock'
          value={formatNumber(totals.lowStockProducts)}
          icon={AlertTriangle}
          tone='amber'
        />
        {/* Sales */}
        <StatCard
          title='Customers'
          value={formatNumber(totals.customerCount ?? 0)}
          icon={Users}
          tone='green'
        />
        <StatCard
          title='Invoices'
          value={formatNumber(totals.invoiceCount)}
          icon={FileText}
          tone='primary'
        />
        <StatCard
          title='Revenue'
          value={formatCurrency(totals.revenue, { decimals: false })}
          icon={DollarSign}
          tone='green'
          hint={`${formatNumber(totals.unitsSold)} units sold`}
        />
        <StatCard
          title='Outstanding due'
          value={formatCurrency(totals.pendingInvoicesDue, { decimals: false })}
          icon={DollarSign}
          tone='amber'
        />
      </div>

      <section className='mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex items-center gap-2 border-b border-slate-200 px-4 py-4 sm:px-5'>
          <ShoppingCart className='size-5 shrink-0 text-slate-800 sm:size-6' />
          <div className='min-w-0'>
            <h3 className='text-sm font-semibold text-slate-900'>
              My recent sales
            </h3>
            <p className='text-xs text-slate-500'>
              Revenue from your recorded sales
            </p>
          </div>
        </div>

        <Table
          columns={saleColumns}
          data={data?.recentSales || []}
          keyExtractor={(row) => row.id}
          emptyTitle='No sales yet'
          emptyDescription='Record a sale from Inventory or Products to build revenue.'
        />
      </section>
    </div>
  );
}
