import { useEffect } from 'react';
import {
  AlertTriangle,
  Boxes,
  Building2,
  DollarSign,
  Globe2,
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
import { useAuth } from '@/features/auth/authHooks.js';
import { useDashboard } from '@/features/dashboard/dashboardHooks.js';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';
import { formatDateTime } from '@/utils/format/date.js';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
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
    ...(isAdmin
      ? [
          {
            key: 'seller',
            header: 'Seller',
            render: (row) => row.user?.name || '—',
          },
        ]
      : []),
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

  if (isAdmin) {
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

        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
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
        </div>

        <div className='mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
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
        </div>

        <div className='mt-6 grid gap-6 xl:grid-cols-2'>
          <section className='rounded-xl border border-slate-200 bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-5 py-4'>
              <h3 className='text-sm font-semibold text-slate-900'>
                Stock & revenue by country
              </h3>
              <p className='text-xs text-slate-500'>
                Revenue updates when sellers record sales
              </p>
            </div>
            <div className='p-4'>
              <Table
                columns={countryColumns}
                data={data?.countryBreakdown || []}
                keyExtractor={(row) => row.id}
                emptyTitle='No countries yet'
                emptyDescription='Create a country to start assigning branches and stock.'
              />
            </div>
          </section>

          <section className='rounded-xl border border-slate-200 bg-white shadow-sm'>
            <div className='flex items-center gap-2 border-b border-slate-200 px-5 py-4'>
              <ShoppingCart className='size-6 text-slate-500' />
              <div>
                <h3 className='text-sm font-semibold text-slate-900'>
                  Recent sales
                </h3>
                <p className='text-xs text-slate-500'>
                  Latest seller stock deductions
                </p>
              </div>
            </div>
            <div className='p-4'>
              <Table
                columns={saleColumns}
                data={data?.recentSales || []}
                keyExtractor={(row) => row.id}
                emptyTitle='No sales yet'
                emptyDescription='Revenue appears here after sellers record sales.'
              />
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title='Dashboard'
        description='Your sales and assigned inventory summary'
      />

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          title='Assigned products'
          value={formatNumber(totals.assignedProducts)}
          icon={Package}
        />
        <StatCard
          title='Remaining stock'
          value={formatNumber(totals.totalStockQuantity)}
          icon={Boxes}
          tone='slate'
        />
        <StatCard
          title='Total Sales'
          value={formatCurrency(totals.revenue)}
          icon={DollarSign}
          tone='green'
          hint={`${formatNumber(totals.unitsSold)} units sold`}
        />
        <StatCard
          title='Low stock items'
          value={formatNumber(totals.lowStockProducts)}
          icon={AlertTriangle}
          tone='amber'
        />
      </div>

      <section className='mt-6 rounded-xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex items-center gap-2 border-b border-slate-200 px-5 py-4'>
          <ShoppingCart className='size-6 text-slate-800' />
          <div>
            <h3 className='text-sm font-semibold text-slate-900'>
              My recent sales
            </h3>
            <p className='text-xs text-slate-500'>
              Revenue from your recorded sales
            </p>
          </div>
        </div>
        <div className='p-4'>
          <Table
            columns={saleColumns}
            data={data?.recentSales || []}
            keyExtractor={(row) => row.id}
            emptyTitle='No sales yet'
            emptyDescription='Record a sale from Inventory or Products to build revenue.'
          />
        </div>
      </section>
    </div>
  );
}
