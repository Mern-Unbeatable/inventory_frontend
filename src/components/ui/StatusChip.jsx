import { Badge } from './Badge.jsx';
import { appConfig } from '@/config/app.config.js';

/**
 * Derives a stock status chip from a remainingStock count. There's no
 * `status` field on the backend models — status is purely a UI-level
 * classification computed from the live stock count.
 */
export function StockStatusChip({ remainingStock, threshold = appConfig.lowStockThreshold }) {
  if (remainingStock <= 0) {
    return <Badge color="red">Out of Stock</Badge>;
  }
  if (remainingStock <= threshold) {
    return <Badge color="amber">Low Stock</Badge>;
  }
  return <Badge color="green">In Stock</Badge>;
}

export function RoleChip({ role }) {
  return <Badge color={role === 'ADMIN' ? 'primary' : 'slate'}>{role}</Badge>;
}
