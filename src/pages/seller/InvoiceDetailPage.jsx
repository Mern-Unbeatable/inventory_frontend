import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  BadgeCheck,
  Ban,
  CreditCard,
  Download,
  Pencil,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/forms/Input.jsx';
import { Textarea } from '@/components/forms/Textarea.jsx';
import { Select } from '@/components/forms/Select.jsx';
import { Modal } from '@/components/dialogs/Modal.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { Loader } from '@/components/ui/Loader.jsx';
import { useAuth } from '@/features/auth/authHooks.js';
import { useInvoices } from '@/features/invoices/invoicesHooks.js';
import { usePayments } from '@/features/payments/paymentsHooks.js';
import {
  paymentFormSchema,
  PAYMENT_METHODS,
} from '@/features/payments/paymentsValidation.js';
import { buildEditInvoiceSchema } from '@/features/invoices/invoicesValidation.js';
import { InvoiceLineItemsEditor } from '@/features/invoices/InvoiceLineItemsEditor.jsx';
import { mapInventoryToProductOptions } from '@/features/invoices/invoiceItemsUtils.js';
import { inventoryService } from '@/features/inventory/inventoryService.js';
import { formatCurrency } from '@/utils/format/currency.js';
import { formatDate, formatDateTime } from '@/utils/format/date.js';

const STATUS_TONE = { DRAFT: 'slate', CONFIRMED: 'green', CANCELLED: 'red' };
const PAYMENT_TONE = {
  UNPAID: 'slate',
  PARTIALLY_PAID: 'amber',
  PAID: 'green',
};

function EditInvoiceModal({ isOpen, onClose, invoice, onSubmit, isLoading }) {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: (values, context, options) => {
      const selectedIds = (values.items || [])
        .map((item) => item?.productId)
        .filter(Boolean);
      const optionsForSchema = mapInventoryToProductOptions(
        inventoryItems,
        selectedIds,
      );
      return zodResolver(buildEditInvoiceSchema(optionsForSchema))(
        values,
        context,
        options,
      );
    },
    defaultValues: { notes: '', items: [] },
  });

  const watchedItems = watch('items');

  useEffect(() => {
    if (isOpen && invoice) {
      reset({
        notes: invoice.notes || '',
        items: invoice.items?.length
          ? invoice.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            }))
          : [],
      });
    }
  }, [isOpen, invoice, reset]);

  useEffect(() => {
    if (!isOpen || !invoice?.sellerId) {
      setInventoryItems([]);
      return undefined;
    }

    let cancelled = false;
    setStockLoading(true);

    inventoryService
      .getUserInventory(invoice.sellerId)
      .then((payload) => {
        if (!cancelled) setInventoryItems(payload?.items || []);
      })
      .catch(() => {
        if (!cancelled) setInventoryItems([]);
      })
      .finally(() => {
        if (!cancelled) setStockLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, invoice?.sellerId]);

  const selectedIds = useMemo(
    () => (watchedItems || []).map((item) => item?.productId).filter(Boolean),
    [watchedItems],
  );

  const productOptions = useMemo(
    () => mapInventoryToProductOptions(inventoryItems, selectedIds),
    [inventoryItems, selectedIds],
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (pickerOpen) return;
        onClose?.();
      }}
      closeOnBackdrop={false}
      blurBackdrop={!pickerOpen}
      title='Edit draft invoice'
      description='Only draft invoices can be edited — quantities cannot exceed seller stock'
      size='xl'
      footer={
        <>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={isLoading || pickerOpen}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={pickerOpen}
          >
            Save changes
          </Button>
        </>
      }
    >
      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <InvoiceLineItemsEditor
          control={control}
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
          productOptions={productOptions}
          stockLoading={stockLoading}
          onPickerOpenChange={setPickerOpen}
          emptyStockMessage='This seller has no in-stock assigned products.'
        />
        <Textarea
          id='notes'
          label='Notes'
          error={errors.notes?.message}
          {...register('notes')}
        />
      </form>
    </Modal>
  );
}

