import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button.jsx";
import { ProductImageCell } from "@/components/products/ProductImageCell.jsx";
import { ProductPickerModal } from "@/components/products/ProductPickerModal.jsx";
import { formatCurrency } from "@/utils/format/currency.js";
import {
  canAddInvoiceItem,
  clampQuantity,
  getProductStock,
  getRowProductOptions,
  mapOptionsToPickerProducts,
} from "./invoiceItemsUtils.js";

/**
 * Inventory-aware invoice line-item editor for create/edit modals.
 * Expects RHF form with `items: [{ productId, quantity }]`.
 */
export function InvoiceLineItemsEditor({
  control,
  register,
  setValue,
  watch,
  errors,
  productOptions = [],
  stockLoading = false,
  disabled = false,
  emptyStockMessage = "No in-stock products assigned to this seller.",
  onPickerOpenChange,
}) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items") || [];
  const [pickerIndex, setPickerIndex] = useState(null);

  const productMap = useMemo(
    () => new Map(productOptions.map((p) => [p.value, p])),
    [productOptions],
  );

  const addDisabled =
    disabled ||
    stockLoading ||
    !canAddInvoiceItem(productOptions, watchedItems);

  useEffect(() => {
    if (disabled || stockLoading) setPickerIndex(null);
  }, [disabled, stockLoading]);

  useEffect(() => {
    onPickerOpenChange?.(pickerIndex != null);
  }, [pickerIndex, onPickerOpenChange]);

  useEffect(() => {
    if (pickerIndex == null) return;
    if (pickerIndex >= fields.length) setPickerIndex(null);
  }, [pickerIndex, fields.length]);

  const pickerRowOptions =
    pickerIndex == null
      ? []
      : getRowProductOptions(productOptions, watchedItems, pickerIndex);

  const pickerProducts = useMemo(
    () => mapOptionsToPickerProducts(pickerRowOptions),
    [pickerRowOptions],
  );

  const handlePickProduct = (product) => {
    if (pickerIndex == null) return;
    const index = pickerIndex;
    const stock = getProductStock(productOptions, product.id);
    const currentQty = Number(watchedItems?.[index]?.quantity) || 1;
    const nextQty = clampQuantity(currentQty, stock) || 1;

    setValue(`items.${index}.productId`, product.id, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(`items.${index}.quantity`, nextQty, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setPickerIndex(null);
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
          disabled={addDisabled}
          title={
            addDisabled && productOptions.length > 0
              ? "All available products have already been added."
              : undefined
          }
          onClick={() => append({ productId: "", quantity: 1 })}
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

      {addDisabled && productOptions.length > 0 && !stockLoading ? (
        <p className="mb-3 text-xs text-slate-500">
          All available products have already been added.
        </p>
      ) : null}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const selectedId = watchedItems?.[index]?.productId;
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

              <div className="grid grid-cols-[minmax(0,1fr)_auto_4rem_2.25rem] items-center gap-x-3 gap-y-1">
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
                    <p className="text-sm text-slate-500">No product selected</p>
                  )}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={disabled || stockLoading}
                  onClick={() => setPickerIndex(index)}
                >
                  {selected ? "Change" : "Choose"}
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
                      disabled={disabled || stockLoading || !selectedId}
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

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  className="size-9 shrink-0 justify-self-center px-0"
                  disabled={disabled || fields.length <= 1}
                  onClick={() => remove(index)}
                  title="Remove item"
                />

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

      {errors.items?.message ? (
        <p className="mt-1.5 text-xs text-red-600">{errors.items.message}</p>
      ) : null}
      {errors.items?.root?.message ? (
        <p className="mt-1.5 text-xs text-red-600">
          {errors.items.root.message}
        </p>
      ) : null}

      <ProductPickerModal
        isOpen={pickerIndex != null}
        onClose={() => setPickerIndex(null)}
        onSelect={handlePickProduct}
        products={pickerProducts}
        selectedProductId={
          pickerIndex != null
            ? watchedItems?.[pickerIndex]?.productId || null
            : null
        }
        title="Select a product"
        description="Choose from this seller’s in-stock assigned products."
        emptyMessage="No in-stock products left to add on this line."
      />
    </div>
  );
}
