import { createSlice } from '@reduxjs/toolkit';
import { getLocalItem } from '@/utils/storage/localStorage.js';
import { STORAGE_KEYS } from '@/utils/storage/storageKeys.js';

const loadCartState = () => {
  const stored = getLocalItem(STORAGE_KEYS.CART, null);
  if (stored?.items && Array.isArray(stored.items)) {
    return { items: stored.items };
  }
  return { items: [] };
};

const normalizeProduct = (product) => ({
  productId: product.id,
  title: product.title || '—',
  sku: product.sku || '',
  price: Number(product.price) || 0,
  imageUrl: product.imageUrl || null,
  availableQuantity: product.availableQuantity ?? 0,
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCartState(),
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      if (!product?.id) return;

      const available = product.availableQuantity ?? 0;
      if (available <= 0) return;

      const addQty = Math.min(Math.max(1, Number(quantity) || 1), available);
      const existing = state.items.find((item) => item.productId === product.id);

      if (existing) {
        const nextQty = Math.min(existing.quantity + addQty, available);
        Object.assign(existing, normalizeProduct(product), { quantity: nextQty });
      } else {
        state.items.push({ ...normalizeProduct(product), quantity: addQty });
      }
    },
    setCartQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((row) => row.productId === productId);
      if (!item) return;

      const qty = Number(quantity) || 0;
      if (qty <= 0) {
        state.items = state.items.filter((row) => row.productId !== productId);
        return;
      }

      item.quantity = Math.min(qty, item.availableQuantity);
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.productId !== productId);
    },
    clearCart: (state) => {
      state.items = [];
    },
    /** Refresh available stock from the latest catalog list (no API change). */
    syncCatalogStock: (state, action) => {
      const products = action.payload || [];
      const stockMap = new Map(
        products.map((product) => [product.id, product.availableQuantity ?? 0]),
      );

      state.items.forEach((item) => {
        if (!stockMap.has(item.productId)) return;
        const available = stockMap.get(item.productId);
        item.availableQuantity = available;
        if (item.quantity > available) {
          item.quantity = available;
        }
      });

      state.items = state.items.filter((item) => item.availableQuantity > 0);
    },
  },
});

export const {
  addToCart,
  setCartQuantity,
  removeFromCart,
  clearCart,
  syncCatalogStock,
} = cartSlice.actions;

export default cartSlice.reducer;
