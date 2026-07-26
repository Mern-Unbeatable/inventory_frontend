import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Boxes,
  History,
  Package,
  PackagePlus,
  Pencil,
  Plus,
  ShoppingCart,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { SearchBar } from '@/components/common/SearchBar.jsx';
import { StatCard } from '@/components/cards/StatCard.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { Pagination } from '@/components/tables/Pagination.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/forms/Input.jsx';
import { Select } from '@/components/forms/Select.jsx';
import { Modal } from '@/components/dialogs/Modal.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog.jsx';
import {
  AvailabilityStatus,
  StockStatusChip,
} from '@/components/ui/StatusChip.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { useInventory } from '@/features/inventory/inventoryHooks.js';
import {
  adjustQuantitySchema,
  assignStockSchema,
  receiveStockSchema,
  sellStockSchema,
  setQuantitySchema,
} from '@/features/inventory/inventoryValidation.js';
import { useBranches } from '@/features/branches/branchesHooks.js';
import { useCountries } from '@/features/countries/countriesHooks.js';
import { useProducts } from '@/features/products/productsHooks.js';
import { useUsers } from '@/features/users/usersHooks.js';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';
import { formatDateTime } from '@/utils/format/date.js';

const TRANSACTION_TONE = {
  RECEIVED: 'green',
  SALE: 'primary',
  ADJUSTMENT: 'amber',
  MANUAL_UPDATE: 'slate',
};

function AssignModal({
  isOpen,
  onClose,
  users,
  products,
  onSubmit,
  isLoading,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(assignStockSchema),
    defaultValues: { userId: '', productId: '', quantity: 0 },
  });

  useEffect(() => {
    if (isOpen) reset({ userId: '', productId: '', quantity: 0 });
  }, [isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Assign product'
      description='Assign a master product to a seller with starting quantity'
      footer={
        <>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Assign
          </Button>
        </>
      }
    >
      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <Select
          id='userId'
          label='Seller'
          placeholder='Select seller'
          options={users}
          error={errors.userId?.message}
          {...register('userId')}
        />
        <Select
          id='productId'
          label='Product'
          placeholder='Select product'
          options={products}
          error={errors.productId?.message}
          {...register('productId')}
        />
        <Input
          id='quantity'
          label='Initial quantity'
          type='number'
          error={errors.quantity?.message}
          {...register('quantity')}
        />
      </form>
    </Modal>
  );
}

function QuantityModal({ isOpen, onClose, row, onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(setQuantitySchema),
    defaultValues: { quantity: 0 },
  });

  useEffect(() => {
    if (isOpen && row) reset({ quantity: row.quantity ?? 0 });
  }, [isOpen, row, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Update stock'
      description={
        row
          ? `${row.product?.title || 'Product'}${row.user?.name ? ` · ${row.user.name}` : ''}`
          : undefined
      }
      footer={
        <>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Save stock
          </Button>
        </>
      }
    >
      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <Input
          id='quantity'
          label='Remaining quantity'
          type='number'
          error={errors.quantity?.message}
          {...register('quantity')}
        />
      </form>
    </Modal>
  );
}

function AdjustModal({ isOpen, onClose, row, onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adjustQuantitySchema),
    defaultValues: { delta: 1 },
  });

  useEffect(() => {
    if (isOpen) reset({ delta: 1 });
  }, [isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Adjust quantity'
      description={
        row
          ? `Current: ${row.quantity}. Use positive to increase, negative to decrease.`
          : undefined
      }
      footer={
        <>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Apply delta
          </Button>
        </>
      }
    >
      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <Input
          id='delta'
          label='Delta (+ / −)'
          type='number'
          error={errors.delta?.message}
          {...register('delta')}
        />
      </form>
    </Modal>
  );
}

function SellModal({ isOpen, onClose, row, onSubmit, isLoading }) {
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

  const availableQty = row?.quantity ?? 0;
  const isOutOfStock = availableQty <= 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={row?.product?.title || 'Record sale'}
      status={
        row ? <AvailabilityStatus remainingStock={availableQty} /> : undefined
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
              : 'Stock will decrease by this amount'
          }
          error={errors.quantity?.message}
          disabled={isOutOfStock || isLoading}
          {...register('quantity')}
        />
      </form>
    </Modal>
  );
}

