import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { ProductImageCell } from "@/components/products/ProductImageCell.jsx";
import { ProductPickerModal } from "@/components/products/ProductPickerModal.jsx";
import { formatCurrency } from "@/utils/format/currency.js";
import {
  clampQuantity,
  getProductStock,
  mapOptionsToPickerProducts,
} from "./invoiceItemsUtils.js";

/**
 * Inventory-aware invoice line-item editor for create/edit modals.
 * Expects RHF form with `items: [{ productId, quantity }]`.
 *
 * "Add item" / "Change" open the same multi-select picker with current
 * selections checked and pinned to the top of the list.
 */
export function InvoiceLineItemsEditor({
  control,
  register,
  watch,
  errors,
  productOptions = [],
  stockLoading = false,
  disabled = false,
  emptyStockMessage = "No in-stock products assigned to this seller.",
  onPickerOpenChange,
}) {
  const { fields, remove, replace } = useFieldArray({
    control,
    name: "items",
  });
  const watchedItems = watch("items") || [];
  const [pickerOpen, setPickerOpen] = useState(false);

  const productMap = useMemo(
    () => new Map(productOptions.map((p) => [p.value, p])),
    [productOptions],
  );

  const selectedProductIds = useMemo(
    () => (watchedItems || []).map((item) => item?.productId).filter(Boolean),
    [watchedItems],
  );

  const openDisabled = disabled || stockLoading || !productOptions.length;

  useEffect(() => {
    if (disabled || stockLoading) setPickerOpen(false);
  }, [disabled, stockLoading]);

  useEffect(() => {
    onPickerOpenChange?.(pickerOpen);
  }, [pickerOpen, onPickerOpenChange]);

  const pickerProducts = useMemo(() => {
    const selected = new Set(selectedProductIds);
    return mapOptionsToPickerProducts(
      (productOptions || []).filter(
        (option) => option.quantity > 0 || selected.has(option.value),
      ),
    );
  }, [productOptions, selectedProductIds]);

  const syncSelection = (products) => {
    const previousById = new Map(
      (watchedItems || [])
        .filter((item) => item?.productId)
        .map((item) => [item.productId, item]),
    );

    replace(
      (products || [])
        .filter((product) => product?.id)
        .map((product) => ({
          productId: product.id,
          quantity: Number(previousById.get(product.id)?.quantity) || 1,
        })),
    );
    setPickerOpen(false);
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">Items</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={Plus}
          className="border-dashed hover:border-solid"
          disabled={openDisabled}
          onClick={() => setPickerOpen(true)}
        >
          Add item
        </Button>
      </div>

      {stockLoading ? (
        <p className="mb-3 text-xs text-slate-500">Loading seller inventory…</p>
      ) : null}

      {!stockLoading && !productOptions.length ? (
        <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {emptyStockMessage}
        </p>
      ) : null}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const selectedId = watchedItems?.[index]?.productId;
          if (!selectedId) return null;

          const selected = productMap.get(selectedId);
          const available = getProductStock(productOptions, selectedId);
          const productError = errors.items?.[index]?.productId?.message;
          const quantityError = errors.items?.[index]?.quantity?.message;
          const availableLabel =
            available != null
              ? `Available: ${available} units`
              : selectedId
                ? "Not in seller stock"
                : null;

          return (
            <div
              key={field.id}
              className={`rounded-lg border bg-white p-3 ${
                productError ? "border-red-300" : "border-slate-200"
              }`}
            >
              <input type="hidden" {...register(`items.${index}.productId`)} />

              <div className="grid grid-cols-[minmax(0,1fr)_auto_4rem_2.5rem] items-center gap-x-3 gap-y-1">
                <div className="flex min-w-0 items-center gap-3">
                  {selected ? (
                    <>
                      <ProductImageCell imageUrl={selected.imageUrl} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {selected.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {availableLabel
                            ? `${availableLabel} · ${formatCurrency(selected.price)}`
                            : formatCurrency(selected.price)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">Unknown product</p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={openDisabled}
                  onClick={() => setPickerOpen(true)}
                >
                  Change
                </Button>

                <Controller
                  name={`items.${index}.quantity`}
                  control={control}
                  render={({ field: qtyField }) => (
                    <input
                      type="number"
                      min={1}
                      max={available != null ? available : undefined}
                      step={1}
                      placeholder="Qty"
                      disabled={disabled || stockLoading}
                      value={qtyField.value ?? ""}
                      onBlur={qtyField.onBlur}
                      onChange={(event) => {
                        const next = clampQuantity(
                          event.target.value,
                          available,
                        );
                        qtyField.onChange(next === "" ? "" : next);
                      }}
                      className={`h-9 w-full rounded-lg border bg-white px-2 text-center text-sm text-slate-900
                        placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40
                        disabled:bg-slate-50 disabled:text-slate-500
                        ${quantityError ? "border-red-400" : "border-slate-300"}`}
                    />
                  )}
                />

                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => remove(index)}
                  title="Remove item"
                  aria-label="Remove item"
                  className="inline-flex size-8 shrink-0 items-center justify-center justify-self-center rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 className="size-4" strokeWidth={2} />
                </button>

                {(productError || quantityError) && (
                  <>
                    <div className="min-w-0">
                      {productError ? (
                        <p className="text-xs text-red-600">{productError}</p>
                      ) : null}
                    </div>
                    <div />
                    <div className="text-center">
                      {quantityError ? (
                        <p className="text-xs text-red-600">{quantityError}</p>
                      ) : null}
                    </div>
                    <div />
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!selectedProductIds.length ? (
        <p className="mt-3 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
          Click <span className="font-medium text-slate-700">Add item</span> to
          choose products.
        </p>
      ) : null}

      {errors.items?.message ? (
        <p className="mt-1.5 text-xs text-red-600">{errors.items.message}</p>
      ) : null}
      {errors.items?.root?.message ? (
        <p className="mt-1.5 text-xs text-red-600">
          {errors.items.root.message}
        </p>
      ) : null}

      <ProductPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectionMode="multiple"
        onConfirm={syncSelection}
        products={pickerProducts}
        initialSelectedIds={selectedProductIds}
        title="Select products"
        description="Select or unselect products. Selected items stay at the top."
        emptyMessage="No products available for this seller."
        confirmLabel="Update selected"
      />
    </div>
  );
}
