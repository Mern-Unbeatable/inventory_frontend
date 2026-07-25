import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { SearchBar } from '@/components/common/SearchBar.jsx';
import { Table } from '@/components/tables/Table.jsx';
import { Pagination } from '@/components/tables/Pagination.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/forms/Input.jsx';
import { Textarea } from '@/components/forms/Textarea.jsx';
import { Select } from '@/components/forms/Select.jsx';
import { Modal } from '@/components/dialogs/Modal.jsx';
import { Badge } from '@/components/ui/Badge.jsx';
import { ErrorState } from '@/components/ui/ErrorState.jsx';
import { useAuth } from '@/features/auth/authHooks.js';
import { useInvoices } from '@/features/invoices/invoicesHooks.js';
import { invoiceFormSchema } from '@/features/invoices/invoicesValidation.js';
import { useCustomers } from '@/features/customers/customersHooks.js';
import { useProducts } from '@/features/products/productsHooks.js';
import { useUsers } from '@/features/users/usersHooks.js';
import { formatCurrency } from '@/utils/format/currency.js';
import { formatDate } from '@/utils/format/date.js';

const STATUS_TONE = { DRAFT: 'slate', CONFIRMED: 'green', CANCELLED: 'red' };
const PAYMENT_TONE = { UNPAID: 'slate', PARTIALLY_PAID: 'amber', PAID: 'green' };

