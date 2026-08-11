import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  addToCart,
  clearCart,
  removeFromCart,
  setCartQuantity,
  syncCatalogStock,
} from './cartSlice.js';
import {
  selectCartGrandTotal,
  selectCartItemCount,
  selectCartItems,
  selectCartLineCount,
} from './cartSelectors.js';

export const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectCartItemCount);
  const lineCount = useSelector(selectCartLineCount);
  const grandTotal = useSelector(selectCartGrandTotal);

  const lineTotals = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        lineTotal: item.price * item.quantity,
      })),
    [items],
  );

  const addProduct = useCallback(
    (product) => {
      const available = product?.availableQuantity ?? 0;
      if (available <= 0) {
        toast.error('This product is out of stock');
        return { success: false };
      }

      const alreadyInCart = items.some((item) => item.productId === product.id);
      if (alreadyInCart) {
        return { success: false };
      }

      dispatch(addToCart({ product }));
      toast.success('Added to cart');
      return { success: true };
    },
    [dispatch, items],
  );

  const updateQuantity = useCallback(
    (productId, quantity) => {
      const qty = Number(quantity);
      if (!Number.isFinite(qty) || qty < 1) return;

      const item = items.find((row) => row.productId === productId);
      if (!item) return;

      const clamped = Math.min(Math.max(1, Math.floor(qty)), item.availableQuantity);
      dispatch(setCartQuantity({ productId, quantity: clamped }));
    },
    [dispatch, items],
  );

  const removeItem = useCallback(
    (productId) => {
      dispatch(removeFromCart(productId));
      toast.success('Removed from cart');
    },
    [dispatch],
  );

  const emptyCart = useCallback(() => {
    dispatch(clearCart());
  }, [dispatch]);

  const refreshStock = useCallback(
    (products) => {
      dispatch(syncCatalogStock(products));
    },
    [dispatch],
  );

  return {
    items,
    lineTotals,
    itemCount,
    lineCount,
    grandTotal,
    isEmpty: items.length === 0,
    addProduct,
    updateQuantity,
    removeItem,
    emptyCart,
    refreshStock,
  };
};
