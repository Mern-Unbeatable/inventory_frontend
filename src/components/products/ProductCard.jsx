import { Eye, Package, ShoppingCart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/Button.jsx';
import { StockStatusChip } from '@/components/ui/StatusChip.jsx';
import { selectCartItems } from '@/features/cart/cartSelectors.js';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';
import { resolveMediaUrl } from '@/utils/media/url.js';

/**
 * Read-only product card for the CUSTOMER catalog view.
 */
export function ProductCard({ product, onView, onAddToCart }) {
  const cartItems = useSelector(selectCartItems);
  const imageUrl = resolveMediaUrl(product?.imageUrl);
  const availableQuantity = product?.availableQuantity ?? 0;
  const isInCart = cartItems.some((item) => item.productId === product.id);
  const isOutOfStock = availableQuantity === 0;
  const isDisabled = isInCart || isOutOfStock;

  let addButtonLabel = 'Add to cart';
  if (isOutOfStock) addButtonLabel = 'Out of Stock';
  else if (isInCart) addButtonLabel = 'Added to Cart';

  return (
    <article className='group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md'>
      <div className='relative h-44 w-full overflow-hidden bg-slate-100'>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className='h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]'
            loading='lazy'
          />
        ) : (
          <div className='flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400'>
            <Package className='size-10' />
            <span className='text-xs font-medium'>No image</span>
          </div>
        )}
        <div className='absolute right-3 top-3'>
          <StockStatusChip remainingStock={availableQuantity} />
        </div>
      </div>

      <div className='flex flex-1 flex-col p-4'>
        <h3 className='line-clamp-2 text-sm font-semibold text-slate-900'>
          {product.title}
        </h3>
        <p className='mt-1 truncate text-xs text-slate-500'>
          SKU: {product.sku || '—'}
        </p>

        <dl className='mt-4 grid grid-cols-2 gap-3 text-sm'>
          <div>
            <dt className='text-xs font-medium uppercase tracking-wide text-slate-500'>
              Price
            </dt>
            <dd className='mt-0.5 font-semibold text-slate-900'>
              {formatCurrency(product.price)}
            </dd>
          </div>
          <div>
            <dt className='text-xs font-medium uppercase tracking-wide text-slate-500'>
              Available
            </dt>
            <dd className='mt-0.5 font-semibold text-slate-900'>
              {formatNumber(availableQuantity)} units
            </dd>
          </div>
        </dl>

        <div className='mt-auto flex flex-col gap-2 pt-4 sm:flex-row'>
          <Button
            variant='outline'
            size='sm'
            icon={Eye}
            className='flex-1'
            onClick={() => onView?.(product)}
          >
            View details
          </Button>
          <Button
            size='sm'
            icon={ShoppingCart}
            className='flex-1'
            disabled={isDisabled}
            onClick={() => {
              if (!isDisabled) onAddToCart?.(product);
            }}
          >
            {addButtonLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}
