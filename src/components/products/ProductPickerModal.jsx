import { memo, useEffect, useMemo, useState } from 'react';
import { Package } from 'lucide-react';
import { Modal } from '@/components/dialogs/Modal.jsx';
import { SearchBar } from '@/components/common/SearchBar.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { ProductImageCell } from '@/components/products/ProductImageCell.jsx';
import { productsService } from '@/features/products/productsService.js';
import { formatCurrency } from '@/utils/format/currency.js';

const PAGE_SIZE = 50;

const ProductPickerRow = memo(function ProductPickerRow({
  product,
  isSelected,
  onSelect,
}) {
  const metaParts = [];
  if (product.sku) metaParts.push(`SKU: ${product.sku}`);
  if (product.price != null && product.price !== '') {
    metaParts.push(formatCurrency(product.price));
  }
  if (product.quantity != null && product.quantity !== '') {
    metaParts.push(`${product.quantity} in stock`);
  }

  return (
    <li
      className='flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50'
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto 52px',
      }}
    >
      <ProductImageCell imageUrl={product.imageUrl} />
      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium text-slate-900'>
          {product.title}
        </p>
        <p className='truncate text-xs text-slate-500'>
          {metaParts.length ? metaParts.join(' · ') : 'No SKU'}
        </p>
      </div>
      <button
        type='button'
        onClick={() => onSelect(product)}
        className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
          isSelected
            ? 'bg-slate-100 text-slate-700'
            : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
        }`}
      >
        {isSelected ? 'Selected' : 'Select'}
      </button>
    </li>
  );
});

const matchesSearch = (product, query) => {
  if (!query) return true;
  const haystack = `${product.title || ''} ${product.sku || ''}`.toLowerCase();
  return haystack.includes(query);
};

/**
 * Product picker with image rows, sticky search, and Load more.
 *
 * - Default: loads from products API (server search/pagination).
 * - When `products` is passed: uses that local list (client search + load more).
 */
export function ProductPickerModal({
  isOpen,
  onClose,
  onSelect,
  excludeProductIds = [],
  allowProductId = null,
  selectedProductId = null,
  products: localProducts = null,
  title = 'Select a product',
  description = 'Search and pick a product.',
  emptyMessage = 'No available products.',
}) {
  const isLocalMode = Array.isArray(localProducts);

  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('idle');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const excluded = useMemo(
    () => new Set(excludeProductIds.filter(Boolean)),
    [excludeProductIds],
  );

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setItems([]);
      setPage(1);
      setTotalPages(1);
      setTotal(0);
      setError(null);
      setStatus('idle');
      setIsLoadingMore(false);
      setVisibleCount(PAGE_SIZE);
    }
  }, [isOpen]);

  // Local inventory/catalog mode
  useEffect(() => {
    if (!isOpen || !isLocalMode) return;
    setStatus('succeeded');
    setError(null);
    setVisibleCount(PAGE_SIZE);
  }, [isOpen, isLocalMode, localProducts, search]);

  // Server catalog mode
  useEffect(() => {
    if (!isOpen || isLocalMode) return;

    let cancelled = false;

    const loadFirstPage = async () => {
      setStatus('loading');
      setError(null);
      setIsLoadingMore(false);
      setPage(1);
      try {
        const result = await productsService.list({
          page: 1,
          limit: PAGE_SIZE,
          search: search || undefined,
        });
        if (cancelled) return;
        setItems(result.items || []);
        setTotalPages(result.meta?.totalPages || 1);
        setTotal(result.meta?.total || result.items?.length || 0);
        setPage(1);
        setStatus('succeeded');
      } catch (err) {
        if (cancelled) return;
        setItems([]);
        setTotalPages(1);
        setTotal(0);
        setError(err?.message || 'Could not load products');
        setStatus('failed');
      }
    };

    loadFirstPage();

    return () => {
      cancelled = true;
    };
  }, [isOpen, isLocalMode, search]);

  const handleLoadMore = async () => {
    if (isLocalMode) {
      setVisibleCount((current) => current + PAGE_SIZE);
      return;
    }

    if (page >= totalPages || isLoadingMore || status === 'loading') return;

    const nextPage = page + 1;
    setIsLoadingMore(true);
    setError(null);
    try {
      const result = await productsService.list({
        page: nextPage,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setItems((current) => [...current, ...(result.items || [])]);
      setTotalPages(result.meta?.totalPages || nextPage);
      setTotal(result.meta?.total ?? total);
      setPage(nextPage);
    } catch (err) {
      setError(err?.message || 'Could not load more products');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const query = search.trim().toLowerCase();

  const visibleProducts = useMemo(() => {
    const source = isLocalMode ? localProducts : items;
    const filtered = (source || []).filter((product) => {
      const id = product.id;
      const allowed =
        !excluded.has(id) || (allowProductId && id === allowProductId);
      return allowed && matchesSearch(product, query);
    });

    if (isLocalMode) {
      return filtered.slice(0, visibleCount);
    }
    return filtered;
  }, [
    isLocalMode,
    localProducts,
    items,
    excluded,
    allowProductId,
    query,
    visibleCount,
  ]);

  const filteredTotal = useMemo(() => {
    if (!isLocalMode) return total;
    return (localProducts || []).filter((product) => {
      const id = product.id;
      const allowed =
        !excluded.has(id) || (allowProductId && id === allowProductId);
      return allowed && matchesSearch(product, query);
    }).length;
  }, [
    isLocalMode,
    localProducts,
    excluded,
    allowProductId,
    query,
    total,
  ]);

  const hasMore = isLocalMode
    ? visibleProducts.length < filteredTotal
    : page < totalPages;

  const showingCount = isLocalMode ? visibleProducts.length : items.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size='xl'
      zIndexClass='z-[60]'
      closeOnBackdrop={false}
      blurBackdrop={false}
      toolbar={
        <SearchBar
          value={search}
          placeholder='Search by title or SKU…'
          onSearch={setSearch}
        />
      }
      footer={
        <Button variant='outline' onClick={onClose}>
          Cancel
        </Button>
      }
    >
      <div className='space-y-4'>
        {error ? (
          <p className='rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
            {error}
          </p>
        ) : null}

        {status === 'loading' ? (
          <p className='py-8 text-center text-sm text-slate-500'>
            Loading products…
          </p>
        ) : null}

        {status === 'succeeded' && visibleProducts.length === 0 ? (
          <div className='flex flex-col items-center gap-2 py-10 text-center'>
            <Package className='size-8 text-slate-300' />
            <p className='text-sm font-medium text-slate-700'>
              No available products
            </p>
            <p className='text-sm text-slate-500'>
              {search ? 'Try a different search.' : emptyMessage}
            </p>
          </div>
        ) : null}

        {status === 'succeeded' && visibleProducts.length > 0 ? (
          <>
            <ul className='divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200'>
              {visibleProducts.map((product) => (
                <ProductPickerRow
                  key={product.id}
                  product={product}
                  isSelected={selectedProductId === product.id}
                  onSelect={onSelect}
                />
              ))}
            </ul>

            <div className='flex flex-col items-center gap-2'>
              <p className='text-xs text-slate-500'>
                Showing {showingCount}
                {filteredTotal ? ` of ${filteredTotal}` : ''} products
              </p>
              {hasMore ? (
                <Button
                  type='button'
                  variant='outline'
                  isLoading={isLoadingMore}
                  disabled={isLoadingMore}
                  onClick={handleLoadMore}
                >
                  Load more
                </Button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
