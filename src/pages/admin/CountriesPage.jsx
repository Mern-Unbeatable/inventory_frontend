import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2, TrashIcon } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { Table } from "@/components/tables/Table.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { CountrySelect } from "@/components/forms/CountrySelect.jsx";
import { CountryFlag } from "@/components/ui/CountryFlag.jsx";
import { Modal } from "@/components/dialogs/Modal.jsx";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog.jsx";
import { ErrorState } from "@/components/ui/ErrorState.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { useCountries } from "@/features/countries/countriesHooks.js";
import { countryFormSchema } from "@/features/countries/countriesValidation.js";
import {
  getCountryByCode,
  getCountrySelectOptions,
} from "@/data/countryCodes.js";
import { formatDate } from "@/utils/format/date.js";

function CountryFormModal({
  isOpen,
  onClose,
  country,
  onSubmit,
  isLoading,
  existingCodes = [],
}) {
  const isEditing = Boolean(country);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(countryFormSchema),
    defaultValues: { name: "", code: "" },
  });

  const selectedCode = watch("code") || "";

  const countryOptions = useMemo(() => {
    const options = getCountrySelectOptions({
      excludeCodes: isEditing
        ? existingCodes.filter(
            (code) =>
              code &&
              code.toUpperCase() !== String(country?.code || "").toUpperCase(),
          )
        : existingCodes,
    });

    // Keep edit working for countries not yet in countries.json.
    if (
      isEditing &&
      country?.code &&
      !options.some(
        (option) =>
          option.value.toUpperCase() === String(country.code).toUpperCase(),
      )
    ) {
      options.unshift({
        value: country.code,
        label: `${country.name || "Country"} (${country.code})`,
        name: country.name,
        code: country.code,
      });
    }

    return options;
  }, [existingCodes, isEditing, country]);

  useEffect(() => {
    if (!isOpen) return;
    reset(
      country
        ? { name: country.name || "", code: country.code || "" }
        : { name: "", code: "" },
    );
  }, [isOpen, country, reset]);

  const handleCountrySelect = (event) => {
    const code = event.target.value;
    const selected = getCountryByCode(code);
    if (!selected) {
      setValue("code", "", { shouldValidate: true });
      setValue("name", "", { shouldValidate: true });
      return;
    }
    setValue("code", selected.code, { shouldValidate: true });
    setValue("name", selected.name, { shouldValidate: true });
  };

  const selectedCountry = getCountryByCode(selectedCode);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit country" : "Create country"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            {isEditing ? "Save changes" : "Create country"}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <CountrySelect
          id="countrySelect"
          label="Country"
          placeholder="Select a country"
          options={countryOptions}
          value={selectedCode}
          onChange={handleCountrySelect}
          error={errors.name?.message || errors.code?.message}
          hint="Select a country to set name and code"
        />

        {selectedCountry && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 font-medium">
                <CountryFlag code={selectedCountry.code} />
                {selectedCountry.name}
              </span>
              <span className="font-mono text-slate-500">
                {selectedCountry.code}
              </span>
            </div>
            {selectedCountry.dialCode && (
              <p className="mt-1 text-xs text-slate-500">
                Dial code: {selectedCountry.dialCode}
              </p>
            )}
          </div>
        )}

        <input type="hidden" {...register("name")} />
        <input type="hidden" {...register("code")} />
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

  const existingCodes = useMemo(
    () => items.map((row) => row.code).filter(Boolean),
    [items],
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
        <span className="inline-flex items-center gap-2 font-medium text-slate-900">
          {row.code ? <CountryFlag code={row.code} /> : null}
          {row.name}
        </span>
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
        existingCodes={existingCodes}
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
