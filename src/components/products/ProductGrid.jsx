import { Package } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState.jsx';
import { ProductCard } from './ProductCard.jsx';
import { ProductGridSkeleton } from './ProductCardSkeleton.jsx';

/**
 * Responsive product card grid for CUSTOMER catalog browsing.
 */
export function ProductGrid({
  products = [],
  isLoading = false,
  onView,
  onAddToCart,
  emptyTitle = 'No products found',
  emptyDescription = 'Try adjusting your search or check back later.',
}) {
  if (isLoading && !products.length) {
    return <ProductGridSkeleton />;
  }

  if (!products.length) {
    return (
      <EmptyState
        icon={Package}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onView={onView}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
