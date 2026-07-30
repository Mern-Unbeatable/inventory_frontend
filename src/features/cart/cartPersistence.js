import { setLocalItem } from '@/utils/storage/localStorage.js';
import { STORAGE_KEYS } from '@/utils/storage/storageKeys.js';

/** Persist cart state after each cart action. */
export const cartPersistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  if (typeof action.type === 'string' && action.type.startsWith('cart/')) {
    const { cart } = store.getState();
    setLocalItem(STORAGE_KEYS.CART, cart);
  }
  return result;
};
