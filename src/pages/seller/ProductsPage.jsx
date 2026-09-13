import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Download,
  DollarSign,
  Eye,
  FileText,
  Package,
  Pencil,
  Plus,
  ShoppingCart,
  Tag,
  Trash2,
  Upload,
  Weight,
  ZoomIn,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { SearchBar } from '@/components/common/SearchBar.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { Pagination } from '@/components/tables/Pagination.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/forms/Input.jsx';
import { Textarea } from '@/components/forms/Textarea.jsx';
import { Select } from '@/components/forms/Select.jsx';
import { ImageLightbox } from '@/components/dialogs/ImageLightbox.jsx';
import { Modal } from '@/components/dialogs/Modal.jsx';
import { ImageUploadField } from '@/components/forms/ImageUploadField.jsx';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { useAuth } from '@/features/auth/authHooks.js';
import { useProducts } from '@/features/products/productsHooks.js';
import { useInventory } from '@/features/inventory/inventoryHooks.js';
import { buildProductFormSchema } from '@/features/products/productsValidation.js';
import { sellStockSchema } from '@/features/inventory/inventoryValidation.js';
import { useUsers } from '@/features/users/usersHooks.js';
import {
  AvailabilityStatus,
  ProductOwnerBadge,
  ProductOwnerCell,
  StockStatusChip,
} from '@/components/ui/StatusChip.jsx';
import { ProductImageCell } from '@/components/products/ProductImageCell.jsx';
import { ProductGrid } from '@/components/products/ProductGrid.jsx';
import { useCart } from '@/features/cart/cartHooks.js';
import { selectCartItems } from '@/features/cart/cartSelectors.js';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';
import { formatDate } from '@/utils/format/date.js';
import { resolveMediaUrl } from '@/utils/media/url.js';

const PRODUCTS_PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100].map((value) => ({
  value: String(value),
  label: String(value),
}));

const EXPORT_FORMATS = [
  { format: 'csv', label: 'CSV (.csv)' },
  { format: 'xlsx', label: 'Excel (.xlsx)' },
  { format: 'json', label: 'JSON (.json)' },
];

function isOwnedByUser(product, userId) {
  if (!product || !userId) return false;
  return product.ownerId === userId;
}

