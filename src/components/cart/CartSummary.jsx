import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { useCart } from '@/features/cart/cartHooks.js';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';

/**
 * Order summary sidebar for the customer cart / product request flow.
 */
export function CartSummary({ onDownload, isDownloading = false }) {
  const { lineCount, itemCount, grandTotal } = useCart();

  return (
    <aside className='h-fit self-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-20'>
      <h2 className='text-sm font-semibold text-slate-900'>Cart Summary</h2>

      <dl className='mt-4 space-y-3 text-sm'>
        <div className='flex items-center justify-between gap-4'>
          <dt className='text-slate-600'>Products</dt>
          <dd className='font-medium text-slate-900'>
            {formatNumber(lineCount)}
          </dd>
        </div>
        <div className='flex items-center justify-between gap-4'>
          <dt className='text-slate-600'>Total Qty</dt>
          <dd className='font-medium text-slate-900'>
            {formatNumber(itemCount)}
          </dd>
        </div>
      </dl>

      <div className='mt-4 border-t border-slate-200 pt-4'>
        <div className='flex items-center justify-between gap-4'>
          <p className='text-sm font-medium text-slate-700'>Grand total</p>
          <p className='text-lg font-semibold text-slate-900'>
            {formatCurrency(grandTotal)}
          </p>
        </div>
      </div>

      <Button
        className='mt-5 w-full'
        icon={Download}
        onClick={onDownload}
        isLoading={isDownloading}
      >
        Download PDF
      </Button>

      <div className='mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
        This cart is for creating a <strong>product request</strong> only. No
        payment is collected and stock is not reserved. Download the PDF and
        share it with us via WhatsApp, email, or messenger.
      </div>
    </aside>
  );
}
