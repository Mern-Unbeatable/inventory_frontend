import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Globe,
  Mail,
  Package,
  Pencil,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { Loader } from '@/components/ui/Loader.jsx';
import { Modal } from '@/components/dialogs/Modal.jsx';
import { Input } from '@/components/forms/Input.jsx';
import { Select } from '@/components/forms/Select.jsx';
import { RoleChip, StockStatusChip } from '@/components/ui/StatusChip.jsx';
import { CountryFlag } from '@/components/ui/CountryFlag.jsx';
import { useUsers } from '@/features/users/usersHooks.js';
import { useInventory } from '@/features/inventory/inventoryHooks.js';
import { useBranches } from '@/features/branches/branchesHooks.js';
import { updateUserSchema } from '@/features/users/usersValidation.js';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';
import { formatDate } from '@/utils/format/date.js';
import { getInitials, ROLES } from '@/utils/auth/auth.utils.js';

const ROLE_OPTIONS = [
  { value: 'SELLER', label: 'Seller' },
  { value: 'ADMIN', label: 'Admin' },
];

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className='rounded-lg bg-slate-50 px-4 py-3'>
      <dt className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500'>
        <Icon className='size-3.5' />
        {label}
      </dt>
      <dd className='mt-1 text-sm font-medium text-slate-900'>
        {value || '—'}
      </dd>
    </div>
  );
}

