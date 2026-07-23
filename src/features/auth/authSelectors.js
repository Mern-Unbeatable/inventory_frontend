export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsBootstrapped = (state) => state.auth.isBootstrapped;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthMutationStatus = (state) => state.auth.mutationStatus;
export const selectAuthError = (state) => state.auth.error;
export const selectUserRole = (state) => state.auth.user?.role;
