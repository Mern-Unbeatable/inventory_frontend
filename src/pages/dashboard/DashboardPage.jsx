import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { Loader } from '@/components/ui/Loader.jsx';
import { useAuth } from '@/features/auth/authHooks.js';
import { useDashboard } from '@/features/dashboard/dashboardHooks.js';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';
import { formatDateTime } from '@/utils/format/date.js';
import { AdminDashboard } from './AdminDashboard.jsx';
import { SellerDashboard } from './SellerDashboard.jsx';
import { CustomerDashboard } from './CustomerDashboard.jsx';

/**
 * Role-aware dashboard entry. Fetches overview once, then delegates to the
 * matching role view (Admin / Seller / Customer). Route stays `/dashboard`.
 */
export default function DashboardPage() {
  const { isAdmin, isCustomer } = useAuth();
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
    return (
      <AdminDashboard data={data} totals={totals} saleColumns={saleColumns} />
    );
  }

  if (isCustomer) {
    return <CustomerDashboard data={data} totals={totals} />;
  }

  return (
    <SellerDashboard data={data} totals={totals} saleColumns={saleColumns} />
  );
}
