import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  Pencil,
  Plus,
  Trash2,
  TrashIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { SearchBar } from "@/components/common/SearchBar.jsx";
import { Table } from "@/components/tables/Table.jsx";
import { Pagination } from "@/components/tables/Pagination.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/forms/Input.jsx";
import { Select } from "@/components/forms/Select.jsx";
import { Modal } from "@/components/dialogs/Modal.jsx";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog.jsx";
import { ErrorState } from "@/components/ui/ErrorState.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { appConfig } from "@/config/app.config.js";
import { useVerifications } from "@/features/verification/verificationHooks.js";
import { useProducts } from "@/features/products/productsHooks.js";
import { verificationFormSchema } from "@/features/verification/verificationValidation.js";
import { formatDate, formatDateTime } from "@/utils/format/date.js";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DISABLED", label: "Disabled" },
];

function VerificationFormModal({
  isOpen,
  onClose,
  verification,
  products,
  onSubmit,
  isLoading,
}) {
  const isEditing = Boolean(verification);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: { qrId: "", productId: "", status: "ACTIVE" },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      verification
        ? {
            qrId: verification.qrId || "",
            productId: verification.product?.id || verification.productId || "",
            status: verification.status || "ACTIVE",
          }
        : { qrId: "", productId: "", status: "ACTIVE" },
    );
  }, [isOpen, verification, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit QR mapping" : "Register QR mapping"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            {isEditing ? "Save changes" : "Create mapping"}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="qrId"
          label="QR ID"
          hint="The code embedded in the printed QR, e.g. ABC12345"
          error={errors.qrId?.message}
          disabled={isEditing}
          {...register("qrId")}
        />
        <Select
          id="productId"
          label="Product"
          placeholder="Select a product"
          options={products}
          error={errors.productId?.message}
          {...register("productId")}
        />
        <Select
          id="status"
          label="Status"
          options={STATUS_OPTIONS}
          error={errors.status?.message}
          {...register("status")}
        />
      </form>
    </Modal>
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="min-w-0 wrap-break-word text-right text-sm font-medium text-slate-900">
        {children}
      </dd>
    </div>
  );
}

