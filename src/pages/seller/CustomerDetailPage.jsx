import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  KeyRound,
  ShieldCheck,
  User,
  UserPlus,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { Loader } from '@/components/ui/Loader.jsx';
import { Modal } from '@/components/dialogs/Modal.jsx';
import { Input } from '@/components/forms/Input.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { useAuth } from '@/features/auth/authHooks.js';
import { useCustomers } from '@/features/customers/customersHooks.js';
import {
  portalAccountSchema,
  portalPasswordSchema,
} from '@/features/customers/customersValidation.js';
import { formatCurrency, formatNumber } from '@/utils/format/currency.js';
import { formatDate } from '@/utils/format/date.js';
import { getInitials } from '@/utils/auth/auth.utils.js';

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

function PortalAccountModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [passwordFieldKey, setPasswordFieldKey] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(portalAccountSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ email: '', password: '' });
      setPasswordFieldKey((key) => key + 1);
    }
  }, [isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Create portal account'
      description='Gives this customer read-only access to the product catalog'
      footer={
        <>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Create account
          </Button>
        </>
      }
    >
      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <Input
          id='email'
          label='Login email'
          type='email'
          error={errors.email?.message}
          disabled={isLoading}
          {...register('email')}
        />
        <Input
          key={passwordFieldKey}
          id='password'
          label='Password'
          type='password'
          showPasswordToggle
          error={errors.password?.message}
          disabled={isLoading}
          {...register('password')}
        />
      </form>
    </Modal>
  );
}

function PortalPasswordModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [passwordFieldKey, setPasswordFieldKey] = useState(0);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(portalPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ password: '', confirmPassword: '' });
      setPasswordFieldKey((key) => key + 1);
    }
  }, [isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Edit portal password'
      description='Set a new login password for this customer portal account'
      footer={
        <>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Update password
          </Button>
        </>
      }
    >
      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <Input
          key={`password-${passwordFieldKey}`}
          id='portal-new-password'
          label='New password'
          type='password'
          showPasswordToggle
          error={errors.password?.message}
          disabled={isLoading}
          autoComplete='new-password'
          {...register('password')}
        />
        <Input
          key={`confirm-${passwordFieldKey}`}
          id='portal-confirm-password'
          label='Confirm password'
          type='password'
          showPasswordToggle
          error={errors.confirmPassword?.message}
          disabled={isLoading}
          autoComplete='new-password'
          {...register('confirmPassword')}
        />
      </form>
    </Modal>
  );
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const {
    current: customer,
    invoices,
    purchaseHistory,
    detailStatus,
    detailError,
    isDetailLoading,
    isMutating,
    loadCustomerById,
    clearCustomer,
    loadCustomerInvoices,
    loadCustomerPurchaseHistory,
    createPortalAccount,
    updatePortalPassword,
  } = useCustomers();

  const [portalOpen, setPortalOpen] = useState(false);
  const [portalPasswordOpen, setPortalPasswordOpen] = useState(false);

  useEffect(() => {
    if (!id) return undefined;
    loadCustomerById(id);
    loadCustomerInvoices(id, { page: 1, limit: 10 });
    loadCustomerPurchaseHistory(id, { page: 1, limit: 10 });
    return () => clearCustomer();
  }, [
    id,
    loadCustomerById,
    loadCustomerInvoices,
    loadCustomerPurchaseHistory,
    clearCustomer,
  ]);

  const invoiceColumns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (row) => (
        <button
          type='button'
          className='font-medium text-primary-600 hover:text-primary-700'
          onClick={() => navigate(`/invoices/${row.id}`)}
        >
          {row.invoiceNumber}
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge
          color={
            row.status === 'CONFIRMED'
              ? 'green'
              : row.status === 'CANCELLED'
                ? 'red'
                : 'slate'
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (row) => (
        <Badge
          color={
            row.paymentStatus === 'PAID'
              ? 'green'
              : row.paymentStatus === 'PARTIALLY_PAID'
                ? 'amber'
                : 'slate'
          }
        >
          {row.paymentStatus}
        </Badge>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Total',
      render: (row) => formatCurrency(row.totalAmount),
    },
    {
      key: 'dueAmount',
      header: 'Due',
      render: (row) => formatCurrency(row.dueAmount),
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (row) => formatDate(row.createdAt),
    },
  ];

  const historyColumns = [
    {
      key: 'product',
      header: 'Product',
      render: (row) => row.product?.title || '—',
    },
    {
      key: 'quantity',
      header: 'Qty',
      render: (row) => formatNumber(row.quantity),
    },
    {
      key: 'unitPrice',
      header: 'Unit price',
      render: (row) => formatCurrency(row.unitPrice),
    },
    {
      key: 'lineTotal',
      header: 'Line total',
      render: (row) => formatCurrency(row.lineTotal),
    },
    {
      key: 'invoice',
      header: 'Invoice',
      render: (row) => row.invoice?.invoiceNumber || '—',
    },
    {
      key: 'confirmedAt',
      header: 'Date',
      render: (row) => formatDate(row.invoice?.confirmedAt),
    },
  ];

  if (isDetailLoading && !customer) return <Loader label='Loading customer…' />;

  if (detailStatus === 'failed' || (!customer && detailStatus !== 'loading')) {
    return (
      <ErrorState
        title='Could not load customer'
        description={detailError || 'Customer not found'}
        onRetry={() => loadCustomerById(id)}
      />
    );
  }

  if (!customer) return null;

  return (
    <div>
      <div className='mb-4'>
        <Button
          variant='ghost'
          size='sm'
          icon={ArrowLeft}
          onClick={() => navigate('/customers')}
        >
          Back to customers
        </Button>
      </div>

      <PageHeader
        title='Customer profile'
        description={`View ${customer.name}'s details, invoices, and purchase history`}
        actions={
          isAdmin && !customer.userId ? (
            <Button icon={UserPlus} onClick={() => setPortalOpen(true)}>
              Create portal account
            </Button>
          ) : isAdmin && customer.userId ? (
            <Button
              variant='outline'
              icon={KeyRound}
              onClick={() => setPortalPasswordOpen(true)}
            >
              Edit portal password
            </Button>
          ) : null
        }
      />

      {/* Two column layout: Left = Invoices + Purchase History, Right = Customer Info */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Left Column - Invoices and Purchase History (Takes 2/3 of the space) */}
        <div className='space-y-6 lg:col-span-2'>
          {/* Invoices Section */}
          <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
            <div className='flex items-center gap-2 border-b border-slate-200 px-5 py-4'>
              <FileText className='size-4 text-slate-500' />
              <h3 className='text-sm font-semibold text-slate-900'>Invoices</h3>
            </div>
            <Table
              columns={invoiceColumns}
              data={invoices.items}
              keyExtractor={(row) => row.id}
              isLoading={invoices.status === 'loading'}
              emptyTitle='No invoices yet'
              emptyDescription='Create an invoice for this customer from the Invoices page.'
            />
          </section>

          {/* Purchase History Section */}
          <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-5 py-4'>
              <h3 className='text-sm font-semibold text-slate-900'>
                Purchase history
              </h3>
              <p className='mt-0.5 text-sm text-slate-500'>
                Line items from confirmed invoices
              </p>
            </div>
            <Table
              columns={historyColumns}
              data={purchaseHistory.items}
              keyExtractor={(row) => row.id}
              isLoading={purchaseHistory.status === 'loading'}
              emptyTitle='No purchases yet'
              emptyDescription='Purchases appear here once invoices are confirmed.'
            />
          </section>
        </div>

        {/* Right Column - Customer Info (Takes 1/3 of the space) */}
        <div className='lg:col-span-1'>
          <section className='rounded-xl border border-slate-200 bg-white p-5 sm:p-6'>
            <div className='flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-4'>
                <div className='flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-lg font-semibold text-white shadow-sm'>
                  {getInitials(customer.name)}
                </div>
                <div className='min-w-0'>
                  <h2 className='truncate text-lg font-semibold text-slate-900'>
                    {customer.name}
                  </h2>
                  <p className='truncate text-sm text-slate-500'>
                    {customer.email || 'No email on file'}
                  </p>
                </div>
              </div>
              <Badge color={customer.userId ? 'green' : 'slate'}>
                {customer.userId ? 'Portal linked' : 'No portal login'}
              </Badge>
            </div>

            <dl className='mt-5 grid gap-4 grid-cols-2'>
              <InfoRow
                icon={Globe}
                label='Country'
                value={customer.country?.name}
              />
              <InfoRow
                icon={Building2}
                label='Branch'
                value={customer.branch?.name}
              />
              <InfoRow
                icon={User}
                label='Created by'
                value={customer.creator?.name}
              />

              <InfoRow
                icon={Calendar}
                label='Created at'
                value={formatDate(customer.createdAt)}
              />
              <InfoRow icon={Mail} label='Email' value={customer.email} />
              <InfoRow icon={Phone} label='Phone' value={customer.phone} />
              <InfoRow icon={MapPin} label='Address' value={customer.address} />
              <InfoRow
                icon={DollarSign}
                label='Outstanding balance'
                value={formatCurrency(customer.outstandingBalance ?? 0)}
              />
            </dl>

            {customer.notes && (
              <div className='mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600'>
                <p className='mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500'>
                  <ShieldCheck className='size-3.5' /> Notes
                </p>
                {customer.notes}
              </div>
            )}
          </section>
        </div>
      </div>

      <PortalAccountModal
        isOpen={portalOpen}
        onClose={() => setPortalOpen(false)}
        isLoading={isMutating}
        onSubmit={async (values) => {
          const result = await createPortalAccount(customer.id, values);
          if (result.success) {
            setPortalOpen(false);
            loadCustomerById(customer.id);
          }
        }}
      />

      <PortalPasswordModal
        isOpen={portalPasswordOpen}
        onClose={() => setPortalPasswordOpen(false)}
        isLoading={isMutating}
        onSubmit={async (values) => {
          const result = await updatePortalPassword(customer.id, {
            password: values.password,
          });
          if (result.success) {
            setPortalPasswordOpen(false);
          }
        }}
      />
    </div>
  );
}
