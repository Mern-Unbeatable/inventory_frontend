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
    (product, quantity = 1) => {
      const available = product?.availableQuantity ?? 0;
      if (available <= 0) {
        toast.error('This product is out of stock');
        return { success: false };
      }

      dispatch(addToCart({ product, quantity }));
      toast.success('Added to cart');
      return { success: true };
    },
    [dispatch],
  );

  const updateQuantity = useCallback(
    (productId, quantity) => {
      dispatch(setCartQuantity({ productId, quantity }));
    },
    [dispatch],
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