function VerificationDetailsModal({ isOpen, onClose, verification }) {
  const [copied, setCopied] = useState(false);
  const appOrigin = appConfig.publicAppUrl || window.location.origin;

  const verifyUrl = verification
    ? `${appOrigin}/verify/${verification.qrId}`
    : "";

  useEffect(() => {
    if (!isOpen) setCopied(false);
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      toast.success("URL copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy URL");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="QR Mapping Details"
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      {verification && (
        <div className="space-y-4">
          {/* Info rows - clean and minimal */}
          <dl className="divide-y divide-slate-100">
            <DetailRow label="Product">
              <div className="text-xs font-medium">
                {verification.product?.title || (
                  <span className="text-red-500 text-sm">Not assigned</span>
                )}
              </div>
            </DetailRow>

            <DetailRow label="QR ID">
              <code className="bg-slate-100 px-2.5 py-1 rounded text-sm font-mono">
                {verification.qrId}
              </code>
            </DetailRow>

            <DetailRow label="Total Scans">
              <span className="text-sm font-medium">
                {verification.totalScans ?? 0}
              </span>
            </DetailRow>

            <DetailRow label="First Scan">
              <div className="text-xs font-medium">
                {verification.firstScannedAt ? (
                  formatDateTime(verification.firstScannedAt)
                ) : (
                  <span className="text-sm text-slate-400">Never</span>
                )}
              </div>
            </DetailRow>

            <DetailRow label="Last Scan">
              <div className="text-xs font-medium">
                {verification.lastScannedAt ? (
                  formatDateTime(verification.lastScannedAt)
                ) : (
                  <span className="text-sm text-slate-400">Never</span>
                )}
              </div>
            </DetailRow>
          </dl>

          {/* Status badge with icon */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50 border border-slate-200">
            <div
              className={`
          w-3 h-3 rounded-full flex-shrink-0
          ${verification.status === "ACTIVE" ? "bg-green-500" : "bg-slate-400"}
        `}
            />
            <span className="text-sm font-medium text-slate-900">
              Status:
              <span
                className={`ml-2 ${verification.status === "ACTIVE" ? "text-green-700" : "text-slate-600"}`}
              >
                {verification.status === "ACTIVE" ? "Active" : "Disabled"}
              </span>
            </span>
            <span className="text-sm text-slate-500 ml-auto">
              {verification.status === "ACTIVE"
                ? "✓ Ready to scan"
                : "✕ Not scannable"}
            </span>
          </div>

          {/* Verification URL - simplified */}
          <div className="pt-3">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Verification URL
            </label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={verifyUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-slate-50 text-xs"
                containerClassName="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                icon={copied ? Check : Copy}
                onClick={handleCopy}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={ExternalLink}
                onClick={() => window.open(verifyUrl, "_blank")}
              >
                Open
              </Button>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              URL encoded in the QR code
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function VerificationsPage() {
  const {
    items,
    meta,
    filters,
    status,
    error,
    isLoading,
    isMutating,
    loadVerifications,
    updateFilters,
    createVerification,
    updateVerification,
    deleteVerification,
    bulkDeleteVerification,
  } = useVerifications();

  const { items: products, loadProducts } = useProducts();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const selectAllCheckboxRef = useRef(null);

  useEffect(() => {
    loadProducts({ limit: 100 });
  }, [loadProducts]);

  useEffect(() => {
    loadVerifications();
  }, [loadVerifications, filters.page, filters.search, filters.status]);

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        value: p.id,
        label: p.sku ? `${p.title} (${p.sku})` : p.title,
      })),
    [products],
  );

  const visibleIds = useMemo(() => items.map((row) => row.id), [items]);
  const selectedVisibleIds = visibleIds.filter((id) =>
    selectedIds.includes(id),
  );
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleIds.length === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleIds.length > 0 &&
    selectedVisibleIds.length < visibleIds.length;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate =
        someVisibleSelected && !allVisibleSelected;
    }
  }, [allVisibleSelected, someVisibleSelected]);

  const toggleSelectRow = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((current) => {
      const isAllSelected = visibleIds.every((id) => current.includes(id));
      if (isAllSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  const columns = [
    {
      key: "select",
      header: (
        <input
          ref={selectAllCheckboxRef}
          type="checkbox"
          checked={visibleIds.length > 0 && allVisibleSelected}
          onChange={toggleSelectAllVisible}
          aria-label="Select all visible QR codes"
          className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={() => toggleSelectRow(row.id)}
          aria-label={`Select ${row.qrId}`}
          className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
        />
      ),
    },
    {
      key: "qrId",
      header: "QR ID",
      render: (row) => (
        <span className="font-mono font-medium text-slate-900">{row.qrId}</span>
      ),
    },
    {
      key: "product",
      header: "Product",
      render: (row) =>
        row.product ? (
          <span className="text-slate-900">{row.product.title}</span>
        ) : (
          <Badge color="red">Missing product</Badge>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge color={row.status === "ACTIVE" ? "green" : "slate"}>
          {row.status === "ACTIVE" ? "Active" : "Disabled"}
        </Badge>
      ),
    },
    {
      key: "totalScans",
      header: "Scans",
      render: (row) => row.totalScans ?? 0,
    },
    {
      key: "firstScannedAt",
      header: "First scan",
      render: (row) =>
        row.firstScannedAt ? formatDate(row.firstScannedAt) : "—",
    },
    {
      key: "lastScannedAt",
      header: "Last scan",
      render: (row) =>
        row.lastScannedAt ? formatDate(row.lastScannedAt) : "—",
    },
    {
      key: "actions",
      header: "Actions",
      sticky: "right",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => setViewing(row)}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Pencil}
            onClick={() => {
              setEditing(row);
              setFormOpen(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => setDeleting(row)}
          />
        </div>
      ),
    },
  ];

  if (status === "failed" && !items.length) {
    return (
      <ErrorState
        title="Could not load verifications"
        description={error}
        onRetry={loadVerifications}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Product Verification"
        description="Map printed QR codes to existing products and track verification scans"
        actions={
          <Button
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Register QR
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-[360px]">
            <SearchBar
              value={filters.search}
              placeholder="Search by QR ID…"
              onSearch={(search) => updateFilters({ search, page: 1 })}
            />
          </div>

          <div className="w-full sm:w-[240px]">
            <Select
              value={filters.status}
              onChange={(event) =>
                updateFilters({
                  status: event.target.value,
                  page: 1,
                })
              }
              options={[
                { value: "", label: "All statuses" },
                ...STATUS_OPTIONS,
              ]}
            />
          </div>
        </div>

        {/* Right Side */}
        {selectedIds.length > 0 && (
          <div className="flex shrink-0 items-center gap-5">
            <span className="text-sm font-medium text-slate-700">
              {selectedIds.length} selected
            </span>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-sm font-medium text-red-600 transition hover:underline"
            >
              Clear
            </button>

            <Button
              variant="danger"
              size="sm"
              disabled={isMutating}
              onClick={() => setBulkDeleting(true)}
            >
              <TrashIcon className="h-4 w-4" />
              Delete selected
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            data={items}
            keyExtractor={(row) => row.id}
            isLoading={isLoading}
            emptyTitle="No QR mappings yet"
            emptyDescription="Register a QR ID and connect it to an existing product."
          />
        </div>
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          total={meta.total}
          limit={meta.limit}
          onPageChange={(page) => updateFilters({ page })}
        />
      </div>

      <VerificationFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        verification={editing}
        products={productOptions}
        onSubmit={async (values) => {
          const payload = editing
            ? { productId: values.productId, status: values.status }
            : values;
          const result = editing
            ? await updateVerification(editing.id, payload)
            : await createVerification(payload);
          if (result.success) {
            setFormOpen(false);
            setEditing(null);
          }
        }}
        isLoading={isMutating}
      />

      <VerificationDetailsModal
        isOpen={Boolean(viewing)}
        onClose={() => setViewing(null)}
        verification={viewing}
      />

      <ConfirmDialog
        isOpen={Boolean(deleting) || bulkDeleting}
        onClose={() => {
          setDeleting(null);
          setBulkDeleting(false);
        }}
        title={
          bulkDeleting ? "Delete selected QR mappings?" : "Delete QR mapping?"
        }
        description={
          bulkDeleting
            ? `This will remove ${selectedIds.length} QR mapping${selectedIds.length === 1 ? "" : "s"} and their scan history. The product itself is not affected.`
            : `This will remove the mapping for “${deleting?.qrId}” and its scan history. The product itself is not affected.`
        }
        confirmLabel={bulkDeleting ? "Delete selected" : "Delete"}
        isLoading={isMutating}
        onConfirm={async () => {
          if (bulkDeleting) {
            const result = await bulkDeleteVerification(selectedIds);
            if (result.success) {
              setSelectedIds([]);
              setBulkDeleting(false);
            }
            return;
          }

          const result = await deleteVerification(deleting.id);
          if (result.success) setDeleting(null);
        }}
      />
    </div>
  );
}
