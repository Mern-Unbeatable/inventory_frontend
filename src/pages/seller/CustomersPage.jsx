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
import { Textarea } from '@/components/forms/Textarea.jsx';
import { Select } from '@/components/forms/Select.jsx';
import { Modal } from '@/components/dialogs/Modal.jsx';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { useAuth } from '@/features/auth/authHooks.js';
import { useCustomers } from '@/features/customers/customersHooks.js';
import { useCountries } from '@/features/countries/countriesHooks.js';
import { useBranches } from '@/features/branches/branchesHooks.js';
import { customerFormSchema } from '@/features/customers/customersValidation.js';

function CustomerFormModal({
  isOpen,
  onClose,
  customer,
  onSubmit,
  isLoading,
  isAdmin,
  sellerCountryId,
  sellerBranchId,
}) {
  const { items: countries, loadCountries } = useCountries();
  const { items: branches, loadBranches, updateFilters: updateBranchFilters } =
    useBranches();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      countryId: '',
      branchId: '',
    },
  });

  const selectedCountryId = watch('countryId');

  useEffect(() => {
    if (!isOpen) return;
    loadCountries();
  }, [isOpen, loadCountries]);

  useEffect(() => {
    if (!isOpen) return;

    if (customer) {
      reset({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        notes: customer.notes || '',
        countryId: customer.countryId || customer.country?.id || '',
        branchId: customer.branchId || customer.branch?.id || '',
      });
      return;
    }

    reset({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      countryId: isAdmin ? '' : sellerCountryId || '',
      branchId: isAdmin ? '' : sellerBranchId || '',
    });
  }, [isOpen, customer, reset, isAdmin, sellerCountryId, sellerBranchId]);

  useEffect(() => {
    if (!isOpen || !selectedCountryId) return;
    updateBranchFilters({ page: 1, limit: 100, countryId: selectedCountryId, search: '' });
    loadBranches();
  }, [isOpen, selectedCountryId, loadBranches, updateBranchFilters]);

  const countryOptions = useMemo(
    () => countries.map((country) => ({ value: country.id, label: country.name })),
    [countries],
  );

  const branchOptions = useMemo(
    () => branches.map((branch) => ({ value: branch.id, label: branch.name })),
    [branches],
  );

  const lockLocation = !isAdmin;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'Edit customer' : 'Add customer'}
      description='CRM contact used for invoicing'
      size='lg'
      footer={
        <>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            {customer ? 'Save changes' : 'Create customer'}
          </Button>
        </>
      }
    >
      <form
        className='grid gap-4 sm:grid-cols-2'
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          id='name'
          label='Name'
          containerClassName='sm:col-span-2'
          error={errors.name?.message}
          disabled={isLoading}
          {...register('name')}
        />
        <Input
          id='email'
          label='Email'
          type='email'
          error={errors.email?.message}
          disabled={isLoading}
          {...register('email')}
        />
        <Input
          id='phone'
          label='Phone'
          error={errors.phone?.message}
          disabled={isLoading}
          {...register('phone')}
        />
        <Select
          id='countryId'
          label='Country'
          placeholder='Select country'
          options={countryOptions}
          error={errors.countryId?.message}
          disabled={isLoading || lockLocation}
          {...register('countryId', {
            onChange: (event) => {
              setValue('countryId', event.target.value);
              setValue('branchId', '');
            },
          })}
        />
        <Select
          id='branchId'
          label='Branch'
          placeholder={selectedCountryId ? 'Select branch' : 'Select a country first'}
          options={branchOptions}
          error={errors.branchId?.message}
          disabled={isLoading || lockLocation || !selectedCountryId}
          {...register('branchId')}
        />
        <Textarea
          id='address'
          label='Address'
          containerClassName='sm:col-span-2'
          error={errors.address?.message}
          disabled={isLoading}
          {...register('address')}
        />
        <Textarea
          id='notes'
          label='Notes'
          containerClassName='sm:col-span-2'
          error={errors.notes?.message}
          disabled={isLoading}
          {...register('notes')}
        />
      </form>
    </Modal>
  );
}

