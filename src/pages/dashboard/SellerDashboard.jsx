import {
  AlertTriangle,
  Boxes,
  DollarSign,
  FileText,
  Package,
  ShoppingCart,
  Warehouse,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { StatCard } from '@/components/cards/StatCard.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';

/**
 * SELLER dashboard view — extracted from DashboardPage for maintainability.
 * UI and data shape unchanged.
 */
export function SellerDashboard({ data, totals, saleColumns }) {
  return (
    <div>
      <PageHeader
        title='Dashboard'
        description='Your sales and assigned inventory summary'
      />

      <div className='grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4'>
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
        <StatCard
          title='Received units'
          value={formatNumber(totals.receivedUnits)}
          icon={Warehouse}
        />
        <StatCard
          title='Invoices'
          value={formatNumber(totals.invoiceCount)}
          icon={FileText}
        />
        <StatCard
          title='Pending payments'
          value={formatCurrency(totals.pendingInvoicesDue)}
          icon={DollarSign}
          tone='amber'
          hint='Due on your confirmed invoices'
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
        <div className='overflow-x-auto p-3 sm:p-4'>
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