function EditUserModal({
  isOpen,
  onClose,
  user,
  branches,
  onSubmit,
  isLoading,
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'SELLER',
      branchId: '',
    },
  });

  const role = watch('role');

  useEffect(() => {
    if (!isOpen || !user) return;
    reset({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      branchId: user.branchId || '',
    });
  }, [isOpen, user, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Edit seller'
      description='Leave password blank to keep the current one'
      footer={
        <>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Save changes
          </Button>
        </>
      }
    >
      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <Input
          id='name'
          label='Name'
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          id='email'
          label='Email'
          type='email'
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          id='password'
          label='New password'
          type='password'
          error={errors.password?.message}
          {...register('password')}
        />
        <Select
          id='role'
          label='Role'
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          {...register('role')}
        />
        {(role === 'SELLER' || (!role && user?.role === 'SELLER')) && (
          <Select
            id='branchId'
            label='Branch'
            placeholder='Select branch'
            options={branches}
            error={errors.branchId?.message}
            {...register('branchId')}
          />
        )}
      </form>
    </Modal>
  );
}

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    current: user,
    detailStatus,
    detailError,
    isDetailLoading,
    isMutating,
    loadUserById,
    clearUser,
    updateUser,
    deleteUser,
  } = useUsers();
  const {
    userInventoryItems,
    userInventorySummary,
    userInventoryStatus,
    userInventoryError,
    isUserInventoryLoading,
    loadUserInventory,
    clearAssignedInventory,
  } = useInventory();
  const {
    items: branches,
    loadBranches,
    updateFilters: updateBranchFilters,
  } = useBranches();

  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return undefined;
    loadUserById(id);
    loadUserInventory(id);
    return () => {
      clearUser();
      clearAssignedInventory();
    };
  }, [id, loadUserById, loadUserInventory, clearUser, clearAssignedInventory]);

  useEffect(() => {
    updateBranchFilters({ page: 1, limit: 100, search: '', countryId: '' });
    loadBranches();
  }, [loadBranches, updateBranchFilters]);

  const branchOptions = useMemo(
    () =>
      branches.map((b) => ({
        value: b.id,
        label: `${b.name}${b.country?.name ? ` (${b.country.name})` : ''}`,
      })),
    [branches],
  );

  const productColumns = [
    {
      key: 'title',
      header: 'Product',
      render: (row) => (
        <span className='font-medium text-slate-900'>
          {row.product?.title || '—'}
        </span>
      ),
    },
    {
      key: 'sku',
      header: 'SKU',
      render: (row) => row.product?.sku || '—',
    },
    {
      key: 'price',
      header: 'Price',
      render: (row) => formatCurrency(row.product?.price),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row) => formatNumber(row.quantity ?? 0),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StockStatusChip remainingStock={row.quantity ?? 0} />,
    },
    {
      key: 'assignedAt',
      header: 'Assigned',
      render: (row) => formatDate(row.createdAt),
    },
  ];

  const handleEdit = async (values) => {
    const payload = { ...values };
    if (!payload.password) delete payload.password;
    if (payload.role === 'ADMIN' && !payload.branchId) payload.branchId = null;

    const result = await updateUser(user.id, payload);
    if (result.success) {
      setEditOpen(false);
      loadUserById(user.id);
    }
  };

  if (isDetailLoading && !user) {
    return <Loader label='Loading user…' />;
  }

  if (detailStatus === 'failed' || (!user && detailStatus !== 'loading')) {
    return (
      <ErrorState
        title='Could not load user'
        description={detailError || 'User not found'}
        onRetry={() => loadUserById(id)}
      />
    );
  }

  if (!user) return null;

  const country = user.branch?.country;
  const countryLabel = country?.name ? (
    <span className='inline-flex items-center gap-2'>
      {country.code ? <CountryFlag code={country.code} /> : null}
      {country.name}
    </span>
  ) : (
    '—'
  );
  const branchLabel =
    user.branch?.name ||
    (user.role === ROLES.ADMIN ? 'All branches' : 'Not assigned');

  return (
    <div>
      <div className='mb-4'>
        <Button
          variant='ghost'
          size='sm'
          icon={ArrowLeft}
          onClick={() => navigate('/seller')}
        >
          Back to sellers
        </Button>
      </div>

      <PageHeader
        title={'Seller information'}
        description={`View and manage ${user.name}'s details and assigned products`}
        actions={
          <div className='flex flex-wrap gap-2'>
            <Button
              variant='outline'
              icon={Pencil}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              variant='danger'
              icon={Trash2}
              onClick={() => setDeleting(true)}
            >
              Delete
            </Button>
          </div>
        }
      />

      <div className='space-y-6'>
        <section className='rounded-xl border border-slate-200 bg-white p-5 sm:p-6'>
          <div className='flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-4'>
              <div className='flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-lg font-semibold text-white shadow-sm'>
                {getInitials(user.name)}
              </div>
              <div className='min-w-0'>
                <h2 className='truncate text-lg font-semibold text-slate-900'>
                  {user.name}
                </h2>
                <p className='truncate text-sm text-slate-500'>{user.email}</p>
              </div>
            </div>
            <RoleChip role={user.role} />
          </div>

          <dl className='mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            <InfoRow icon={User} label='Full name' value={user.name} />
            <InfoRow icon={Mail} label='Email' value={user.email} />

            <InfoRow icon={Globe} label='Country' value={countryLabel} />
            <InfoRow icon={Building2} label='Branch' value={branchLabel} />
            <InfoRow
              icon={Calendar}
              label='Created'
              value={formatDate(user.createdAt)}
            />
            <InfoRow
              icon={Calendar}
              label='Last updated'
              value={formatDate(user.updatedAt)}
            />
          </dl>
        </section>

        <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
          <div className='flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h3 className='flex items-center gap-2 text-sm font-semibold text-slate-900'>
                <Package className='size-4 text-slate-500' />
                Assigned products
              </h3>
              <p className='mt-0.5 text-sm text-slate-500'>
                Products currently assigned to this user
              </p>
            </div>
            {userInventorySummary && (
              <p className='text-sm text-slate-600'>
                {formatNumber(userInventorySummary.productCount)} products ·{' '}
                {formatNumber(userInventorySummary.totalQuantity)} total units
              </p>
            )}
          </div>

          {userInventoryStatus === 'failed' ? (
            <div className='p-5'>
              <ErrorState
                title='Could not load assigned products'
                description={userInventoryError}
                onRetry={() => loadUserInventory(id)}
              />
            </div>
          ) : (
            <Table
              columns={productColumns}
              data={userInventoryItems}
              keyExtractor={(row) => row.id}
              isLoading={isUserInventoryLoading}
              emptyTitle='No products assigned'
              emptyDescription='Assign stock to this user from the Inventory page.'
            />
          )}

          {!isUserInventoryLoading && userInventoryItems.length > 0 && (
            <div className='border-t border-slate-100 px-5 py-3 text-sm text-slate-500'>
              <Link
                to='/inventory'
                className='font-medium text-primary-600 hover:text-primary-700'
              >
                Manage inventory →
              </Link>
            </div>
          )}
        </section>
      </div>

      <EditUserModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        user={user}
        branches={branchOptions}
        onSubmit={handleEdit}
        isLoading={isMutating}
      />

      <ConfirmDialog
        isOpen={deleting}
        onClose={() => setDeleting(false)}
        title='Delete seller?'
        description={`This will permanently remove “${user.name}” and their inventory assignments.`}
        confirmLabel='Delete'
        isLoading={isMutating}
        onConfirm={async () => {
          const result = await deleteUser(user.id);
          if (result.success) navigate('/seller', { replace: true });
        }}
      />
    </div>
  );
}