function ReceiveModal({ isOpen, onClose, row, onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(receiveStockSchema),
    defaultValues: { quantity: 1, reason: '' },
  });

  useEffect(() => {
    if (isOpen) reset({ quantity: 1, reason: '' });
  }, [isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Receive stock'
      description={
        row
          ? `${row.product?.title || 'Product'} · current qty: ${formatNumber(row.quantity ?? 0)}`
          : undefined
      }
      footer={
        <>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Receive
          </Button>
        </>
      }
    >
      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <Input
          id='quantity'
          label='Quantity received'
          type='number'
          hint='Stock will increase by this amount'
          error={errors.quantity?.message}
          {...register('quantity')}
        />
        <Input
          id='reason'
          label='Reason (optional)'
          placeholder='e.g. Restock from supplier'
          error={errors.reason?.message}
          {...register('reason')}
        />
      </form>
    </Modal>
  );
}

function TransactionsModal({
  isOpen,
  onClose,
  title,
  description,
  transactions,
  meta,
  isLoading,
  error,
  onPageChange,
  showSeller,
}) {
  const columns = [
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: 'product',
      header: 'Product',
      render: (row) => row.product?.title || '—',
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <Badge color={TRANSACTION_TONE[row.type] || 'slate'}>{row.type}</Badge>
      ),
    },
    {
      key: 'before',
      header: 'Before',
      render: (row) => formatNumber(row.beforeQuantity),
    },
    {
      key: 'change',
      header: 'Change',
      render: (row) => (
        <span
          className={
            row.changeQuantity >= 0 ? 'text-green-600' : 'text-red-600'
          }
        >
          {row.changeQuantity >= 0 ? '+' : ''}
          {formatNumber(row.changeQuantity)}
        </span>
      ),
    },
    {
      key: 'after',
      header: 'After',
      render: (row) => formatNumber(row.afterQuantity),
    },
    ...(showSeller
      ? [
          {
            key: 'performedBy',
            header: 'By',
            render: (row) => row.performedByUser?.name || '—',
          },
        ]
      : []),
    {
      key: 'reason',
      header: 'Reason',
      className: 'min-w-[8rem] max-w-[14rem] whitespace-normal',
      render: (row) => row.reason || '—',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size='3xl'
    >
      {error ? (
        <ErrorState
          title='Could not load transaction history'
          description={error}
        />
      ) : (
        <div className='space-y-3'>
          <div className='overflow-x-auto'>
            <Table
              columns={columns}
              data={transactions}
              keyExtractor={(row) => row.id}
              isLoading={isLoading}
              minWidthClassName='min-w-[42rem]'
              emptyTitle='No transactions yet'
              emptyDescription='Inventory movements will appear here.'
            />
          </div>
          {meta ? (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={meta.limit}
              onPageChange={onPageChange}
            />
          ) : null}
        </div>
      )}
    </Modal>
  );
}

