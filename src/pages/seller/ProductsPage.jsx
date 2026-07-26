import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, Pencil, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { SearchBar } from '@/components/common/SearchBar.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { Pagination } from '@/components/tables/Pagination.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/forms/Input.jsx';
import { Textarea } from '@/components/forms/Textarea.jsx';
import { Modal } from '@/components/dialogs/Modal.jsx';
import { ImageUploadField } from '@/components/forms/ImageUploadField.jsx';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { useAuth } from '@/features/auth/authHooks.js';
import { useProducts } from '@/features/products/productsHooks.js';
import { useInventory } from '@/features/inventory/inventoryHooks.js';
import { productFormSchema } from '@/features/products/productsValidation.js';
import { sellStockSchema } from '@/features/inventory/inventoryValidation.js';
import {
  AvailabilityStatus,
  StockStatusChip,
} from '@/components/ui/StatusChip.jsx';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';
import { formatDate } from '@/utils/format/date.js';
import { resolveMediaUrl } from '@/utils/media/url.js';

function ProductFormModal({ isOpen, onClose, product, onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: { title: '', sku: '', description: '', price: 0 },
  });

  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    reset(
      product
        ? {
            title: product.title || '',
            sku: product.sku || '',
            description: product.description || '',
            price: product.price ?? 0,
          }
        : { title: '', sku: '', description: '', price: 0 },
    );
    setImageFile(null);
    setRemoveImage(false);
    setImageError(null);
  }, [isOpen, product, reset]);

  const existingImageUrl = removeImage ? null : product?.imageUrl || null;

  const submit = handleSubmit((values) => {
    setImageError(null);
    onSubmit({
      ...values,
      ...(imageFile ? { image: imageFile } : {}),
      ...(removeImage && !imageFile ? { removeImage: true } : {}),
    });
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit product' : 'Create product'}
      description='Global master catalog item'
      size='lg'
      footer={
        <>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={isLoading}>
            {product ? 'Save changes' : 'Create product'}
          </Button>
        </>
      }
    >
      <form className='grid gap-4 sm:grid-cols-2' onSubmit={submit}>
        <ImageUploadField
          className='sm:col-span-2'
          label='Product image'
          valueFile={imageFile}
          existingUrl={existingImageUrl}
          disabled={isLoading}
          error={imageError}
          onChange={(file) => {
            setImageError(null);
            setImageFile(file);
            if (file) setRemoveImage(false);
          }}
          onClearExisting={() => {
            setImageFile(null);
            setRemoveImage(true);
          }}
        />
        <Input
          id='title'
          label='Title'
          containerClassName='sm:col-span-2'
          error={errors.title?.message}
          disabled={isLoading}
          {...register('title')}
        />
        <Input
          id='sku'
          label='SKU'
          error={errors.sku?.message}
          disabled={isLoading}
          {...register('sku')}
        />
        <Input
          id='price'
          label='Price'
          type='number'
          step='0.01'
          error={errors.price?.message}
          disabled={isLoading}
          {...register('price')}
        />
        <Textarea
          id='description'
          label='Description'
          containerClassName='sm:col-span-2'
          error={errors.description?.message}
          disabled={isLoading}
          {...register('description')}
        />
      </form>
    </Modal>
  );
}

function SellerSellModal({ isOpen, onClose, product, onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sellStockSchema),
    defaultValues: { quantity: 1 },
  });

  useEffect(() => {
    if (isOpen) reset({ quantity: 1 });
  }, [isOpen, reset]);

  const availableQty = product?.quantity ?? 0;
  const isOutOfStock = availableQty <= 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product?.title || 'Record sale'}
      status={
        product ? (
          <AvailabilityStatus remainingStock={availableQty} />
        ) : undefined
      }
      footer={
        <>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={isOutOfStock || isLoading}
          >
            Confirm sale
          </Button>
        </>
      }
    >
      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <Input
          id='soldQuantity'
          label='Units sold'
          type='number'
          hint={
            isOutOfStock
              ? 'No stock available to sell'
              : 'Your stock will decrease by this amount'
          }
          error={errors.quantity?.message}
          disabled={isOutOfStock || isLoading}
          {...register('quantity')}
        />
      </form>
    </Modal>
  );
}

