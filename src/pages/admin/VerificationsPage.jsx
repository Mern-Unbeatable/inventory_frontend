import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Loader2,
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
import { ProductImageCell } from "@/components/products/ProductImageCell.jsx";
import { appConfig } from "@/config/app.config.js";
import { useVerifications } from "@/features/verification/verificationHooks.js";
import { verificationService } from "@/features/verification/verificationService.js";
import { useProducts } from "@/features/products/productsHooks.js";
import { verificationFormSchema } from "@/features/verification/verificationValidation.js";
import {
  buildVerificationUrl,
  downloadVerificationQr,
  generateQrPngDataUrl,
  QR_DISPLAY_SIZE,
} from "@/features/verification/verificationQr.js";
import { formatDate, formatDateTime } from "@/utils/format/date.js";

const QR_DOWNLOAD_FORMATS = [
  { format: "png", label: "PNG" },
  { format: "jpg", label: "JPG" },
  { format: "svg", label: "SVG" },
  { format: "pdf", label: "PDF" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DISABLED", label: "Disabled" },
];

const QR_TABLE_THUMB_SIZE = 96;

/** Compact QR thumbnail for the verifications table. */
function VerificationQrThumb({ qrId }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    if (!qrId) {
      setSrc(null);
      return;
    }

    let cancelled = false;
    const verifyUrl = buildVerificationUrl(qrId, appConfig.publicAppUrl);

    generateQrPngDataUrl(verifyUrl, QR_TABLE_THUMB_SIZE)
      .then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setSrc(null);
      });

    return () => {
      cancelled = true;
    };
  }, [qrId]);

  if (!src) {
    return (
      <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-400 sm:size-10">
        <Loader2 className="size-4 animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`QR ${qrId}`}
      className="size-9 rounded-lg bg-white object-contain p-0.5 ring-1 ring-slate-200 sm:size-10"
      loading="lazy"
    />
  );
}

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
  const [qrPreview, setQrPreview] = useState({
    status: "idle",
    dataUrl: null,
    error: null,
  });
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  const verifyUrl = verification
    ? buildVerificationUrl(verification.qrId, appConfig.publicAppUrl)
    : "";

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setQrPreview({ status: "idle", dataUrl: null, error: null });
      setDownloadingFormat(null);
      return;
    }

    if (!verifyUrl) return;

    let cancelled = false;
    setQrPreview({ status: "loading", dataUrl: null, error: null });

    generateQrPngDataUrl(verifyUrl, QR_DISPLAY_SIZE)
      .then((dataUrl) => {
        if (!cancelled) {
          setQrPreview({ status: "ready", dataUrl, error: null });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrPreview({
            status: "error",
            dataUrl: null,
            error: "Could not generate QR code",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, verifyUrl]);

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

  const handleDownload = async (format) => {
    if (!verification?.qrId || !verifyUrl) return;
    setDownloadingFormat(format);
    try {
      await downloadVerificationQr(verifyUrl, verification.qrId, format);
      toast.success(`QR downloaded as ${format.toUpperCase()}`);
    } catch {
      toast.error(`Failed to download ${format.toUpperCase()}`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-3">
          <ProductImageCell imageUrl={verification?.product?.imageUrl} />
          <span>QR Mapping Details</span>
        </span>
      }
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      {verification && (
        <div className="space-y-4 text-sm">
          <div className="flex flex-col items-center gap-3 ">
           
            {qrPreview.status === "loading" && (
              <div className="flex h-[180px] w-[180px] items-center justify-center rounded-lg bg-white">
                <Loader2 className="size-6 animate-spin text-slate-400" />
              </div>
            )}
            {qrPreview.status === "error" && (
              <div className="flex h-[180px] w-[180px] items-center justify-center rounded-lg border border-red-200 bg-white px-3 text-center text-red-600">
                {qrPreview.error}
              </div>
            )}
            {qrPreview.status === "ready" && qrPreview.dataUrl && (
              <img
                src={qrPreview.dataUrl}
                alt={`QR code for ${verification.qrId}`}
                className="h-[180px] w-[180px] rounded-lg bg-slate-50 p-2 shadow-sm"
              />
            )}

            <div className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-green-50 p-2">
              <div
                className={`h-3 w-3 shrink-0 rounded-full ${
                  verification.status === "ACTIVE"
                    ? "bg-green-500"
                    : "bg-slate-400"
                }`}
              />
              <span className="font-medium text-slate-900">
                Status:
                <span
                  className={`ml-2 ${
                    verification.status === "ACTIVE"
                      ? "text-green-700"
                      : "text-slate-600"
                  }`}
                >
                  {verification.status === "ACTIVE" ? "Active" : "Disabled"}
                </span>
              </span>
              <span className="ml-auto text-slate-500">
                {verification.status === "ACTIVE"
                  ? "✓ Ready to scan"
                  : "✕ Not scannable"}
              </span>
            </div>
          </div>

          <dl className="divide-y divide-slate-100">
            <DetailRow label="Product">
              <div className="font-medium">
                {verification.product?.title || (
                  <span className="text-red-500">Not assigned</span>
                )}
              </div>
            </DetailRow>

            <DetailRow label="QR ID">
              <code className="rounded bg-slate-100 px-2.5 py-1 font-mono">
                {verification.qrId}
              </code>
            </DetailRow>

            <DetailRow label="Total Scans">
              <span className="font-medium">
                {verification.totalScans ?? 0}
              </span>
            </DetailRow>

            <DetailRow label="First Scan">
              <div className="font-medium">
                {verification.firstScannedAt ? (
                  formatDateTime(verification.firstScannedAt)
                ) : (
                  <span className="text-slate-400">Never</span>
                )}
              </div>
            </DetailRow>

            <DetailRow label="Last Scan">
              <div className="font-medium">
                {verification.lastScannedAt ? (
                  formatDateTime(verification.lastScannedAt)
                ) : (
                  <span className="text-slate-400">Never</span>
                )}
              </div>
            </DetailRow>
          </dl>

          <div>
            <label className="mb-2 block font-medium text-slate-700">
              Verification URL
            </label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={verifyUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 bg-slate-50 text-sm"
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
            <p className="mt-2 text-slate-400">
              Encoded in the QR code above
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Download QR Code
            </label>
            <div className="flex flex-wrap gap-2">
              {QR_DOWNLOAD_FORMATS.map(({ format, label }) => (
                <Button
                  key={format}
                  variant="outline"
                  size="sm"
                  icon={Download}
                  disabled={
                    qrPreview.status !== "ready" || Boolean(downloadingFormat)
                  }
                  isLoading={downloadingFormat === format}
                  onClick={() => handleDownload(format)}
                >
                  {label}
                </Button>
              ))}
            </div>
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
  const [mappedProductIds, setMappedProductIds] = useState([]);
  const selectAllCheckboxRef = useRef(null);

  useEffect(() => {
    loadProducts({ limit: 100 });
  }, [loadProducts]);

  useEffect(() => {
    loadVerifications();
  }, [loadVerifications, filters.page, filters.search, filters.status]);

  useEffect(() => {
    if (!formOpen) return;

    let cancelled = false;

    const loadMappedProductIds = async () => {
      const used = new Set();
      let page = 1;
      let totalPages = 1;

      try {
        do {
          const result = await verificationService.list({
            page,
            limit: 100,
          });
          for (const row of result.items || []) {
            const productId = row.productId || row.product?.id;
            if (productId) used.add(productId);
          }
          totalPages = result.meta?.totalPages || 1;
          page += 1;
        } while (page <= totalPages && page <= 50);

        if (!cancelled) setMappedProductIds([...used]);
      } catch {
        if (!cancelled) {
          setMappedProductIds(
            items
              .map((row) => row.productId || row.product?.id)
              .filter(Boolean),
          );
        }
      }
    };

    loadMappedProductIds();

    return () => {
      cancelled = true;
    };
  }, [formOpen, items]);

  const productOptions = useMemo(() => {
    const currentProductId =
      editing?.product?.id || editing?.productId || null;
    const used = new Set(mappedProductIds);

    return products
      .filter(
        (p) => !used.has(p.id) || (currentProductId && p.id === currentProductId),
      )
      .map((p) => ({
        value: p.id,
        label: p.sku ? `${p.title} (${p.sku})` : p.title,
      }));
  }, [products, mappedProductIds, editing]);

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
      key: "productImage",
      header: "Image",
      render: (row) => (
        <ProductImageCell imageUrl={row.product?.imageUrl} />
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
      key: "qrImage",
      header: "QR",
      render: (row) => <VerificationQrThumb qrId={row.qrId} />,
    },
    {
      key: "qrId",
      header: "QR ID",
      render: (row) => (
        <span className="font-mono font-medium text-slate-900">{row.qrId}</span>
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
