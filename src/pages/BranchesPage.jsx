import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { SearchBar } from '@/components/common/SearchBar.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { Pagination } from '@/components/tables/Pagination.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { Select } from '@/components/ui/Select.jsx';
import { Modal } from '@/components/ui/Modal.jsx';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { useBranches } from '@/features/branches/branchesHooks.js';
import { useCountries } from '@/features/countries/countriesHooks.js';
import { branchFormSchema } from '@/features/branches/branchesValidation.js';
import { formatDate } from '@/utils/format/date.js';

function BranchFormModal({ isOpen, onClose, branch, countries, onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(branchFormSchema),
    defaultValues: { name: '', code: '', countryId: '' },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      branch
        ? {
            name: branch.name || '',
            code: branch.code || '',
            countryId: branch.countryId || branch.country?.id || '',
          }
        : { name: '', code: '', countryId: '' }
    );
  }, [isOpen, branch, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={branch ? 'Edit branch' : 'Create branch'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            {branch ? 'Save changes' : 'Create branch'}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Select
          id="countryId"
          label="Country"
          placeholder="Select country"
          options={countries}
          error={errors.countryId?.message}
          {...register('countryId')}
        />
        <Input id="name" label="Branch name" error={errors.name?.message} {...register('name')} />
        <Input
          id="code"
          label="Code"
          hint="Optional short code, e.g. ADD-01"
          error={errors.code?.message}
          {...register('code')}
        />
      </form>
    </Modal>
  );
}

export default function BranchesPage() {
  const {
    items,
    meta,
    filters,
    status,
    error,
    isLoading,
    isMutating,
    loadBranches,
    updateFilters,
    createBranch,
    updateBranch,
    deleteBranch,
  } = useBranches();

  const { items: countries, loadCountries } = useCountries();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches, filters.page, filters.search, filters.countryId]);

  const countryOptions = useMemo(
    () => countries.map((c) => ({ value: c.id, label: c.name })),
    [countries]
  );

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => <span className="font-medium text-slate-900">{row.name}</span>,
    },
    {
      key: 'code',
      header: 'Code',
      render: (row) => (row.code ? <Badge color="slate">{row.code}</Badge> : '—'),
    },
    {
      key: 'country',
      header: 'Country',
      render: (row) => row.country?.name || '—',
    },
    {
      key: 'users',
      header: 'Users',
      render: (row) => row._count?.users ?? 0,
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
            icon={Pencil}
            onClick={() => {
              setEditing(row);
              setFormOpen(true);
            }}
          />
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => setDeleting(row)} />
        </div>
      ),
    },
  ];

  if (status === 'failed' && !items.length) {
    return <ErrorState title="Could not load branches" description={error} onRetry={loadBranches} />;
  }

  return (
    <div>
      <PageHeader
        title="Branches"
        description="Branches belong to a country and hold seller accounts"
        actions={
          <Button
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add branch
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-full max-w-xs">
          <Select
            value={filters.countryId}
            onChange={(event) => updateFilters({ countryId: event.target.value, page: 1 })}
            options={[{ value: '', label: 'All countries' }, ...countryOptions]}
          />
        </div>
        <div className="w-full max-w-sm">
          <SearchBar
            value={filters.search}
            placeholder="Search branches…"
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
          emptyTitle="No branches yet"
          emptyDescription="Create a country first, then add branches."
        />
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={(page) => updateFilters({ page })}
        />
      </div>

      <BranchFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        branch={editing}
        countries={countryOptions}
        onSubmit={async (values) => {
          const result = editing
            ? await updateBranch(editing.id, values)
            : await createBranch(values);
          if (result.success) {
            setFormOpen(false);
            setEditing(null);
          }
        }}
        isLoading={isMutating}
      />

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete branch?"
        description={`This will remove “${deleting?.name}”. Users may lose their branch assignment.`}
        confirmLabel="Delete"
        isLoading={isMutating}
        onConfirm={async () => {
          const result = await deleteBranch(deleting.id);
          if (result.success) setDeleting(null);
        }}
      />
    </div>
  );
}
