export const selectCartItems = (state) => state.cart.items;

export const selectCartItemCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartLineCount = (state) => state.cart.items.length;

export const selectCartGrandTotal = (state) =>
  state.cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

export const selectIsProductInCart = (productId) => (state) =>
  state.cart.items.some((item) => item.productId === productId);
