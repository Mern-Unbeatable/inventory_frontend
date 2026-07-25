import { useEffect } from 'react';
import {
  AlertTriangle,
  Boxes,
  Building2,
  DollarSign,
  FileText,
  Globe2,
  Package,
  ShoppingCart,
  TrendingUp,
  UsersRound,
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
      key: 'seller',
      header: 'Seller',
      render: (row) => row.user?.name || '—',
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

  const countryColumns = [
    { key: 'name', header: 'Country', render: (row) => row.name },
    { key: 'code', header: 'Code', render: (row) => row.code || '—' },
    {
      key: 'branches',
      header: 'Branches',
      render: (row) => formatNumber(row.branchCount),
    },
    {
      key: 'sellers',
      header: 'Sellers',
      render: (row) => formatNumber(row.sellerCount),
    },
    {
      key: 'stock',
      header: 'Stock qty',
      render: (row) => formatNumber(row.totalQuantity),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (row) => formatCurrency(row.revenue),
    },
  ];

  return (
    <div>
      <PageHeader
        title='Dashboard'
        description='Live overview across countries, branches, and sellers'
      />

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4 lg:grid-cols-5 xl:grid-cols-6 mb-6'>
        <StatCard
          title='Countries'
          value={formatNumber(totals.countries)}
          icon={Globe2}
        />
        <StatCard
          title='Branches'
          value={formatNumber(totals.branches)}
          icon={Building2}
          tone='slate'
        />
        <StatCard
          title='Sellers'
          value={formatNumber(totals.sellers)}
          icon={Users}
          tone='green'
        />
        <StatCard
          title='Products'
          value={formatNumber(totals.products)}
          icon={Package}
          tone='amber'
        />
        <StatCard
          title='Assignments'
          value={formatNumber(totals.assignments)}
          icon={Warehouse}
        />
        <StatCard
          title='Total stock qty'
          value={formatNumber(totals.totalStockQuantity)}
          icon={Boxes}
          tone='slate'
        />
        <StatCard
          title='Revenue'
          value={formatCurrency(totals.revenue)}
          icon={DollarSign}
          tone='green'
          hint={`${formatNumber(totals.unitsSold)} units sold`}
        />
        <StatCard
          title='Low stock rows'
          value={formatNumber(totals.lowStockAssignments)}
          icon={AlertTriangle}
          tone='amber'
          hint='Quantity ≤ 5'
        />
        <StatCard
          title='Customers'
          value={formatNumber(totals.customers)}
          icon={UsersRound}
          tone='primary'
        />
        <StatCard
          title='Invoices'
          value={formatNumber(totals.invoices)}
          icon={FileText}
        />
        <StatCard
          title='Outstanding due'
          value={formatCurrency(totals.outstandingDue)}
          icon={DollarSign}
          tone='amber'
          hint='Confirmed invoices'
        />
      </div>

      <PageHeader title='Regional Performance' />

      <div className='mt-6 grid gap-6 lg:grid-cols-2'>
        <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
          <div className='flex items-center gap-2 border-b bg-white  border-slate-600 px-4 py-4 sm:px-5'>
            <Globe2 className='size-5 shrink-0 text-slate-500 sm:size-6' />
            <div className='min-w-0'>
              <h3 className='text-sm font-semibold text-slate-800'>
                Stock & revenue by country
              </h3>
              <p className='text-xs text-slate-600'>
                Revenue updates when sellers record sales
              </p>
            </div>
          </div>

          <Table
            columns={countryColumns}
            data={data?.countryBreakdown || []}
            keyExtractor={(row) => row.id}
            emptyTitle='No countries yet'
            emptyDescription='Create a country to start assigning branches and stock.'
          />
        </section>

        <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
          <div className='flex items-center gap-2 border-b bg-white  border-slate-600 px-4 py-4 sm:px-5'>
            <TrendingUp className='size-5 shrink-0 text-slate-500 sm:size-6' />
            <div className='min-w-0'>
              <h3 className='text-sm font-semibold text-slate-800'>
                Top selling products
              </h3>
              <p className='text-xs text-slate-600'>
                Ranked by units sold across all sellers
              </p>
            </div>
          </div>

          <Table
            columns={[
              {
                key: 'title',
                header: 'Product',
                render: (row) => row.title,
              },
              {
                key: 'sku',
                header: 'SKU',
                render: (row) => row.sku || '—',
              },
              {
                key: 'unitsSold',
                header: 'Units sold',
                render: (row) => formatNumber(row.unitsSold),
              },
              {
                key: 'revenue',
                header: 'Revenue',
                render: (row) => formatCurrency(row.revenue),
              },
            ]}
            data={data?.topSellingProducts || []}
            keyExtractor={(row) => row.productId}
            emptyTitle='No sales yet'
            emptyDescription='Top products appear once sales are recorded.'
          />
        </section>

        <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2'>
          <div className='flex items-center gap-2 border-b bg-white  border-slate-600 px-4 py-4 sm:px-5'>
            <ShoppingCart className='size-5 shrink-0 text-slate-500 sm:size-6' />
            <div className='min-w-0'>
              <h3 className='text-sm font-semibold text-slate-800'>
                Recent sales
              </h3>
              <p className='text-xs text-slate-600'>
                Latest seller stock deductions
              </p>
            </div>
          </div>

          <Table
            columns={saleColumns}
            data={data?.recentSales || []}
            keyExtractor={(row) => row.id}
            emptyTitle='No sales yet'
            emptyDescription='Revenue appears here after sellers record sales.'
          />
        </section>
      </div>
    </div>
  );
}
