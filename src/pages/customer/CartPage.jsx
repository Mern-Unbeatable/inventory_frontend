import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Download, Package, ShoppingCart, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/forms/Input.jsx';
import { EmptyState } from '@/components/ui/EmptyState.jsx';
import { useCart } from '@/features/cart/cartHooks.js';
import { useAuth } from '@/features/auth/authHooks.js';
import { useProductRequest } from '@/features/product-request/productRequestHooks.js';
import { productsService } from '@/features/products/productsService.js';
import { formatCurrency } from '@/utils/format/currency.js';
import { resolveMediaUrl } from '@/utils/media/url.js';

export default function CartPage() {
  const { isCustomer } = useAuth();
  const {
    lineTotals,
    grandTotal,
    isEmpty,
    updateQuantity,
    removeItem,
    refreshStock,
  } = useCart();
  const { isDownloading, downloadProductRequestPdf } = useProductRequest();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { items } = await productsService.list({ page: 1, limit: 100 });
        if (!cancelled) refreshStock(items);
      } catch {
        // Stock sync is best-effort; PDF generation re-validates server-side.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshStock]);

  if (!isCustomer) {
    return <Navigate to='/products' replace />;
  }

  const handleDownload = async () => {
    await downloadProductRequestPdf(lineTotals);
  };

  if (isEmpty) {
    return (
      <div>
        <PageHeader
          title='Cart'
          description='Build a product request list to share with our team'
        />
        <EmptyState
          icon={ShoppingCart}
          title='Your cart is empty'
          description='Browse products and add items to create a product request PDF.'
          action={
            <Link to='/products'>
              <Button>Browse products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title='Cart'
        description='Review your product request — not a purchase or payment'
      />

      <div className='mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900'>
        This cart is for creating a <strong>product request</strong> only. No
        payment is collected and stock is not reserved. Download the PDF and
        share it with us via WhatsApp, email, or messenger.
      </div>

      <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
        <div className='hidden overflow-x-auto md:block'>
          <table className='w-full min-w-[48rem] border-collapse text-left text-sm'>
            <thead className='bg-slate-900 text-slate-100'>
              <tr>
                <th className='px-4 py-3 font-medium'>Product</th>
                <th className='px-4 py-3 font-medium'>SKU</th>
                <th className='px-4 py-3 font-medium'>Unit price</th>
                <th className='px-4 py-3 font-medium'>Qty</th>
                <th className='px-4 py-3 font-medium'>Line total</th>
                <th className='px-4 py-3 font-medium' />
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {lineTotals.map((item) => (
                <tr key={item.productId} className='hover:bg-slate-50/70'>
                  <td className='px-4 py-3'>
                    <div className='flex min-w-0 items-center gap-3'>
                      {resolveMediaUrl(item.imageUrl) ? (
                        <img
                          src={resolveMediaUrl(item.imageUrl)}
                          alt=''
                          className='size-10 shrink-0 rounded-lg object-cover ring-1 ring-slate-200'
                        />
                      ) : (
                        <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400'>
                          <Package className='size-4' />
                        </div>
                      )}
                      <span className='truncate font-medium text-slate-900'>
                        {item.title}
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-3 text-slate-600'>
                    {item.sku || '—'}
                  </td>
                  <td className='px-4 py-3'>{formatCurrency(item.price)}</td>
                  <td className='px-4 py-3'>
                    <Input
                      id={`qty-${item.productId}`}
                      type='number'
                      min={1}
                      max={item.availableQuantity}
                      value={item.quantity}
                      containerClassName='w-20'
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        if (!Number.isFinite(next)) return;
                        updateQuantity(item.productId, next);
                      }}
                    />
                    <p className='mt-1 text-xs text-slate-500'>
                      Max {item.availableQuantity}
                    </p>
                  </td>
                  <td className='px-4 py-3 font-medium'>
                    {formatCurrency(item.lineTotal)}
                  </td>
                  <td className='px-4 py-3 text-right'>
                    <Button
                      variant='ghost'
                      size='sm'
                      icon={Trash2}
                      title='Remove'
                      onClick={() => removeItem(item.productId)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='divide-y divide-slate-100 md:hidden'>
          {lineTotals.map((item) => (
            <article key={item.productId} className='space-y-3 p-4'>
              <div className='flex gap-3'>
                {resolveMediaUrl(item.imageUrl) ? (
                  <img
                    src={resolveMediaUrl(item.imageUrl)}
                    alt=''
                    className='size-14 shrink-0 rounded-lg object-cover ring-1 ring-slate-200'
                  />
                ) : (
                  <div className='flex size-14 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400'>
                    <Package className='size-5' />
                  </div>
                )}
                <div className='min-w-0 flex-1'>
                  <h3 className='font-medium text-slate-900'>{item.title}</h3>
                  <p className='text-xs text-slate-500'>
                    SKU: {item.sku || '—'}
                  </p>
                  <p className='mt-1 text-sm text-slate-700'>
                    {formatCurrency(item.price)} each
                  </p>
                </div>
                <Button
                  variant='ghost'
                  size='sm'
                  icon={Trash2}
                  title='Remove'
                  onClick={() => removeItem(item.productId)}
                />
              </div>
              <div className='flex items-end justify-between gap-3'>
                <Input
                  id={`qty-mobile-${item.productId}`}
                  label='Quantity'
                  type='number'
                  min={1}
                  max={item.availableQuantity}
                  value={item.quantity}
                  containerClassName='w-24'
                  onChange={(event) => {
                    const next = Number(event.target.value);
                    if (!Number.isFinite(next)) return;
                    updateQuantity(item.productId, next);
                  }}
                />
                <p className='text-sm font-semibold text-slate-900'>
                  {formatCurrency(item.lineTotal)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className='flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
          <p className='text-sm text-slate-600'>
            {lineTotals.length} product{lineTotals.length === 1 ? '' : 's'} in
            request
          </p>
          <div className='flex flex-col items-stretch gap-3 sm:flex-row sm:items-center'>
            <p className='text-lg font-semibold text-slate-900'>
              Grand total: {formatCurrency(grandTotal)}
            </p>
            <Button
              icon={Download}
              onClick={handleDownload}
              isLoading={isDownloading}
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