function CreateInvoiceModal({ isOpen, onClose, onSubmit, isLoading, customerOptions, sellerOptions, productOptions, isAdmin }) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: { customerId: '', sellerId: '', notes: '', items: [{ productId: '', quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');

  useEffect(() => {
    if (isOpen) {
      reset({ customerId: '', sellerId: '', notes: '', items: [{ productId: '', quantity: 1 }] });
    }
  }, [isOpen, reset]);

  const productMap = useMemo(
    () => new Map(productOptions.map((p) => [p.value, p])),
    [productOptions]
  );

  const grandTotal = (watchedItems || []).reduce((sum, item) => {
    const product = productMap.get(item.productId);
    const qty = Number(item.quantity) || 0;
    return sum + (product?.price ?? 0) * qty;
  }, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create invoice"
      description="Created as a DRAFT — confirm it later to deduct stock"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            Create draft
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="customerId"
            label="Customer"
            placeholder="Select customer"
            options={customerOptions}
            error={errors.customerId?.message}
            {...register('customerId')}
          />
          {isAdmin ? (
            <Select
              id="sellerId"
              label="Seller"
              placeholder="Select seller"
              options={sellerOptions}
              error={errors.sellerId?.message}
              {...register('sellerId')}
            />
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Items</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={Plus}
              onClick={() => append({ productId: '', quantity: 1 })}
            >
              Add item
            </Button>
          </div>
          <div className="space-y-3">
            {fields.map((field, index) => {
              const selectedProduct = productMap.get(watchedItems?.[index]?.productId);
              return (
                <div key={field.id} className="grid gap-2 sm:grid-cols-[1fr_7rem_auto] sm:items-start">
                  <Select
                    placeholder="Select product"
                    options={productOptions}
                    error={errors.items?.[index]?.productId?.message}
                    {...register(`items.${index}.productId`)}
                  />
                  <Input
                    type="number"
                    min={1}
                    placeholder="Qty"
                    hint={selectedProduct ? formatCurrency(selectedProduct.price) : undefined}
                    error={errors.items?.[index]?.quantity?.message}
                    {...register(`items.${index}.quantity`)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                  />
                </div>
              );
            })}
          </div>
          {errors.items?.message && (
            <p className="mt-1.5 text-xs text-red-600">{errors.items.message}</p>
          )}
        </div>

        <Textarea id="notes" label="Notes" error={errors.notes?.message} {...register('notes')} />

        <div className="rounded-lg bg-slate-50 px-4 py-3 text-right text-sm">
          <span className="text-slate-500">Estimated total: </span>
          <span className="font-semibold text-slate-900">{formatCurrency(grandTotal)}</span>
        </div>
      </form>
    </Modal>
  );
}

export default function InvoicesPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const {
    items,
    meta,
    filters,
    status,
    error,
    isLoading,
    isMutating,
    loadInvoices,
    updateFilters,
    createInvoice,
  } = useInvoices();

  const { items: customers, loadCustomers, updateFilters: updateCustomerFilters } = useCustomers();
  const { items: products, loadProducts, updateFilters: updateProductFilters } = useProducts();
  const { items: users, loadUsers, updateFilters: updateUserFilters } = useUsers();

  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices, filters.page, filters.status, filters.paymentStatus, filters.search]);

  useEffect(() => {
    updateCustomerFilters({ page: 1, limit: 100, search: '' });
    updateProductFilters({ page: 1, limit: 100, search: '' });
    loadCustomers();
    loadProducts();
    if (isAdmin) {
      updateUserFilters({ page: 1, limit: 100, search: '', role: 'SELLER' });
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const customerOptions = useMemo(
    () => customers.map((c) => ({ value: c.id, label: c.name })),
    [customers]
  );
  const sellerOptions = useMemo(
    () => users.filter((u) => u.role === 'SELLER').map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
    [users]
  );
  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: `${p.title} (${p.sku})`, price: p.price })),
    [products]
  );

  const columns = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (row) => (
        <button
          type="button"
          className="font-medium text-primary-600 hover:text-primary-700"
          onClick={() => navigate(`/invoices/${row.id}`)}
        >
          {row.invoiceNumber}
        </button>
      ),
    },
    { key: 'customer', header: 'Customer', render: (row) => row.customer?.name || '—' },
    ...(isAdmin ? [{ key: 'seller', header: 'Seller', render: (row) => row.seller?.name || '—' }] : []),
    {
      key: 'status',
      header: 'Status',
      render: (row) => <Badge color={STATUS_TONE[row.status] || 'slate'}>{row.status}</Badge>,
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (row) => <Badge color={PAYMENT_TONE[row.paymentStatus] || 'slate'}>{row.paymentStatus}</Badge>,
    },
    { key: 'totalAmount', header: 'Total', render: (row) => formatCurrency(row.totalAmount) },
    { key: 'dueAmount', header: 'Due', render: (row) => formatCurrency(row.dueAmount) },
    { key: 'createdAt', header: 'Created', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      sticky: 'right',
      render: (row) => (
        <Button variant="ghost" size="sm" icon={Eye} title="View" onClick={() => navigate(`/invoices/${row.id}`)} />
      ),
    },
  ];

  if (status === 'failed' && !items.length) {
    return <ErrorState title="Could not load invoices" description={error} onRetry={loadInvoices} />;
  }

  return (
    <div>
      <PageHeader
        title="Invoices"
        description={isAdmin ? 'All invoices across every seller' : 'Your invoices'}
        actions={
          <Button
            icon={Plus}
            onClick={() => setFormOpen(true)}
            disabled={!customerOptions.length || !productOptions.length}
          >
            Create invoice
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-2xl">
        <SearchBar
          value={filters.search}
          placeholder="Search invoice # or customer…"
          onSearch={(search) => updateFilters({ search, page: 1 })}
        />
        <Select
          value={filters.status}
          onChange={(event) => updateFilters({ status: event.target.value, page: 1 })}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ]}
        />
        <Select
          value={filters.paymentStatus}
          onChange={(event) => updateFilters({ paymentStatus: event.target.value, page: 1 })}
          options={[
            { value: '', label: 'All payment statuses' },
            { value: 'UNPAID', label: 'Unpaid' },
            { value: 'PARTIALLY_PAID', label: 'Partially paid' },
            { value: 'PAID', label: 'Paid' },
          ]}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table
          columns={columns}
          data={items}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          minWidthClassName="min-w-[56rem]"
          emptyTitle="No invoices yet"
          emptyDescription="Create your first invoice for a customer."
        />
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={(page) => updateFilters({ page })}
        />
      </div>

      <CreateInvoiceModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        isLoading={isMutating}
        customerOptions={customerOptions}
        sellerOptions={sellerOptions}
        productOptions={productOptions}
        isAdmin={isAdmin}
        onSubmit={async (values) => {
          const payload = {
            customerId: values.customerId,
            notes: values.notes || undefined,
            items: values.items.map((item) => ({
              productId: item.productId,
              quantity: Number(item.quantity),
            })),
          };
          if (isAdmin && values.sellerId) payload.sellerId = values.sellerId;

          const result = await createInvoice(payload);
          if (result.success) {
            setFormOpen(false);
            navigate(`/invoices/${result.invoice.id}`);
          }
        }}
      />
    </div>
  );
}
