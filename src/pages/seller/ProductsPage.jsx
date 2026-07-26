import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  DollarSign,
  Eye,
  FileText,
  Package,
  Pencil,
  Plus,
  ShoppingCart,
  Tag,
  Trash2,
  Weight,
} from 'lucide-react';
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
import { ProductGrid } from '@/components/products/ProductGrid.jsx';
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

      {isCustomer ? (
        <div className='space-y-4'>
          <ProductGrid
            products={items}
            isLoading={isLoading}
            onView={(product) => {
              setViewing(product);
              setViewOpen(true);
            }}
            emptyTitle='No products found'
            emptyDescription={
              filters.search
                ? 'No products match your search. Try a different title or SKU.'
                : 'No products are available in the catalog yet.'
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
      ) : (
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
      )}

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
        title='Product Details'
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
          <div className='space-y-6'>
            {/* Product Image & Title Section */}
            <div className='rounded-lg border border-slate-200 bg-white p-4'>
              {resolveMediaUrl(viewing.imageUrl) && (
                <div className='relative mb-4 overflow-hidden rounded-lg bg-slate-100'>
                  <img
                    src={resolveMediaUrl(viewing.imageUrl)}
                    alt={viewing.title}
                    className='h-48 w-full object-cover transition-transform hover:scale-105'
                    loading='lazy'
                  />
                </div>
              )}

              <div className='space-y-1'>
                <h3 className='text-xl font-semibold text-slate-900'>
                  {viewing.title}
                </h3>
                {viewing.sku && (
                  <p className='text-sm text-slate-500'>
                    SKU:{' '}
                    <span className='font-mono text-slate-600'>
                      {viewing.sku}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Key Information Grid */}
            <div className='grid gap-4 sm:grid-cols-2'>
              {/* Price Card */}
              <div className='rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300'>
                <div className='flex items-center gap-2'>
                  <div className='rounded-lg bg-emerald-50 p-2'>
                    <DollarSign className='h-4 w-4 text-emerald-600' />
                  </div>
                  <div>
                    <p className='text-xs font-medium uppercase tracking-wider text-slate-500'>
                      Price
                    </p>
                    <p className='text-lg font-bold text-slate-900'>
                      {formatCurrency(viewing.price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stock Card */}
              {!isAdmin && (
                <div className='rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`rounded-lg p-2 ${
                        (isCustomer
                          ? viewing.availableQuantity
                          : viewing.quantity) > 10
                          ? 'bg-emerald-50'
                          : (isCustomer
                                ? viewing.availableQuantity
                                : viewing.quantity) > 0
                            ? 'bg-amber-50'
                            : 'bg-red-50'
                      }`}
                    >
                      <Package
                        className={`h-4 w-4 ${
                          (isCustomer
                            ? viewing.availableQuantity
                            : viewing.quantity) > 10
                            ? 'text-emerald-600'
                            : (isCustomer
                                  ? viewing.availableQuantity
                                  : viewing.quantity) > 0
                              ? 'text-amber-600'
                              : 'text-red-600'
                        }`}
                      />
                    </div>
                    <div>
                      <p className='text-xs font-medium uppercase tracking-wider text-slate-500'>
                        {isCustomer
                          ? 'Available Quantity'
                          : 'Assigned Quantity'}
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          (isCustomer
                            ? viewing.availableQuantity
                            : viewing.quantity) > 10
                            ? 'text-emerald-600'
                            : (isCustomer
                                  ? viewing.availableQuantity
                                  : viewing.quantity) > 0
                              ? 'text-amber-600'
                              : 'text-red-600'
                        }`}
                      >
                        {formatNumber(
                          (isCustomer
                            ? viewing.availableQuantity
                            : viewing.quantity) ?? 0,
                        )}
                        <span className='ml-1 text-sm font-normal text-slate-500'>
                          units
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Info Cards */}
              {!isCustomer && (
                <>
                  {viewing.category && (
                    <div className='rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300'>
                      <div className='flex items-center gap-2'>
                        <div className='rounded-lg bg-blue-50 p-2'>
                          <Tag className='h-4 w-4 text-blue-600' />
                        </div>
                        <div>
                          <p className='text-xs font-medium uppercase tracking-wider text-slate-500'>
                            Category
                          </p>
                          <p className='font-medium text-slate-900'>
                            {viewing.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {viewing.weight && (
                    <div className='rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300'>
                      <div className='flex items-center gap-2'>
                        <div className='rounded-lg bg-purple-50 p-2'>
                          <Weight className='h-4 w-4 text-purple-600' />
                        </div>
                        <div>
                          <p className='text-xs font-medium uppercase tracking-wider text-slate-500'>
                            Weight
                          </p>
                          <p className='font-medium text-slate-900'>
                            {viewing.weight} {viewing.weightUnit || 'kg'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Description Section */}
            {!isCustomer && viewing.description && (
              <div className='rounded-lg border border-slate-200 bg-white p-4'>
                <div className='flex items-center gap-2'>
                  <FileText className='h-4 w-4 text-slate-400' />
                  <h4 className='text-sm font-medium text-slate-700'>
                    Description
                  </h4>
                </div>
                <div className='mt-2 text-sm leading-relaxed text-slate-600'>
                  {viewing.description}
                </div>
              </div>
            )}

            {/* Quick Actions (Optional) */}
            {!isAdmin &&
              (isCustomer
                ? viewing.availableQuantity > 0
                : viewing.quantity > 0) && (
                <div className='flex flex-col gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <p className='text-sm font-medium text-emerald-800'>
                      ✓ In Stock
                    </p>
                    <p className='text-xs text-emerald-600'>
                      {isCustomer
                        ? `${viewing.availableQuantity} units available for purchase`
                        : `You have ${viewing.quantity} units assigned`}
                    </p>
                  </div>
                </div>
              )}

            {/* Low Stock Warning */}
            {!isAdmin &&
              (isCustomer ? viewing.availableQuantity : viewing.quantity) > 0 &&
              (isCustomer ? viewing.availableQuantity : viewing.quantity) <=
                5 && (
                <div className='flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800'>
                  <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
                  <span>
                    {isCustomer
                      ? `Only ${viewing.availableQuantity} units remaining in stock`
                      : `Low stock alert: Only ${viewing.quantity} units assigned`}
                  </span>
                </div>
              )}

            {/* Out of Stock Warning */}
            {!isAdmin &&
              (isCustomer ? viewing.availableQuantity : viewing.quantity) ===
                0 && (
                <div className='flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
                  <AlertCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
                  <span>
                    {isCustomer
                      ? 'This product is currently out of stock'
                      : 'No units assigned to you'}
                  </span>
                </div>
              )}
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