export default function InventoryPage() {
  const {
    items,
    meta,
    filters,
    summary,
    status,
    error,
    isAdmin,
    isLoading,
    isMutating,
    loadInventory,
    updateFilters,
    assignStock,
    setQuantity,
    adjustQuantity,
    recordSale,
    receiveStock,
    unassignStock,
    transactions,
    transactionsMeta,
    isTransactionsLoading,
    transactionsError,
    loadTransactions,
  } = useInventory();

  const { items: countries, loadCountries } = useCountries();
  const {
    items: branches,
    loadBranches,
    updateFilters: updateBranchFilters,
  } = useBranches();
  const {
    items: products,
    loadProducts,
    updateFilters: updateProductFilters,
  } = useProducts();
  const {
    items: users,
    loadUsers,
    updateFilters: updateUserFilters,
  } = useUsers();

  const [assignOpen, setAssignOpen] = useState(false);
  const [quantityOpen, setQuantityOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [unassigning, setUnassigning] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null); // row (per-product) or 'global'
  const [historyPage, setHistoryPage] = useState(1);

  useEffect(() => {
    if (!isAdmin) return;
    loadCountries();
    updateBranchFilters({ page: 1, limit: 100, search: '', countryId: '' });
    updateProductFilters({ page: 1, limit: 100, search: '' });
    updateUserFilters({ page: 1, limit: 100, search: '', role: 'SELLER' });
    loadBranches();
    loadProducts();
    loadUsers();
  }, [
    isAdmin,
    loadCountries,
    loadBranches,
    loadProducts,
    loadUsers,
    updateBranchFilters,
    updateProductFilters,
    updateUserFilters,
  ]);

  useEffect(() => {
    loadInventory();
  }, [
    loadInventory,
    filters.page,
    filters.countryId,
    filters.branchId,
    filters.userId,
    filters.search,
  ]);

  useEffect(() => {
    if (!historyTarget) return;
    if (historyTarget === 'global') {
      loadTransactions({
        scope: isAdmin ? 'all' : 'me',
        params: { page: historyPage, limit: 10 },
      });
    } else {
      loadTransactions({
        scope: 'row',
        id: historyTarget.id,
        params: { page: historyPage, limit: 10 },
      });
    }
  }, [historyTarget, historyPage, isAdmin, loadTransactions]);

  const countryOptions = useMemo(
    () => countries.map((c) => ({ value: c.id, label: c.name })),
    [countries],
  );
  const branchOptions = useMemo(
    () =>
      branches
        .filter((b) => !filters.countryId || b.countryId === filters.countryId)
        .map((b) => ({ value: b.id, label: b.name })),
    [branches, filters.countryId],
  );
  const userOptions = useMemo(
    () =>
      users
        .filter((u) => u.role === 'SELLER')
        .filter((u) => !filters.branchId || u.branchId === filters.branchId)
        .map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
    [users, filters.branchId],
  );
  const productOptions = useMemo(
    () =>
      products.map((p) => ({ value: p.id, label: `${p.title} (${p.sku})` })),
    [products],
  );

  const columns = useMemo(
    () => [
      {
        key: 'product',
        header: 'Product',
        className: 'min-w-[10rem] max-w-[14rem] whitespace-normal',
        render: (row) => (
          <div className='min-w-0'>
            <p className='truncate font-medium text-slate-900'>
              {row.product?.title}
            </p>
            <p className='truncate text-xs text-slate-500'>
              {row.product?.sku || 'No SKU'}
            </p>
          </div>
        ),
      },
      ...(isAdmin
        ? [
            {
              key: 'seller',
              header: 'Seller',
              className: 'min-w-[10rem] max-w-[14rem] whitespace-normal',
              render: (row) => (
                <div className='min-w-0'>
                  <p className='truncate font-medium text-slate-900'>
                    {row.user?.name || '—'}
                  </p>
                  <p className='truncate text-xs text-slate-500'>
                    {row.user?.branch?.name || 'No branch'}
                    {row.user?.branch?.country?.name
                      ? ` · ${row.user.branch.country.name}`
                      : ''}
                  </p>
                </div>
              ),
            },
          ]
        : []),
      {
        key: 'price',
        header: 'Price',
        render: (row) => formatCurrency(row.product?.price),
      },
      {
        key: 'quantity',
        header: 'Qty',
        render: (row) => formatNumber(row.quantity),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => <StockStatusChip remainingStock={row.quantity} />,
      },
      {
        key: 'actions',
        header: 'Actions',
        sticky: 'right',
        render: (row) => (
          <div className='flex items-center gap-0.5 sm:gap-1'>
            <Button
              variant='ghost'
              size='sm'
              icon={ShoppingCart}
              title='Record sale'
              onClick={() => {
                setEditing(row);
                setSellOpen(true);
              }}
            />
            <Button
              variant='ghost'
              size='sm'
              icon={PackagePlus}
              title='Receive stock'
              onClick={() => {
                setEditing(row);
                setReceiveOpen(true);
              }}
            />
            <Button
              variant='ghost'
              size='sm'
              icon={History}
              title='Transaction history'
              onClick={() => {
                setHistoryPage(1);
                setHistoryTarget(row);
              }}
            />
            {isAdmin ? (
              <>
                <Button
                  variant='ghost'
                  size='sm'
                  icon={Pencil}
                  title='Update stock'
                  onClick={() => {
                    setEditing(row);
                    setQuantityOpen(true);
                  }}
                />
                <Button
                  variant='ghost'
                  size='sm'
                  icon={Plus}
                  title='Adjust by delta'
                  onClick={() => {
                    setEditing(row);
                    setAdjustOpen(true);
                  }}
                />
                <Button
                  variant='ghost'
                  size='sm'
                  icon={Trash2}
                  title='Unassign'
                  onClick={() => setUnassigning(row)}
                />
              </>
            ) : null}
          </div>
        ),
      },
    ],
    [isAdmin],
  );
  if (status === 'failed' && !items.length) {
    return (
      <ErrorState
        title='Could not load inventory'
        description={error}
        onRetry={loadInventory}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title='Inventory'
        description={
          isAdmin
            ? 'Assign products to sellers and monitor live stock'
            : 'Record sales on your assigned products'
        }
        actions={
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              icon={History}
              onClick={() => {
                setHistoryPage(1);
                setHistoryTarget('global');
              }}
            >
              Transaction history
            </Button>
            {isAdmin ? (
              <Button icon={UserPlus} onClick={() => setAssignOpen(true)}>
                Assign product
              </Button>
            ) : null}
          </div>
        }
      />

      {!isAdmin && summary ? (
        <div className='mb-4 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            title='Assigned products'
            value={formatNumber(summary.productCount)}
            icon={Package}
            tone='primary'
          />
          <StatCard
            title='Total quantity'
            value={formatNumber(summary.totalQuantity)}
            icon={Boxes}
            tone='green'
          />
        </div>
      ) : null}

      <div
        className={`mb-4 grid grid-cols-1 gap-3 ${
          isAdmin
            ? 'sm:grid-cols-2 lg:grid-cols-4'
            : 'sm:grid-cols-1 lg:max-w-sm'
        }`}
      >
        <div className={isAdmin ? 'sm:col-span-2 lg:col-span-1' : ''}>
          <SearchBar
            value={filters.search}
            placeholder='Search by title or SKU…'
            onSearch={(search) => updateFilters({ search, page: 1 })}
          />
        </div>
        {isAdmin ? (
          <>
            <Select
              value={filters.countryId}
              onChange={(event) =>
                updateFilters({
                  countryId: event.target.value,
                  branchId: '',
                  userId: '',
                  page: 1,
                })
              }
              options={[
                { value: '', label: 'All countries' },
                ...countryOptions,
              ]}
            />
            <Select
              value={filters.branchId}
              onChange={(event) =>
                updateFilters({
                  branchId: event.target.value,
                  userId: '',
                  page: 1,
                })
              }
              options={[{ value: '', label: 'All branches' }, ...branchOptions]}
            />
            <Select
              value={filters.userId}
              onChange={(event) =>
                updateFilters({ userId: event.target.value, page: 1 })
              }
              options={[{ value: '', label: 'All sellers' }, ...userOptions]}
            />
          </>
        ) : null}
      </div>

      <div className='rounded-xl border border-slate-200 bg-white shadow-sm'>
        <Table
          columns={columns}
          data={items}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          minWidthClassName={isAdmin ? 'min-w-[48rem]' : 'min-w-[40rem]'}
          emptyTitle='No inventory records'
          emptyDescription={
            isAdmin
              ? 'Assign a product to a seller to get started.'
              : 'No products have been assigned to you yet.'
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

      <AssignModal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        users={userOptions}
        products={productOptions}
        isLoading={isMutating}
        onSubmit={async (values) => {
          const result = await assignStock(values);
          if (result.success) setAssignOpen(false);
        }}
      />

      <QuantityModal
        isOpen={quantityOpen}
        onClose={() => {
          setQuantityOpen(false);
          setEditing(null);
        }}
        row={editing}
        isLoading={isMutating}
        onSubmit={async (values) => {
          const result = await setQuantity(editing.id, values.quantity);
          if (result.success) {
            setQuantityOpen(false);
            setEditing(null);
          }
        }}
      />

      <AdjustModal
        isOpen={adjustOpen}
        onClose={() => {
          setAdjustOpen(false);
          setEditing(null);
        }}
        row={editing}
        isLoading={isMutating}
        onSubmit={async (values) => {
          const result = await adjustQuantity(editing.id, values.delta);
          if (result.success) {
            setAdjustOpen(false);
            setEditing(null);
          }
        }}
      />

      <SellModal
        isOpen={sellOpen}
        onClose={() => {
          setSellOpen(false);
          setEditing(null);
        }}
        row={editing}
        isLoading={isMutating}
        onSubmit={async (values) => {
          const result = await recordSale(editing.id, values.quantity);
          if (result.success) {
            setSellOpen(false);
            setEditing(null);
          }
        }}
      />

      <ReceiveModal
        isOpen={receiveOpen}
        onClose={() => {
          setReceiveOpen(false);
          setEditing(null);
        }}
        row={editing}
        isLoading={isMutating}
        onSubmit={async (values) => {
          const result = await receiveStock(
            editing.id,
            values.quantity,
            values.reason || undefined,
          );
          if (result.success) {
            setReceiveOpen(false);
            setEditing(null);
          }
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(unassigning)}
        onClose={() => setUnassigning(null)}
        title='Unassign product?'
        description={`Remove “${unassigning?.product?.title}” from ${unassigning?.user?.name}?`}
        confirmLabel='Unassign'
        isLoading={isMutating}
        onConfirm={async () => {
          const result = await unassignStock(unassigning.id);
          if (result.success) setUnassigning(null);
        }}
      />

      <TransactionsModal
        isOpen={Boolean(historyTarget)}
        onClose={() => setHistoryTarget(null)}
        title={
          historyTarget === 'global'
            ? isAdmin
              ? 'All inventory transactions'
              : 'My transaction history'
            : 'Transaction history'
        }
        description={
          historyTarget === 'global'
            ? 'Every stock movement across the system'
            : historyTarget
              ? `${historyTarget.product?.title || 'Product'}${historyTarget.user?.name ? ` · ${historyTarget.user.name}` : ''}`
              : undefined
        }
        transactions={transactions}
        meta={transactionsMeta}
        isLoading={isTransactionsLoading}
        error={transactionsError}
        showSeller={isAdmin}
        onPageChange={setHistoryPage}
      />
    </div>
  );
}
