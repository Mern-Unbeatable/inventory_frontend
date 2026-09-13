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
import { productsService } from './productsService.js';
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

  const loadProducts = useCallback(
    (params) => dispatch(fetchProductsThunk(params)),
    [dispatch]
  );

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

  const exportProducts = useCallback(
    async ({ format = 'csv', ...params } = {}) => {
      try {
        const fallbackByFormat = {
          xlsx: 'products-export.xlsx',
          json: 'products-export.json',
          csv: 'products-export.csv',
        };
        const fallbackName = fallbackByFormat[format] || fallbackByFormat.csv;
        await productsService.exportProducts(
          { format, ...params },
          fallbackName
        );
        const labelByFormat = {
          xlsx: 'Excel export downloaded',
          json: 'JSON export downloaded',
          csv: 'CSV export downloaded',
        };
        toast.success(labelByFormat[format] || labelByFormat.csv);
        return { success: true };
      } catch (err) {
        toast.error(err?.message || 'Failed to export products');
        return { success: false, error: err };
      }
    },
    []
  );

  const importProducts = useCallback(
    async (file) => {
      try {
        const result = await productsService.importProducts(file);
        dispatch(fetchProductsThunk());
        const successCount = result?.successCount ?? 0;
        const failureCount = result?.failureCount ?? 0;
        if (failureCount === 0) {
          toast.success(
            `Imported ${successCount} product${successCount === 1 ? '' : 's'}`
          );
        } else if (successCount === 0) {
          toast.error(
            `Import finished with ${failureCount} failed row${failureCount === 1 ? '' : 's'}`
          );
        } else {
          toast.success(
            `Imported ${successCount}, ${failureCount} failed`
          );
        }
        return { success: true, data: result };
      } catch (err) {
        const message = err?.message || 'Failed to import products';
        toast.error(message);
        return { success: false, error: { message } };
      }
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
    exportProducts,
    importProducts,
  };
};
