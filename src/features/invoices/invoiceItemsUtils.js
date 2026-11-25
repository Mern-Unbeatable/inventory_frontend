/**
 * Helpers for inventory-aware invoice line items.
 */

const toOption = (row) => ({
  value: row.product.id,
  label: row.product.title,
  title: row.product.title,
  sku: row.product.sku || '—',
  price: row.product.price ?? 0,
  quantity: Number(row.quantity) || 0,
  imageUrl: row.product.imageUrl || null,
});

/** Map rich invoice options → ProductPickerModal product shape. */
export const mapOptionsToPickerProducts = (options = []) =>
  (options || []).map((option) => ({
    id: option.value,
    title: option.title || option.label,
    sku: option.sku,
    imageUrl: option.imageUrl || null,
    price: option.price,
    quantity: option.quantity,
  }));

/**
 * Map inventory API rows → product options.
 * In-stock products are always included. Optionally keep currently selected
 * products visible even when stock is 0 (edit-draft safety).
 */
export const mapInventoryToProductOptions = (
  inventoryItems = [],
  selectedProductIds = [],
) => {
  const selected = new Set((selectedProductIds || []).filter(Boolean));
  const options = [];

  for (const row of inventoryItems || []) {
    if (!row?.product?.id) continue;
    const quantity = Number(row.quantity) || 0;
    if (quantity > 0 || selected.has(row.product.id)) {
      options.push(toOption(row));
    }
  }

  return options;
};

/** Options for one row: keep current selection, hide products chosen elsewhere. */
export const getRowProductOptions = (allOptions, watchedItems, rowIndex) => {
  const selectedElsewhere = new Set(
    (watchedItems || [])
      .map((item, index) => (index === rowIndex ? null : item?.productId))
      .filter(Boolean),
  );
  const currentId = watchedItems?.[rowIndex]?.productId;

  return (allOptions || []).filter((option) => {
    if (option.value === currentId) return true;
    if (selectedElsewhere.has(option.value)) return false;
    // Out-of-stock products are never newly selectable
    return option.quantity > 0;
  });
};

export const getProductStock = (allOptions, productId) => {
  if (!productId) return null;
  const match = (allOptions || []).find((option) => option.value === productId);
  return match ? match.quantity : null;
};

/** Clamp quantity into [1, maxStock] (or [1, ∞) when stock unknown). */
export const clampQuantity = (rawValue, maxStock) => {
  if (rawValue === '' || rawValue === null || rawValue === undefined) {
    return '';
  }
  let value = Number.parseInt(String(rawValue), 10);
  if (Number.isNaN(value)) return '';
  if (value < 1) value = 1;
  if (maxStock != null && maxStock >= 1 && value > maxStock) value = maxStock;
  return value;
};

export const canAddInvoiceItem = (allOptions, watchedItems) => {
  const inStockCount = (allOptions || []).length;
  if (inStockCount === 0) return false;
  const selectedCount = (watchedItems || []).filter(
    (item) => item?.productId,
  ).length;
  return selectedCount < inStockCount;
};