function ProductDownloadModal({
  isOpen,
  onClose,
  onDownload,
  isLoading,
  activeFormat,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Download products'
      description='Export products you are allowed to access as CSV, Excel, or JSON.'
      size='sm'
      footer={
        <Button variant='outline' onClick={onClose} disabled={isLoading}>
          Close
        </Button>
      }
    >
      <div className='space-y-3'>
        <p className='text-sm text-slate-600'>
          Columns: title, sku, description, price, quantity, assignUserId
          (optional for admins), plus owner and created date for reference.
        </p>
        <div className='flex flex-col gap-2'>
          {EXPORT_FORMATS.map(({ format, label }) => (
            <Button
              key={format}
              variant='outline'
              icon={Download}
              isLoading={isLoading && activeFormat === format}
              disabled={isLoading}
              onClick={() => onDownload(format)}
            >
              Download {label}
            </Button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

function ProductUploadModal({
  isOpen,
  onClose,
  onImport,
  isLoading,
  result,
  errorMessage,
}) {
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setLocalError(null);
    }
  }, [isOpen]);

  const handleFileChange = (event) => {
    const next = event.target.files?.[0] || null;
    setLocalError(null);
    if (!next) {
      setFile(null);
      return;
    }
    const name = next.name.toLowerCase();
    if (
      !name.endsWith('.csv') &&
      !name.endsWith('.xlsx') &&
      !name.endsWith('.json')
    ) {
      setFile(null);
      setLocalError('Please choose a .csv, .xlsx, or .json file');
      return;
    }
    setFile(next);
  };

  const handleImport = async () => {
    if (!file) {
      setLocalError('Select a file to import');
      return;
    }
    await onImport(file);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Upload products'
      description='Import products in bulk from CSV, Excel, or JSON. Duplicate SKUs and invalid rows are skipped with errors listed below.'
      size='lg'
      footer={
        <>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result ? (
            <Button
              icon={Upload}
              isLoading={isLoading}
              disabled={isLoading || !file}
              onClick={handleImport}
            >
              Import
            </Button>
          ) : null}
        </>
      }
    >
      <div className='space-y-4'>
        {!result ? (
          <>
            <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600'>
              <p className='font-medium text-slate-800'>Required columns</p>
              <p className='mt-1'>
                <code className='text-xs'>title</code>,{' '}
                <code className='text-xs'>sku</code>. Optional:{' '}
                <code className='text-xs'>description</code>,{' '}
                <code className='text-xs'>price</code>,{' '}
                <code className='text-xs'>quantity</code>,{' '}
                <code className='text-xs'>assignUserId</code> (admins only).
              </p>
              <p className='mt-2 text-slate-500'>
                Sellers create products under their own ownership. Max 500 rows
                per file. JSON must be an array of objects (or{' '}
                <code className='text-xs'>{`{ "products": [...] }`}</code>).
              </p>
            </div>

            <div>
              <label
                htmlFor='product-import-file'
                className='mb-1.5 block text-sm font-medium text-slate-700'
              >
                Spreadsheet file
              </label>
              <input
                id='product-import-file'
                type='file'
                accept='.csv,.xlsx,.json,text/csv,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                disabled={isLoading}
                onChange={handleFileChange}
                className='block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700'
              />
              {file ? (
                <p className='mt-2 text-sm text-slate-500'>
                  Selected: {file.name}
                </p>
              ) : null}
            </div>

            {(localError || errorMessage) && (
              <div className='flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800'>
                <AlertCircle className='mt-0.5 size-4 shrink-0' />
                <span>{localError || errorMessage}</span>
              </div>
            )}
          </>
        ) : (
          <div className='space-y-4'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
              <div className='rounded-lg border border-slate-200 bg-slate-50 p-3'>
                <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Total rows
                </p>
                <p className='mt-1 text-xl font-semibold text-slate-900'>
                  {result.totalRows}
                </p>
              </div>
              <div className='rounded-lg border border-emerald-200 bg-emerald-50 p-3'>
                <p className='text-xs font-medium uppercase tracking-wide text-emerald-700'>
                  Imported
                </p>
                <p className='mt-1 text-xl font-semibold text-emerald-800'>
                  {result.successCount}
                </p>
              </div>
              <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
                <p className='text-xs font-medium uppercase tracking-wide text-red-700'>
                  Failed
                </p>
                <p className='mt-1 text-xl font-semibold text-red-800'>
                  {result.failureCount}
                </p>
              </div>
            </div>

            {result.failed?.length ? (
              <div>
                <p className='mb-2 text-sm font-medium text-slate-800'>
                  Row errors
                </p>
                <div className='max-h-56 overflow-auto rounded-lg border border-slate-200'>
                  <table className='min-w-full text-left text-sm'>
                    <thead className='bg-slate-50 text-xs uppercase text-slate-500'>
                      <tr>
                        <th className='px-3 py-2'>Row</th>
                        <th className='px-3 py-2'>SKU</th>
                        <th className='px-3 py-2'>Error</th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-slate-100'>
                      {result.failed.map((row) => (
                        <tr key={`${row.row}-${row.sku || row.message}`}>
                          <td className='px-3 py-2 text-slate-700'>{row.row}</td>
                          <td className='px-3 py-2 text-slate-500'>
                            {row.sku || '—'}
                          </td>
                          <td className='px-3 py-2 text-red-700'>{row.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className='text-sm text-emerald-700'>
                All rows imported successfully.
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function ProductFormModal({
  isOpen,
  onClose,
  product,
  onSubmit,
  isLoading,
  description = 'Global master catalog item',
  showQuantity = false,
  quantityHint = '',
  quantityReadOnly = false,
  showSellerSelect = false,
  sellerOptions = [],
}) {
  const isCreate = !product;
  const requireSellerForStock = showSellerSelect && isCreate;

  const formSchema = useMemo(
    () => buildProductFormSchema({ requireSellerForStock }),
    [requireSellerForStock],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      sku: '',
      description: '',
      price: 0,
      quantity: 0,
      assignUserId: '',
    },
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
            quantity: product.quantity ?? 0,
            assignUserId: '',
          }
        : {
            title: '',
            sku: '',
            description: '',
            price: 0,
            quantity: 0,
            assignUserId: '',
          },
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
      description={description}
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
        {showQuantity ? (
          <Input
            id='quantity'
            label='Qty'
            type='number'
            min={0}
            step={1}
            hint={quantityHint || undefined}
            error={errors.quantity?.message}
            disabled={isLoading || quantityReadOnly}
            {...register('quantity')}
          />
        ) : null}
        {showSellerSelect && isCreate ? (
          <Select
            id='assignUserId'
            label='Assign to seller'
            placeholder='Select seller'
            options={sellerOptions}
            error={errors.assignUserId?.message}
            disabled={isLoading}
            {...register('assignUserId')}
          />
        ) : null}
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
  const { isAdmin, isCustomer, isSeller, user } = useAuth();
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
    exportProducts,
    importProducts,
  } = useProducts();
  const { recordSale, isMutating: isStockMutating } = useInventory();
  const {
    items: users,
    loadUsers,
    updateFilters: updateUserFilters,
  } = useUsers();
  const { addProduct } = useCart();
  const cartItems = useSelector(selectCartItems);

  const [formOpen, setFormOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [sellTarget, setSellTarget] = useState(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [importError, setImportError] = useState(null);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, filters.page, filters.search, filters.limit]);

  useEffect(() => {
    if (!viewOpen) setImagePreviewOpen(false);
  }, [viewOpen]);

  useEffect(() => {
    if (!isAdmin) return;
    updateUserFilters({ page: 1, limit: 100, search: '', role: 'SELLER' });
  }, [isAdmin, updateUserFilters]);

  useEffect(() => {
    if (!isAdmin) return;
    loadUsers();
  }, [isAdmin, loadUsers]);

  const sellerOptions = useMemo(
    () =>
      users
        .filter((user) => user.role === 'SELLER')
        .map((user) => ({
          value: user.id,
          label: user.branch?.name
            ? `${user.name} - ${user.branch.name}`
            : user.name,
        })),
    [users],
  );

  const columns = useMemo(
    () => [
      {
        key: 'image',
        header: '',
        className: 'w-14',
        render: (row) => <ProductImageCell imageUrl={row.imageUrl} />,
      },
      {
        key: 'title',
        header: 'Product',
        className: 'min-w-[10rem] max-w-[16rem] !whitespace-normal',
        render: (row) => (
          <div className='min-w-0'>
            <p
              className='truncate font-medium text-slate-900'
              title={row.title}
            >
              {row.title}
            </p>
            <p
              className='truncate text-xs text-slate-500'
              title={row.sku || ''}
            >
              SKU: {row.sku || '—'}
            </p>
          </div>
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
              key: 'owner',
              header: 'Product Owner',
              className: 'min-w-[8rem] max-w-[12rem] !whitespace-normal',
              render: (row) => <ProductOwnerCell product={row} />,
            },
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
        : isCustomer
          ? [
              {
                key: 'quantity',
                header: 'Available',
                render: (row) => formatNumber(row.availableQuantity ?? 0),
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <StockStatusChip
                    remainingStock={row.availableQuantity ?? 0}
                  />
                ),
              },
            ]
          : [
              {
                key: 'quantity',
                header: 'Qty',
                render: (row) => formatNumber(row.quantity ?? 0),
              },
              {
                key: 'status',
                header: 'Status',
                render: (row) => (
                  <StockStatusChip remainingStock={row.quantity ?? 0} />
                ),
              },
              {
                key: 'owner',
                header: 'Owner',
                render: (row) => (
                  <ProductOwnerBadge product={row} currentUserId={user?.id} />
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
              <>
                <Button
                  variant='ghost'
                  size='sm'
                  icon={ShoppingCart}
                  title='Record sale'
                  onClick={() => setSellTarget(row)}
                />
                {isOwnedByUser(row, user?.id) ? (
                  <Button
                    variant='ghost'
                    size='sm'
                    icon={Pencil}
                    title='Edit product'
                    onClick={() => {
                      setEditing(row);
                      setFormOpen(true);
                    }}
                  />
                ) : null}
              </>
            )}
          </div>
        ),
      },
    ],
    [isAdmin, isCustomer, isSeller, user?.id],
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

  const handleExport = async (format) => {
    setIsExporting(true);
    setExportFormat(format);
    const result = await exportProducts({
      format,
      search: filters.search || undefined,
    });
    setIsExporting(false);
    setExportFormat(null);
    if (result.success) setDownloadOpen(false);
  };

  const handleImport = async (file) => {
    setIsImporting(true);
    setImportError(null);
    const result = await importProducts(file);
    setIsImporting(false);
    if (result.success) {
      setImportResult(result.data);
    } else {
      setImportError(result.error?.message || 'Import failed');
    }
  };

  const openUploadModal = () => {
    setImportResult(null);
    setImportError(null);
    setUploadOpen(true);
  };

  const viewingAvailableQuantity = viewing?.availableQuantity ?? 0;
  const viewingIsInCart = viewing
    ? cartItems.some((item) => item.productId === viewing.id)
    : false;
  const viewingIsOutOfStock = viewingAvailableQuantity === 0;
  const viewingAddDisabled = viewingIsInCart || viewingIsOutOfStock;
  let viewingAddLabel = 'Add to cart';
  if (viewingIsOutOfStock) viewingAddLabel = 'Out of Stock';
  else if (viewingIsInCart) viewingAddLabel = 'Added to Cart';

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
              : 'Your assigned products — create and edit your own, record sales on any assignment'
        }
        actions={
          isAdmin || isSeller ? (
            <>
              <Button
                variant='outline'
                icon={Download}
                onClick={() => setDownloadOpen(true)}
              >
                Download
              </Button>
              <Button
                variant='outline'
                icon={Upload}
                onClick={openUploadModal}
              >
                Upload
              </Button>
              <Button
                icon={Plus}
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                Add product
              </Button>
            </>
          ) : null
        }
      />

      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='max-w-sm flex-1'>
          <SearchBar
            value={filters.search}
            placeholder='Search by title or SKU…'
            onSearch={(search) => updateFilters({ search, page: 1 })}
          />
        </div>
        <Select
          id='products-per-page'
          label='Show per page'
          inlineLabel
          value={String(filters.limit)}
          options={PRODUCTS_PAGE_SIZE_OPTIONS}
          containerClassName='w-full sm:w-auto'
          className='w-20'
          onChange={(event) =>
            updateFilters({ limit: Number(event.target.value), page: 1 })
          }
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
            onAddToCart={(product) => addProduct(product)}
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
        key={editing?.id ?? 'create'}
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        product={editing}
        onSubmit={handleSubmit}
        isLoading={isMutating}
        description={
          isAdmin
            ? 'Global master catalog item'
            : 'Your product — you can edit details and upload an image'
        }
        showQuantity={isAdmin || isSeller}
        showSellerSelect={isAdmin && !editing}
        sellerOptions={sellerOptions}
        quantityHint={
          editing
            ? isAdmin
              ? (editing._count?.assignedUsers ?? 0) > 1
                ? 'Total stock across sellers — adjust per seller via Inventory'
                : (editing._count?.assignedUsers ?? 0) === 0
                  ? 'Assign this product to a seller via Inventory before setting stock'
                  : 'Stock for the assigned seller'
              : 'Your assigned stock quantity'
            : isAdmin
              ? 'Set initial stock and choose which seller receives it'
              : 'Initial stock for your inventory'
        }
        quantityReadOnly={
          isAdmin && editing && (editing._count?.assignedUsers ?? 0) > 1
        }
      />

      <Modal
        isOpen={viewOpen}
        onClose={() => {
          setImagePreviewOpen(false);
          setViewOpen(false);
        }}
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
        footer={
          isCustomer && viewing ? (
            <Button
              icon={ShoppingCart}
              disabled={viewingAddDisabled}
              onClick={() => {
                if (viewingAddDisabled) return;
                const result = addProduct(viewing);
                if (result.success) setViewOpen(false);
              }}
            >
              {viewingAddLabel}
            </Button>
          ) : null
        }
      >
        {viewing && (
          <div className='space-y-6'>
            {/* Product Image & Title Section */}
            <div className='rounded-lg border border-slate-200 bg-white p-4'>
              {resolveMediaUrl(viewing.imageUrl) && (
                <button
                  type='button'
                  onClick={() => setImagePreviewOpen(true)}
                  className='group relative mb-4 block w-full overflow-hidden rounded-lg bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
                  aria-label={`View larger image of ${viewing.title}`}
                >
                  <img
                    src={resolveMediaUrl(viewing.imageUrl)}
                    alt={viewing.title}
                    className='h-48 w-full object-cover transition-transform group-hover:scale-105 sm:h-56'
                    loading='lazy'
                  />
                  <span className='pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20'>
                    <span className='flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100'>
                      <ZoomIn className='size-3.5' />
                      Click to enlarge
                    </span>
                  </span>
                </button>
              )}

              <div className='space-y-1'>
                <h3 className='text-xl font-semibold text-slate-900'>
                  {viewing.title}
                </h3>
                {viewing.sku && (
                  <p className='text-sm text-slate-500'>
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
                        ? `${viewing.availableQuantity} units available to request`
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

      <ImageLightbox
        isOpen={imagePreviewOpen}
        onClose={() => setImagePreviewOpen(false)}
        src={resolveMediaUrl(viewing?.imageUrl)}
        alt={viewing?.title || 'Product image'}
      />

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

      <ProductDownloadModal
        isOpen={downloadOpen}
        onClose={() => !isExporting && setDownloadOpen(false)}
        onDownload={handleExport}
        isLoading={isExporting}
        activeFormat={exportFormat}
      />

      <ProductUploadModal
        isOpen={uploadOpen}
        onClose={() => {
          if (isImporting) return;
          setUploadOpen(false);
          setImportResult(null);
          setImportError(null);
        }}
        onImport={handleImport}
        isLoading={isImporting}
        result={importResult}
        errorMessage={importError}
      />
    </div>
  );
}