export default function CustomersPage() {
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const sellerCountryId = user?.branch?.countryId || user?.branch?.country?.id || '';
  const sellerBranchId = user?.branchId || '';

  const {
    items,
    meta,
    filters,
    status,
    error,
    isLoading,
    isMutating,
    loadCustomers,
    updateFilters,
    createCustomer,
    updateCustomer,
    deleteCustomer,
  } = useCustomers();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers, filters.page, filters.search]);

  const columns = [
    {
      key: 'name',
      header: 'Name',
      className: 'min-w-[10rem] max-w-[14rem] whitespace-normal',
      render: (row) => (
        <button
          type='button'
          className='truncate text-left font-medium text-primary-600 hover:text-primary-700'
          onClick={() => navigate(`/customers/${row.id}`)}
        >
          {row.name}
        </button>
      ),
    },
    {
      key: 'country',
      header: 'Country',
      render: (row) => row.country?.name || '—',
    },
    {
      key: 'branch',
      header: 'Branch',
      render: (row) => row.branch?.name || '—',
    },
    {
      key: 'createdBy',
      header: 'Created By',
      className: 'min-w-[8rem] max-w-[12rem] !whitespace-normal',
      render: (row) => (
        <div className='min-w-0'>
          <p className='truncate font-medium text-slate-900'>
            {row.creator?.name || '—'}
          </p>
          {row.creator?.role ? (
            <p className='text-xs text-slate-500'>({row.creator.role})</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      className: 'min-w-[10rem]',
      render: (row) => (
        <div className='min-w-0'>
          <p className='truncate text-slate-700'>{row.email || '—'}</p>
          <p className='truncate text-xs text-slate-500'>
            {row.phone || 'No phone'}
          </p>
        </div>
      ),
    },
    {
      key: 'portal',
      header: 'Portal login',
      render: (row) => (
        <span className={row.userId ? 'text-green-600' : 'text-slate-400'}>
          {row.userId ? 'Linked' : 'None'}
        </span>
      ),
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
            icon={Eye}
            title='View'
            onClick={() => navigate(`/customers/${row.id}`)}
          />
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
          {isAdmin && (
            <Button
              variant='ghost'
              size='sm'
              icon={Trash2}
              title='Delete'
              onClick={() => setDeleting(row)}
            />
          )}
        </div>
      ),
    },
  ];

  const handleSubmit = async (values) => {
    const result = editing
      ? await updateCustomer(editing.id, values)
      : await createCustomer(values);
    if (result.success) {
      setFormOpen(false);
      setEditing(null);
    }
  };

  if (status === 'failed' && !items.length) {
    return (
      <ErrorState
        title='Could not load customers'
        description={error}
        onRetry={loadCustomers}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title='Customers'
        description='CRM contacts used for invoicing — optionally linked to a portal login'
        actions={
          <Button
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add customer
          </Button>
        }
      />

      <div className='mb-4 max-w-sm'>
        <SearchBar
          value={filters.search}
          placeholder='Search by name, email, or phone…'
          onSearch={(search) => updateFilters({ search, page: 1 })}
        />
      </div>

      <div className='border border-slate-200 rounded-xl bg-white'>
        <Table
          columns={columns}
          data={items}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          minWidthClassName='min-w-[56rem]'
          emptyTitle='No customers yet'
          emptyDescription='Add your first customer to start creating invoices.'
        />
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={(page) => updateFilters({ page })}
        />
      </div>

      <CustomerFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        customer={editing}
        onSubmit={handleSubmit}
        isLoading={isMutating}
        isAdmin={isAdmin}
        sellerCountryId={sellerCountryId}
        sellerBranchId={sellerBranchId}
      />

      <ConfirmDialog
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title='Delete customer?'
        description={`This removes "${deleting?.name}" — blocked if they have existing invoices.`}
        confirmLabel='Delete'
        isLoading={isMutating}
        onConfirm={async () => {
          const result = await deleteCustomer(deleting.id);
          if (result.success) setDeleting(null);
        }}
      />
    </div>
  );
}
