import { useMemo } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/forms/Input.jsx';
import { Select } from '@/components/forms/Select.jsx';
import { formatCurrency } from '@/utils/format/currency.js';
import {
  canAddInvoiceItem,
  clampQuantity,
  getProductStock,
  getRowProductOptions,
} from './invoiceItemsUtils.js';

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
  emptyStockMessage = 'No in-stock products assigned to this seller.',
}) {
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items') || [];

  const productMap = useMemo(
    () => new Map(productOptions.map((p) => [p.value, p])),
    [productOptions],
  );

  const addDisabled =
    disabled ||
    stockLoading ||
    !canAddInvoiceItem(productOptions, watchedItems);

  return (
    <div>
      <div className='mb-2 flex items-center justify-between gap-3'>
        <span className='text-sm font-medium text-slate-700'>Items</span>
        <Button
          type='button'
          variant='outline'
          size='sm'
          icon={Plus}
          className='border-dashed hover:border-solid'
          disabled={addDisabled}
          title={
            addDisabled && productOptions.length > 0
              ? 'All available products have already been added.'
              : undefined
          }
          onClick={() => append({ productId: '', quantity: 1 })}
        >
          Add item
        </Button>
      </div>

      {stockLoading ? (
        <p className='mb-3 text-xs text-slate-500'>Loading seller inventory…</p>
      ) : null}

      {!stockLoading && !productOptions.length ? (
        <p className='mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800'>
          {emptyStockMessage}
        </p>
      ) : null}

      {addDisabled && productOptions.length > 0 && !stockLoading ? (
        <p className='mb-3 text-xs text-slate-500'>
          All available products have already been added.
        </p>
      ) : null}

      <div className='space-y-3'>
        {fields.map((field, index) => {
          const selectedId = watchedItems?.[index]?.productId;
          const selected = productMap.get(selectedId);
          const available = getProductStock(productOptions, selectedId);
          const rowOptions = getRowProductOptions(
            productOptions,
            watchedItems,
            index,
          );

          return (
            <div
              key={field.id}
              className='rounded-lg border border-slate-200 bg-slate-50/60 p-3'
            >
              <div className='grid gap-2 sm:grid-cols-[1fr_7.5rem_auto] sm:items-start'>
                <Select
                  placeholder='Select product'
                  options={rowOptions}
                  disabled={disabled || stockLoading}
                  error={errors.items?.[index]?.productId?.message}
                  hint={
                    selected
                      ? `SKU: ${selected.sku} · ${formatCurrency(selected.price)}`
                      : undefined
                  }
                  {...register(`items.${index}.productId`, {
                    onChange: (event) => {
                      const nextId = event.target.value;
                      const stock = getProductStock(productOptions, nextId);
                      const currentQty =
                        Number(watchedItems?.[index]?.quantity) || 1;
                      const nextQty = clampQuantity(currentQty, stock) || 1;
                      setValue(`items.${index}.quantity`, nextQty, {
                        shouldValidate: true,
                      });
                    },
                  })}
                />

                <Controller
                  name={`items.${index}.quantity`}
                  control={control}
                  render={({ field: qtyField }) => (
                    <Input
                      type='number'
                      min={1}
                      max={available != null ? available : undefined}
                      step={1}
                      placeholder='Qty'
                      disabled={disabled || stockLoading || !selectedId}
                      hint={
                        available != null
                          ? `Available: ${available} units`
                          : selectedId
                            ? 'Not in seller stock'
                            : 'Select a product first'
                      }
                      error={errors.items?.[index]?.quantity?.message}
                      value={qtyField.value ?? ''}
                      onBlur={qtyField.onBlur}
                      onChange={(event) => {
                        const next = clampQuantity(
                          event.target.value,
                          available,
                        );
                        qtyField.onChange(next === '' ? '' : next);
                      }}
                    />
                  )}
                />

                <div className='flex items-end pb-1'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='md'
                    icon={Trash2}
                    disabled={disabled || fields.length <= 1}
                    onClick={() => remove(index)}
                    title='Remove item'
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {errors.items?.message ? (
        <p className='mt-1.5 text-xs text-red-600'>{errors.items.message}</p>
      ) : null}
      {errors.items?.root?.message ? (
        <p className='mt-1.5 text-xs text-red-600'>
          {errors.items.root.message}
        </p>
      ) : null}
    </div>
  );
}
