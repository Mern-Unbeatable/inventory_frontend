import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2, TrashIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { Table } from "@/components/tables/Table.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/forms/Input.jsx";
import { Modal } from "@/components/dialogs/Modal.jsx";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog.jsx";
import { ErrorState } from "@/components/ui/ErrorState.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { useCountries } from "@/features/countries/countriesHooks.js";
import { countryFormSchema } from "@/features/countries/countriesValidation.js";
import { formatDate } from "@/utils/format/date.js";

function CountryFormModal({ isOpen, onClose, country, onSubmit, isLoading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(countryFormSchema),
    defaultValues: { name: "", code: "" },
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      country
        ? { name: country.name || "", code: country.code || "" }
        : { name: "", code: "" },
    );
  }, [isOpen, country, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={country ? "Edit country" : "Create country"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            {country ? "Save changes" : "Create country"}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input
          id="name"
          label="Country name"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          id="code"
          label="Code"
          hint="Optional ISO-style code, e.g. ET"
          error={errors.code?.message}
          {...register("code")}
        />
      </form>
    </Modal>
  );
}

export default function CountriesPage() {
  const {
    items,
    status,
    error,
    isLoading,
    isMutating,
    loadCountries,
    createCountry,
    updateCountry,
    deleteCountry,
    bulkDeleteCountries,
  } = useCountries();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const selectAllCheckboxRef = useRef(null);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

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
          aria-label="Select all visible countries"
          className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
        />
      ),
      render: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onChange={() => toggleSelectRow(row.id)}
          aria-label={`Select ${row.name}`}
          className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
        />
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (row) => (
        <span className="font-medium text-slate-900">{row.name}</span>
      ),
    },
    {
      key: "code",
      header: "Code",
      render: (row) =>
        row.code ? <Badge color="primary">{row.code}</Badge> : "—",
    },
    {
      key: "branches",
      header: "Branches",
      render: (row) => row._count?.branches ?? 0,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
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
        title="Could not load countries"
        description={error}
        onRetry={loadCountries}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Countries"
        description="Top-level regions for multi-country inventory"
        actions={
          <Button
            icon={Plus}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add country
          </Button>
        }
      />

      {selectedIds.length > 0 && (
        <div className="flex shrink-0 items-center gap-5 mb-4">
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
            <TrashIcon className="h-4 w-4" /> Delete selected
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Table
          columns={columns}
          data={items}
          keyExtractor={(row) => row.id}
          isLoading={isLoading}
          emptyTitle="No countries yet"
          emptyDescription="Add Ethiopia, Bangladesh, or any export destination."
        />
      </div>

      <CountryFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        country={editing}
        isLoading={isMutating}
        onSubmit={async (values) => {
          const result = editing
            ? await updateCountry(editing.id, values)
            : await createCountry(values);
          if (result.success) {
            setFormOpen(false);
            setEditing(null);
          }
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(deleting) || bulkDeleting}
        onClose={() => {
          setDeleting(null);
          setBulkDeleting(false);
        }}
        title={bulkDeleting ? "Delete selected countries?" : "Delete country?"}
        description={
          bulkDeleting
            ? `This will cascade-delete ${selectedIds.length} ${selectedIds.length === 1 ? "country" : "countries"} and all their branches.`
            : `This will cascade-delete branches under “${deleting?.name}”.`
        }
        confirmLabel={bulkDeleting ? "Delete selected" : "Delete"}
        isLoading={isMutating}
        onConfirm={async () => {
          if (bulkDeleting) {
            const result = await bulkDeleteCountries(selectedIds);
            if (result.success) {
              setSelectedIds([]);
              setBulkDeleting(false);
            }
            return;
          }

          const result = await deleteCountry(deleting.id);
          if (result.success) setDeleting(null);
        }}
      />
    </div>
  );
}