export default function ProductsPage() {
  const { isAdmin, isCustomer } = useAuth();
  const {
    items,
    meta,
    filters,
    status,
    error,
    isLoading,
    isMutating,
    loadProducts,
    updateFilters,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();
  const { recordSale, isMutating: isStockMutating } = useInventory();

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [sellTarget, setSellTarget] = useState(null);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, filters.page, filters.search]);

  const columns = useMemo(
    () => [
      {
        key: 'image',
        header: '',
        className: 'w-14',
        render: (row) => {
          const src = resolveMediaUrl(row.imageUrl);
          return src ? (
            <img
              src={src}
              alt=''
              className='size-9 rounded-lg object-cover ring-1 ring-slate-200 sm:size-10'
            />
          ) : (
            <div className='flex size-9 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 sm:size-10'>
              —
            </div>
          );
        },
      },
      {
        key: 'title',
        header: 'Title',
        className: 'min-w-[9rem] max-w-[14rem] whitespace-normal',
        render: (row) => (
          <span className='block truncate font-medium text-slate-900'>
            {row.title}
          </span>
        ),
      },
      {
        key: 'sku',
        header: 'SKU',
        className: 'min-w-[6rem]',
        render: (row) => (
          <span className='truncate text-slate-600'>{row.sku || '—'}</span>
        ),
      },
      {
        key: 'price',
        header: 'Price',
        render: (row) => formatCurrency(row.price),
      },
      ...(isAdmin
        ? [
            {
              key: 'description',
              header: 'Description',
              className: 'min-w-[10rem] max-w-[16rem] whitespace-normal',
              render: (row) => (
                <span className='block truncate text-slate-500'>
                  {row.description || '—'}
                </span>
              ),
            },
            {
              key: 'createdAt',
              header: 'Created',
              render: (row) => formatDate(row.createdAt),
            },
          ]
        : [
            {
              key: 'quantity',
              header: isCustomer ? 'Available' : 'Qty',
              render: (row) =>
                formatNumber(
                  isCustomer
                    ? (row.availableQuantity ?? 0)
                    : (row.quantity ?? 0),
                ),
            },
            {
              key: 'status',
              header: 'Status',
              render: (row) => (
                <StockStatusChip
                  remainingStock={
                    isCustomer
                      ? (row.availableQuantity ?? 0)
                      : (row.quantity ?? 0)
                  }
                />
              ),
            },
          ]),
      {
        key: 'actions',
        header: 'Actions',
        sticky: 'right',
        render: (row) => (
          <div className='flex items-center gap-0.5 sm:gap-1'>
            <Button
              variant='ghost'
              size='sm'
              icon={Eye}
              title='View'
              onClick={() => {
                setViewing(row);
                setViewOpen(true);
              }}
            />
            {isAdmin ? (
              <>
                <Button
                  variant='ghost'
                  size='sm'
                  icon={Pencil}
                  title='Edit'
                  onClick={() => {
                    setEditing(row);
                    setFormOpen(true);
                  }}
                />
                <Button
                  variant='ghost'
                  size='sm'
                  icon={Trash2}
                  title='Delete'
                  onClick={() => setDeleting(row)}
                />
              </>
            ) : isCustomer ? null : (
              <Button
                variant='ghost'
                size='sm'
                icon={ShoppingCart}
                title='Record sale'
                onClick={() => setSellTarget(row)}
              />
            )}
          </div>
        ),
      },
    ],
    [isAdmin, isCustomer],
  );

  const handleSubmit = async (values) => {
    const result = editing
      ? await updateProduct(editing.id, values)
      : await createProduct(values);
    if (result.success) {
      setFormOpen(false);
      setEditing(null);
    }
  };

  if (status === 'failed' && !items.length) {
    return (
      <ErrorState
        title='Could not load products'
        description={error}
        onRetry={loadProducts}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title='Products'
        description={
          isAdmin
            ? 'Master catalog used when assigning stock to sellers'
            : isCustomer
              ? 'Browse available products, quantity, and price'
              : 'Your assigned products — record sales to update stock'
        }
        actions={
          isAdmin ? (
            <Button
              icon={Plus}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              Add product
            </Button>
          ) : null
        }
      />

      <div className='mb-4 max-w-sm'>
        <SearchBar
          value={filters.search}
          placeholder='Search by title or SKU…'
          onSearch={(search) => updateFilters({ search, page: 1 })}
        />
      </div>

      <div className='rounded-xl border border-slate-200 bg-white shadow-sm'>
        <Table
          columns={columns}
          data={items}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          minWidthClassName={isAdmin ? 'min-w-[48rem]' : 'min-w-[40rem]'}
          emptyTitle='No products yet'
          emptyDescription={
            isAdmin
              ? 'Create your first catalog product.'
              : isCustomer
                ? 'No products are available in the catalog yet.'
                : 'No products have been assigned to you yet. Ask an admin.'
          }
        />
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={(page) => updateFilters({ page })}
        />
      </div>

      <ProductFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        product={editing}
        onSubmit={handleSubmit}
        isLoading={isMutating}
      />

      <Modal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        title='Product details'
        status={
          !isAdmin && viewing ? (
            <AvailabilityStatus
              remainingStock={
                isCustomer
                  ? (viewing.availableQuantity ?? 0)
                  : (viewing.quantity ?? 0)
              }
            />
          ) : undefined
        }
        size='xl'
      >
        {viewing && (
          <div className='space-y-4'>
            {resolveMediaUrl(viewing.imageUrl) && (
              <img
                src={resolveMediaUrl(viewing.imageUrl)}
                alt={viewing.title}
                className='h-40 w-full rounded-xl object-cover ring-1 ring-slate-200'
              />
            )}
            <div>
              <dt className='text-slate-500'>Title</dt>
              <dd className='font-medium text-slate-900'>{viewing.title}</dd>
            </div>
            <dl className='grid gap-3 text-sm sm:grid-cols-2'>
              <div>
                <dt className='text-slate-500'>SKU</dt>
                <dd className='font-medium text-slate-900'>
                  {viewing.sku || '—'}
                </dd>
              </div>
              <div>
                <dt className='text-slate-500'>Price</dt>
                <dd className='font-medium text-slate-900'>
                  {formatCurrency(viewing.price)}
                </dd>
              </div>
              {!isAdmin && (
                <div>
                  <dt className='text-slate-500'>
                    {isCustomer ? 'Available quantity' : 'Assigned qty'}
                  </dt>
                  <dd className='font-medium text-slate-900'>
                    {formatNumber(
                      (isCustomer
                        ? viewing.availableQuantity
                        : viewing.quantity) ?? 0,
                    )}
                  </dd>
                </div>
              )}
              {!isCustomer && (
                <div className='sm:col-span-2'>
                  <dt className='text-slate-500'>Description</dt>
                  <dd className='mt-1 text-slate-700'>
                    {viewing.description || '—'}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </Modal>

      <SellerSellModal
        isOpen={Boolean(sellTarget)}
        onClose={() => setSellTarget(null)}
        product={sellTarget}
        isLoading={isStockMutating}
        onSubmit={async (values) => {
          if (!sellTarget?.assignmentId) return;
          const result = await recordSale(
            sellTarget.assignmentId,
            values.quantity,
          );
          if (result.success) {
            setSellTarget(null);
            loadProducts();
          }
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title='Delete product?'
        description={`This will remove “${deleting?.title}” from the catalog.`}
        confirmLabel='Delete'
        isLoading={isMutating}
        onConfirm={async () => {
          const result = await deleteProduct(deleting.id);
          if (result.success) setDeleting(null);
        }}
      />
    </div>
  );
}
