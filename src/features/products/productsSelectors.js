export const selectProducts = (state) => state.products;
export const selectProductItems = (state) => state.products.items;
export const selectProductMeta = (state) => state.products.meta;
export const selectProductFilters = (state) => state.products.filters;
export const selectSelectedProduct = (state) => state.products.selected;
export const selectProductsStatus = (state) => state.products.status;
export const selectProductsMutationStatus = (state) => state.products.mutationStatus;
export const selectProductsError = (state) => state.products.error;
