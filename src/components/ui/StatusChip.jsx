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
