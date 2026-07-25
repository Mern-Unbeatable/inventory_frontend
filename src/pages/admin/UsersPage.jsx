import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { SearchBar } from '@/components/common/SearchBar.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { Pagination } from '@/components/tables/Pagination.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/forms/Input.jsx';
import { Select } from '@/components/forms/Select.jsx';
import { Modal } from '@/components/dialogs/Modal.jsx';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { RoleChip } from '@/components/ui/StatusChip.jsx';
import { useUsers } from '@/features/users/usersHooks.js';
import { useBranches } from '@/features/branches/branchesHooks.js';
import { createUserSchema, updateUserSchema } from '@/features/users/usersValidation.js';
import { formatDate } from '@/utils/format/date.js';

const ROLE_OPTIONS = [
  { value: 'SELLER', label: 'Seller' },
  { value: 'ADMIN', label: 'Admin' },
];

function UserFormModal({ isOpen, onClose, user, branches, onSubmit, isLoading }) {
  const isEdit = Boolean(user);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: { name: '', email: '', password: '', role: 'SELLER', branchId: '' },
  });

  const role = watch('role');

  useEffect(() => {
    if (!isOpen) return;
    reset(
      user
        ? {
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            branchId: user.branchId || '',
          }
        : { name: '', email: '', password: '', role: 'SELLER', branchId: '' }
    );
  }, [isOpen, user, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit user' : 'Create user'}
      description={
        isEdit ? 'Leave password blank to keep the current one' : 'Create an admin or seller account'
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input id="name" label="Name" error={errors.name?.message} {...register('name')} />
        <Input id="email" label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <Input
          id="password"
          label={isEdit ? 'New password' : 'Password'}
          type="password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Select
          id="role"
          label="Role"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          {...register('role')}
        />
        {(role === 'SELLER' || (!role && isEdit)) && (
          <Select
            id="branchId"
            label="Branch"
            placeholder="Select branch"
            options={branches}
            error={errors.branchId?.message}
            {...register('branchId')}
          />
        )}
      </form>
    </Modal>
  );
}

export default function UsersPage() {
  const navigate = useNavigate();
  const {
    items,
    meta,
    filters,
    status,
    error,
    isLoading,
    isMutating,
    loadUsers,
    updateFilters,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();

  const { items: branches, loadBranches, updateFilters: updateBranchFilters } = useBranches();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    updateBranchFilters({ page: 1, limit: 100, search: '', countryId: '' });
    loadBranches();
  }, [loadBranches, updateBranchFilters]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers, filters.page, filters.search, filters.role]);

  const branchOptions = useMemo(
    () => branches.map((b) => ({ value: b.id, label: `${b.name}${b.country?.name ? ` (${b.country.name})` : ''}` })),
    [branches]
  );

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => <span className="font-medium text-slate-900">{row.name}</span>,
    },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (row) => <RoleChip role={row.role} /> },
    {
      key: 'branch',
      header: 'Branch',
      render: (row) => row.branch?.name || '—',
    },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            title="View"
            onClick={() => navigate(`/users/${row.id}`)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Pencil}
            title="Edit"
            onClick={() => {
              setEditing(row);
              setFormOpen(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            title="Delete"
            onClick={() => setDeleting(row)}
          />
        </div>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    const payload = { ...values };
    if (editing && !payload.password) delete payload.password;
    if (payload.role === 'ADMIN' && !payload.branchId) payload.branchId = null;

    const result = editing ? await updateUser(editing.id, payload) : await createUser(payload);
    if (result.success) {
      setFormOpen(false);
      setEditing(null);
    }
  };

  if (status === 'failed' && !items.length) {
    return <ErrorState title="Could not load users" description={error} onRetry={loadUsers} />;
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description="Admins and sellers assigned to branches"
        actions={
          <Button
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add user
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-full max-w-xs">
          <Select
            value={filters.role}
            onChange={(event) => updateFilters({ role: event.target.value, page: 1 })}
            options={[
              { value: '', label: 'All roles' },
              ...ROLE_OPTIONS,
            ]}
          />
        </div>
        <div className="w-full max-w-sm">
          <SearchBar
            value={filters.search}
            placeholder="Search by name or email…"
            onSearch={(search) => updateFilters({ search, page: 1 })}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table
          columns={columns}
          data={items}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyTitle="No users yet"
          emptyDescription="Create a seller and assign them to a branch."
        />
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={(page) => updateFilters({ page })}
        />
      </div>

      <UserFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        user={editing}
        branches={branchOptions}
        onSubmit={handleSubmit}
        isLoading={isMutating}
      />

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete user?"
        description={`This will permanently remove “${deleting?.name}” and their inventory assignments.`}
        confirmLabel="Delete"
        isLoading={isMutating}
        onConfirm={async () => {
          const result = await deleteUser(deleting.id);
          if (result.success) setDeleting(null);
        }}
      />
    </div>
  );
}
