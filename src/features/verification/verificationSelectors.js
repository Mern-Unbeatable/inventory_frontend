export const selectVerificationItems = (state) => state.verifications.items;
export const selectVerificationMeta = (state) => state.verifications.meta;
export const selectVerificationFilters = (state) => state.verifications.filters;
export const selectVerificationsStatus = (state) => state.verifications.status;
export const selectVerificationsMutationStatus = (state) =>
  state.verifications.mutationStatus;
export const selectVerificationsError = (state) => state.verifications.error;
