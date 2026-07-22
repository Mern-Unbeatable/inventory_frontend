import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  createProductThunk,
  deleteProductThunk,
  fetchProductsThunk,
  setProductFilters,
  setSelectedProduct,
  updateProductThunk,
} from './productsSlice.js';
import {
  selectProductFilters,
  selectProductItems,
  selectProductMeta,
  selectProductsError,
  selectProductsMutationStatus,
  selectProductsStatus,
  selectSelectedProduct,
} from './productsSelectors.js';

export const useProducts = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectProductItems);
  const meta = useSelector(selectProductMeta);
  const filters = useSelector(selectProductFilters);
  const selected = useSelector(selectSelectedProduct);
  const status = useSelector(selectProductsStatus);
  const mutationStatus = useSelector(selectProductsMutationStatus);
  const error = useSelector(selectProductsError);

  const loadProducts = useCallback(() => dispatch(fetchProductsThunk()), [dispatch]);

  const updateFilters = useCallback(
    (next) => {
      dispatch(setProductFilters(next));
    },
    [dispatch]
  );

  const selectProduct = useCallback((product) => dispatch(setSelectedProduct(product)), [dispatch]);

  const createProduct = useCallback(
    async (payload) => {
      const result = await dispatch(createProductThunk(payload));
      if (createProductThunk.fulfilled.match(result)) {
        toast.success('Product created');
        dispatch(fetchProductsThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to create product');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const updateProduct = useCallback(
    async (id, payload) => {
      const result = await dispatch(updateProductThunk({ id, payload }));
      if (updateProductThunk.fulfilled.match(result)) {
        toast.success('Product updated');
        dispatch(fetchProductsThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to update product');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  const deleteProduct = useCallback(
    async (id) => {
      const result = await dispatch(deleteProductThunk(id));
      if (deleteProductThunk.fulfilled.match(result)) {
        toast.success('Product deleted');
        dispatch(fetchProductsThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || 'Failed to delete product');
      return { success: false, error: result.payload };
    },
    [dispatch]
  );

  return {
    items,
    meta,
    filters,
    selected,
    status,
    mutationStatus,
    error,
    isLoading: status === 'loading',
    isMutating: mutationStatus === 'loading',
    loadProducts,
    updateFilters,
    selectProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};
