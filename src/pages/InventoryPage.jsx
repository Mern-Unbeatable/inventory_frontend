import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, ShoppingCart, Trash2, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { Pagination } from '@/components/tables/Pagination.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { Modal } from '@/components/ui/Modal.jsx';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog.jsx';
import { StockStatusChip } from '@/components/ui/StatusChip.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { useInventory } from '@/features/inventory/inventoryHooks.js';
import {
  adjustQuantitySchema,
  assignStockSchema,
  sellStockSchema,
  setQuantitySchema,
} from '@/features/inventory/inventoryValidation.js';
import { useBranches } from '@/features/branches/branchesHooks.js';
import { useCountries } from '@/features/countries/countriesHooks.js';
import { useProducts } from '@/features/products/productsHooks.js';
import { useUsers } from '@/features/users/usersHooks.js';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';

function AssignModal({ isOpen, onClose, users, products, onSubmit, isLoading }) {
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
      title="Assign product"
      description="Assign a master product to a seller with starting quantity"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Assign
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Select
          id="userId"
          label="Seller"
          placeholder="Select seller"
          options={users}
          error={errors.userId?.message}
          {...register('userId')}
        />
        <Select
          id="productId"
          label="Product"
          placeholder="Select product"
          options={products}
          error={errors.productId?.message}
          {...register('productId')}
        />
        <Input
          id="quantity"
          label="Initial quantity"
          type="number"
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
      title="Update stock"
      description={
        row
          ? `${row.product?.title || 'Product'}${row.user?.name ? ` · ${row.user.name}` : ''}`
          : undefined
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Save stock
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="quantity"
          label="Remaining quantity"
          type="number"
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
      title="Adjust quantity"
      description={
        row
          ? `Current: ${row.quantity}. Use positive to increase, negative to decrease.`
          : undefined
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Apply delta
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="delta"
          label="Delta (+ / −)"
          type="number"
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record sale"
      description={
        row
          ? `${row.product?.title || 'Product'} · Available: ${row.quantity ?? 0}`
          : undefined
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Confirm sale
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="soldQuantity"
          label="Units sold"
          type="number"
          hint="Stock will decrease by this amount"
          error={errors.quantity?.message}
          {...register('quantity')}
        />
      </form>
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
    unassignStock,
  } = useInventory();

  const { items: countries, loadCountries } = useCountries();
  const { items: branches, loadBranches, updateFilters: updateBranchFilters } = useBranches();
  const { items: products, loadProducts, updateFilters: updateProductFilters } = useProducts();
  const { items: users, loadUsers, updateFilters: updateUserFilters } = useUsers();

  const [assignOpen, setAssignOpen] = useState(false);
  const [quantityOpen, setQuantityOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [unassigning, setUnassigning] = useState(null);

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

  const countryOptions = useMemo(
    () => countries.map((c) => ({ value: c.id, label: c.name })),
    [countries]
  );
  const branchOptions = useMemo(
    () =>
      branches
        .filter((b) => !filters.countryId || b.countryId === filters.countryId)
        .map((b) => ({ value: b.id, label: b.name })),
    [branches, filters.countryId]
  );
  const userOptions = useMemo(
    () =>
      users
        .filter((u) => u.role === 'SELLER')
        .filter((u) => !filters.branchId || u.branchId === filters.branchId)
        .map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
    [users, filters.branchId]
  );
  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: `${p.title} (${p.sku})` })),
    [products]
  );

  const columns = [
    {
      key: 'product',
      header: 'Product',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.product?.title}</p>
          <p className="text-xs text-slate-500">{row.product?.sku || 'No SKU'}</p>
        </div>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: 'seller',
            header: 'Seller',
            render: (row) => (
              <div>
                <p className="font-medium text-slate-900">{row.user?.name || '—'}</p>
                <p className="text-xs text-slate-500">
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
      header: 'Catalog price',
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
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={ShoppingCart}
            title="Record sale"
            onClick={() => {
              setEditing(row);
              setSellOpen(true);
            }}
          />
          {isAdmin && (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={Pencil}
                title="Update stock"
                onClick={() => {
                  setEditing(row);
                  setQuantityOpen(true);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                title="Adjust by delta"
                onClick={() => {
                  setEditing(row);
                  setAdjustOpen(true);
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                title="Unassign"
                onClick={() => setUnassigning(row)}
              />
            </>
          )}
        </div>
      ),
    },
  ];

  if (status === 'failed' && !items.length) {
    return (
      <ErrorState title="Could not load inventory" description={error} onRetry={loadInventory} />
    );
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        description={
          isAdmin
            ? 'Assign products to sellers and monitor live stock'
            : 'Record sales on your assigned products'
        }
        actions={
          isAdmin ? (
            <Button icon={UserPlus} onClick={() => setAssignOpen(true)}>
              Assign product
            </Button>
          ) : null
        }
      />

      {!isAdmin && summary ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            Products: <strong>{formatNumber(summary.productCount)}</strong>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
            Total qty: <strong>{formatNumber(summary.totalQuantity)}</strong>
          </div>
        </div>
      ) : null}

      {isAdmin ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Select
            value={filters.countryId}
            onChange={(event) =>
              updateFilters({ countryId: event.target.value, branchId: '', userId: '', page: 1 })
            }
            options={[{ value: '', label: 'All countries' }, ...countryOptions]}
          />
          <Select
            value={filters.branchId}
            onChange={(event) =>
              updateFilters({ branchId: event.target.value, userId: '', page: 1 })
            }
            options={[{ value: '', label: 'All branches' }, ...branchOptions]}
          />
          <Select
            value={filters.userId}
            onChange={(event) => updateFilters({ userId: event.target.value, page: 1 })}
            options={[{ value: '', label: 'All sellers' }, ...userOptions]}
          />
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table
          columns={columns}
          data={items}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyTitle="No inventory records"
          emptyDescription={
            isAdmin
              ? 'Assign a product to a seller to get started.'
              : 'No products have been assigned to you yet.'
          }
        />
        {isAdmin ? (
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={meta.limit}
            onPageChange={(page) => updateFilters({ page })}
          />
        ) : null}
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

      <ConfirmDialog
        isOpen={Boolean(unassigning)}
        onClose={() => setUnassigning(null)}
        title="Unassign product?"
        description={`Remove “${unassigning?.product?.title}” from ${unassigning?.user?.name}?`}
        confirmLabel="Unassign"
        isLoading={isMutating}
        onConfirm={async () => {
          const result = await unassignStock(unassigning.id);
          if (result.success) setUnassigning(null);
        }}
      />
    </div>
  );
}
