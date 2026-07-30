import { Badge } from './Badge.jsx';
import { appConfig } from '@/config/app.config.js';

/**
 * Derives a stock status chip from a remainingStock count. There's no
 * `status` field on the backend models — status is purely a UI-level
 * classification computed from the live stock count.
 */
export function getStockAvailability(
  remainingStock,
  threshold = appConfig.lowStockThreshold,
) {
  if (remainingStock <= 0) {
    return { label: 'Out of Stock', color: 'red', textClass: 'text-red-600' };
  }
  if (remainingStock <= threshold) {
    return { label: 'Low Stock', color: 'amber', textClass: 'text-orange-600' };
  }
  return { label: 'Available', color: 'green', textClass: 'text-green-600' };
}

export function StockStatusChip({
  remainingStock,
  threshold = appConfig.lowStockThreshold,
}) {
  const { label, color } = getStockAvailability(remainingStock, threshold);
  return <Badge color={color}>{label}</Badge>;
}

export function AvailabilityStatus({ remainingStock, showQuantity = true }) {
  const qty = remainingStock ?? 0;
  const { label, textClass } = getStockAvailability(qty);

  return (
    <p className={`font-medium ${textClass}`}>
      {label}
      {showQuantity ? ` · ${qty} units` : null}
    </p>
  );
}

export function RoleChip({ role }) {
  return <Badge color={role === 'ADMIN' ? 'primary' : 'slate'}>{role}</Badge>;
}

export function ProductOwnerBadge({ product, currentUserId }) {
  const ownerId = product?.ownerId || product?.owner?.id || null;

  if (ownerId && ownerId === currentUserId) {
    return <Badge color='primary'>My Product</Badge>;
  }

  if (product?.owner?.name) {
    return <Badge color='slate'>{product.owner.name}</Badge>;
  }

  return <Badge color='slate'>Catalog</Badge>;
}

/** Admin table cell — owner name with role subtitle. */
export function ProductOwnerCell({ product }) {
  if (!product?.ownerId) {
    return (
      <div className='min-w-0'>
        <p className='truncate font-medium text-slate-900'>Admin</p>
        <p className='text-xs text-slate-500'>(Catalog)</p>
      </div>
    );
  }

  const name = product.owner?.name || 'Unknown';
  const roleLabel =
    product.owner?.role === 'ADMIN'
      ? 'Admin'
      : product.owner?.role === 'SELLER'
        ? 'Seller'
        : product.owner?.role || 'User';

  return (
    <div className='min-w-0'>
      <p className='truncate font-medium text-slate-900' title={name}>
        {name}
      </p>
      <p className='text-xs text-slate-500'>({roleLabel})</p>
    </div>
  );
}