function RecordPaymentModal({ isOpen, onClose, invoice, onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: { amount: 0, paymentMethod: 'CASH', notes: '' },
  });

  useEffect(() => {
    if (isOpen)
      reset({
        amount: invoice?.dueAmount ?? 0,
        paymentMethod: 'CASH',
        notes: '',
      });
  }, [isOpen, invoice, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Record payment'
      description={
        invoice
          ? `Due balance: ${formatCurrency(invoice.dueAmount)}`
          : undefined
      }
      footer={
        <>
          <Button variant='outline' onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Record payment
          </Button>
        </>
      }
    >
      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <Input
          id='amount'
          label='Amount'
          type='number'
          step='0.01'
          error={errors.amount?.message}
          {...register('amount')}
        />
        <Select
          id='paymentMethod'
          label='Payment method'
          options={PAYMENT_METHODS.map((m) => ({
            value: m,
            label: m.replace('_', ' '),
          }))}
          error={errors.paymentMethod?.message}
          {...register('paymentMethod')}
        />
        <Textarea
          id='notes'
          label='Notes'
          error={errors.notes?.message}
          {...register('notes')}
        />
      </form>
    </Modal>
  );
}

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const {
    current: invoice,
    detailStatus,
    detailError,
    isDetailLoading,
    isMutating,
    loadInvoiceById,
    clearInvoice,
    updateInvoice,
    confirmInvoice,
    cancelInvoice,
    deleteInvoice,
    downloadInvoicePdf,
    pdfDownloadingId,
  } = useInvoices();
  const {
    items: payments,
    isLoading: isPaymentsLoading,
    isMutating: isPaymentMutating,
    loadPayments,
    clear: clearPayments,
    recordPayment,
    removePayment,
  } = usePayments();
  const [editOpen, setEditOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reversing, setReversing] = useState(null);

  useEffect(() => {
    if (!id) return undefined;
    loadInvoiceById(id);
    loadPayments(id);
    return () => {
      clearInvoice();
      clearPayments();
    };
  }, [id, loadInvoiceById, loadPayments, clearInvoice, clearPayments]);

  const itemColumns = [
    {
      key: 'product',
      header: 'Product',
      render: (row) => row.product?.title || '—',
    },
    { key: 'sku', header: 'SKU', render: (row) => row.product?.sku || '—' },
    { key: 'quantity', header: 'Qty', render: (row) => row.quantity },
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
  ];

  const paymentColumns = [
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => formatCurrency(row.amount),
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (row) => row.paymentMethod?.replace('_', ' '),
    },
    { key: 'notes', header: 'Notes', render: (row) => row.notes || '—' },
    {
      key: 'paymentDate',
      header: 'Date',
      render: (row) => formatDateTime(row.paymentDate),
    },
    ...(isAdmin
      ? [
          {
            key: 'actions',
            header: '',
            sticky: 'right',
            render: (row) => (
              <Button
                variant='ghost'
                size='sm'
                icon={Trash2}
                title='Reverse'
                onClick={() => setReversing(row)}
              />
            ),
          },
        ]
      : []),
  ];

  if (isDetailLoading && !invoice) return <Loader label='Loading invoice…' />;

  if (detailStatus === 'failed' || (!invoice && detailStatus !== 'loading')) {
    return (
      <ErrorState
        title='Could not load invoice'
        description={detailError || 'Invoice not found'}
        onRetry={() => loadInvoiceById(id)}
      />
    );
  }

  if (!invoice) return null;

  const isDraft = invoice.status === 'DRAFT';
  const isConfirmed = invoice.status === 'CONFIRMED';

  return (
    <div>
      <div className='mb-4'>
        <Button
          variant='ghost'
          size='sm'
          icon={ArrowLeft}
          onClick={() => navigate('/invoices')}
        >
          Back to invoices
        </Button>
      </div>

      <PageHeader
        title={invoice.invoiceNumber}
        description={`Customer: ${invoice.customer?.name || '—'} · Seller: ${invoice.seller?.name || '—'}`}
        actions={
          <div className='flex flex-wrap gap-2'>
            {isDraft && (
              <>
                <Button
                  variant='submit'
                  icon={BadgeCheck}
                  onClick={() => confirmInvoice(invoice.id)}
                  isLoading={isMutating}
                >
                  Confirm
                </Button>
                {isAdmin && (
                  <Button
                    variant='danger'
                    icon={Trash2}
                    onClick={() => setDeleting(true)}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  variant='outline'
                  icon={Pencil}
                  onClick={() => setEditOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant='outline'
                  icon={Ban}
                  onClick={() => setCancelling(true)}
                >
                  Cancel
                </Button>
              </>
            )}
            {isConfirmed && invoice.dueAmount > 0 && (
              <Button icon={CreditCard} onClick={() => setPaymentOpen(true)}>
                Record payment
              </Button>
            )}
          </div>
        }
      />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='space-y-6 lg:col-span-2'>
          <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-5 py-4'>
              <h3 className='text-sm font-semibold text-slate-900'>Items</h3>
            </div>
            <Table
              columns={itemColumns}
              data={invoice.items || []}
              keyExtractor={(row) => row.id}
              emptyTitle='No items'
            />
          </section>

          <section className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
            <div className='border-b border-slate-200 px-5 py-4'>
              <h3 className='text-sm font-semibold text-slate-900'>
                Payment history
              </h3>
              <p className='mt-0.5 text-sm text-slate-500'>
                Full, partial, or installment payments recorded against this
                invoice
              </p>
            </div>
            <Table
              columns={paymentColumns}
              data={payments}
              keyExtractor={(row) => row.id}
              isLoading={isPaymentsLoading}
              emptyTitle='No payments yet'
              emptyDescription={
                isConfirmed
                  ? 'Record the first payment for this invoice.'
                  : 'Confirm the invoice before recording payments.'
              }
            />
          </section>
        </div>

        <div className='space-y-4'>
          <section className='rounded-xl border border-slate-200 bg-white p-5 sm:p-6'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge color={STATUS_TONE[invoice.status] || 'slate'}>
                {invoice.status}
              </Badge>
              <Badge color={PAYMENT_TONE[invoice.paymentStatus] || 'slate'}>
                {invoice.paymentStatus}
              </Badge>
            </div>

            <dl className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-2'>
              <div className='rounded-lg bg-slate-50 px-4 py-3'>
                <dt className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Total
                </dt>
                <dd className='mt-1 text-sm font-semibold text-slate-900'>
                  {formatCurrency(invoice.totalAmount)}
                </dd>
              </div>
              <div className='rounded-lg bg-slate-50 px-4 py-3'>
                <dt className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Paid
                </dt>
                <dd className='mt-1 text-sm font-semibold text-green-600'>
                  {formatCurrency(invoice.paidAmount)}
                </dd>
              </div>
              <div className='rounded-lg bg-slate-50 px-4 py-3'>
                <dt className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Due
                </dt>
                <dd className='mt-1 text-sm font-semibold text-amber-600'>
                  {formatCurrency(invoice.dueAmount)}
                </dd>
              </div>
              <div className='rounded-lg bg-slate-50 px-4 py-3'>
                <dt className='text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Created
                </dt>
                <dd className='mt-1 text-sm font-semibold text-slate-900'>
                  {formatDate(invoice.createdAt)}
                </dd>
              </div>
            </dl>

            {invoice.notes && (
              <div className='mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600'>
                <p className='mb-1 text-xs font-medium uppercase tracking-wide text-slate-500'>
                  Notes
                </p>
                {invoice.notes}
              </div>
            )}
          </section>
          <div className='flex justify-end'>
            <Button
              variant='primary'
              icon={Download}
              isLoading={pdfDownloadingId === invoice.id}
              onClick={() =>
                downloadInvoicePdf(invoice.id, invoice.invoiceNumber)
              }
            >
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <EditInvoiceModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        invoice={invoice}
        isLoading={isMutating}
        onSubmit={async (values) => {
          const result = await updateInvoice(invoice.id, {
            notes: values.notes || undefined,
            items: values.items.map((item) => ({
              productId: item.productId,
              quantity: Number(item.quantity),
            })),
          });
          if (result.success) setEditOpen(false);
        }}
      />

      <RecordPaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        invoice={invoice}
        isLoading={isPaymentMutating}
        onSubmit={async (values) => {
          const result = await recordPayment({
            invoiceId: invoice.id,
            amount: Number(values.amount),
            paymentMethod: values.paymentMethod,
            notes: values.notes || undefined,
          });
          if (result.success) {
            setPaymentOpen(false);
            loadInvoiceById(invoice.id);
          }
        }}
      />

      <ConfirmDialog
        isOpen={cancelling}
        onClose={() => setCancelling(false)}
        title='Cancel invoice?'
        description='This draft invoice will be marked as cancelled. No stock has been affected.'
        confirmLabel='Cancel invoice'
        isLoading={isMutating}
        onConfirm={async () => {
          const result = await cancelInvoice(invoice.id);
          if (result.success) setCancelling(false);
        }}
      />

      <ConfirmDialog
        isOpen={deleting}
        onClose={() => setDeleting(false)}
        title='Delete invoice?'
        description='This permanently removes this draft invoice and its items.'
        confirmLabel='Delete'
        isLoading={isMutating}
        onConfirm={async () => {
          const result = await deleteInvoice(invoice.id);
          if (result.success) navigate('/invoices', { replace: true });
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(reversing)}
        onClose={() => setReversing(null)}
        title='Reverse payment?'
        description={`This removes the ${formatCurrency(reversing?.amount)} payment and recalculates the invoice balance.`}
        confirmLabel='Reverse'
        isLoading={isPaymentMutating}
        onConfirm={async () => {
          const result = await removePayment(reversing.id, invoice.id);
          if (result.success) {
            setReversing(null);
            loadInvoiceById(invoice.id);
          }
        }}
      />
    </div>
  );
}
