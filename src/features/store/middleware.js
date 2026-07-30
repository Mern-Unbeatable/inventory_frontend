import { cartPersistenceMiddleware } from '../cart/cartPersistence.js';

/**
 * Extra middleware slot for the store. Keep this file so cross-cutting
 * concerns (logging, analytics) can be added without touching store/index.js.
 * RTK's default middleware (thunk + immutability/serializability checks in
 * development) is already enabled via configureStore.
 */
export const appMiddleware = [cartPersistenceMiddleware];
