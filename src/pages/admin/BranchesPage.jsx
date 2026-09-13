import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader.jsx";
import { SearchBar } from "@/components/common/SearchBar.jsx";
import { Table } from "@/components/tables/Table.jsx";
import { Pagination } from "@/components/tables/Pagination.jsx";
import { Button } from "@/components/ui/Button.jsx";
import { Input } from "@/components/forms/Input.jsx";
import { CountrySelect } from "@/components/forms/CountrySelect.jsx";
import { CountryFlag } from "@/components/ui/CountryFlag.jsx";
import { Modal } from "@/components/dialogs/Modal.jsx";
import { ConfirmDialog } from "@/components/dialogs/ConfirmDialog.jsx";
import { ErrorState } from "@/components/ui/ErrorState.jsx";
import { Badge } from "@/components/ui/Badge.jsx";
import { useBranches } from "@/features/branches/branchesHooks.js";
import { useCountries } from "@/features/countries/countriesHooks.js";
import { branchFormSchema } from "@/features/branches/branchesValidation.js";
import { formatDate } from "@/utils/format/date.js";

function BranchFormModal({
  isOpen,
  onClose,
  branch,
  countries,
  onSubmit,
  isLoading,
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(branchFormSchema),
    defaultValues: { name: "", code: "", countryId: "" },
  });

  const countryId = watch("countryId") || "";

  useEffect(() => {
    if (!isOpen) return;
    reset(
      branch
        ? {
            name: branch.name || "",
            code: branch.code || "",
            countryId: branch.countryId || branch.country?.id || "",
          }
        : { name: "", code: "", countryId: "" },
    );
  }, [isOpen, branch, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={branch ? "Edit branch" : "Create branch"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            {branch ? "Save changes" : "Create branch"}
          </Button>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <CountrySelect
          id="countryId"
          label="Country"
          placeholder="Select country"
          options={countries}
          value={countryId}
          onChange={(event) =>
            setValue("countryId", event.target.value, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          error={errors.countryId?.message}
        />
        <input type="hidden" {...register("countryId")} />
        <Input
          id="name"
          label="Branch name"
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          id="code"
          label="Code"
          hint="Optional short code, e.g. ADD-01"
          error={errors.code?.message}
          {...register("code")}
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
    bulkDeleteBranches,
  } = useBranches();

  const { items: countries, loadCountries } = useCountries();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const selectAllCheckboxRef = useRef(null);

  useEffect(() => {
    loadCountries();
  }, [loadCountries]);

  useEffect(() => {
    loadBranches();
  }, [loadBranches, filters.page, filters.search, filters.countryId]);

  const countryOptions = useMemo(
    () =>
      countries.map((country) => ({
        value: country.id,
        code: country.code || "",
        name: country.name,
        label: country.code
          ? `${country.name} (${country.code})`
          : country.name,
      })),
    [countries],
  );

  const filterCountryOptions = useMemo(
    () => [{ value: "", name: "All countries", code: "" }, ...countryOptions],
    [countryOptions],
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
          aria-label="Select all visible branches"
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
        row.code ? <Badge color="slate">{row.code}</Badge> : "—",
    },
    {
      key: "country",
      header: "Country",
      render: (row) =>
        row.country?.name ? (
          <span className="inline-flex items-center gap-2 text-slate-900">
            {row.country.code ? (
              <CountryFlag code={row.country.code} />
            ) : null}
            {row.country.name}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "users",
      header: "Users",
      render: (row) => row._count?.users ?? 0,
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
        title="Could not load branches"
        description={error}
        onRetry={loadBranches}
      />
    );
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

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side: Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:w-[240px]">
            <CountrySelect
              id="branchCountryFilter"
              placeholder="All countries"
              options={filterCountryOptions}
              value={filters.countryId || ""}
              onChange={(event) =>
                updateFilters({
                  countryId: event.target.value,
                  page: 1,
                })
              }
            />
          </div>

          <div className="w-full sm:w-[360px]">
            <SearchBar
              value={filters.search}
              placeholder="Search branches…"
              onSearch={(search) =>
                updateFilters({
                  search,
                  page: 1,
                })
              }
            />
          </div>
        </div>

        {/* Right Side: Bulk Actions */}
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
              Delete selected
            </Button>
          </div>
        )}
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
        isOpen={Boolean(deleting) || bulkDeleting}
        onClose={() => {
          setDeleting(null);
          setBulkDeleting(false);
        }}
        title={bulkDeleting ? "Delete selected branches?" : "Delete branch?"}
        description={
          bulkDeleting
            ? `This will remove ${selectedIds.length} branch${selectedIds.length === 1 ? "" : "s"} and clear their user assignments.`
            : `This will remove “${deleting?.name}”. Users may lose their branch assignment.`
        }
        confirmLabel={bulkDeleting ? "Delete selected" : "Delete"}
        isLoading={isMutating}
        onConfirm={async () => {
          if (bulkDeleting) {
            const result = await bulkDeleteBranches(selectedIds);
            if (result.success) {
              setSelectedIds([]);
              setBulkDeleting(false);
            }
            return;
          }

          const result = await deleteBranch(deleting.id);
          if (result.success) setDeleting(null);
        }}
      />
    </div>
  );
}
