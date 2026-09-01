import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  createVerificationThunk,
  deleteVerificationThunk,
  fetchVerificationsThunk,
  setVerificationFilters,
  updateVerificationThunk,
} from "./verificationSlice.js";
import {
  selectVerificationFilters,
  selectVerificationItems,
  selectVerificationMeta,
  selectVerificationsError,
  selectVerificationsMutationStatus,
  selectVerificationsStatus,
} from "./verificationSelectors.js";

export const useVerifications = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectVerificationItems);
  const meta = useSelector(selectVerificationMeta);
  const filters = useSelector(selectVerificationFilters);
  const status = useSelector(selectVerificationsStatus);
  const mutationStatus = useSelector(selectVerificationsMutationStatus);
  const error = useSelector(selectVerificationsError);

  const loadVerifications = useCallback(
    (params) => dispatch(fetchVerificationsThunk(params)),
    [dispatch],
  );

  const updateFilters = useCallback(
    (next) => {
      dispatch(setVerificationFilters(next));
    },
    [dispatch],
  );

  const createVerification = useCallback(
    async (payload) => {
      const result = await dispatch(createVerificationThunk(payload));
      if (createVerificationThunk.fulfilled.match(result)) {
        toast.success("QR mapping created");
        dispatch(fetchVerificationsThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || "Failed to create QR mapping");
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const updateVerification = useCallback(
    async (id, payload) => {
      const result = await dispatch(updateVerificationThunk({ id, payload }));
      if (updateVerificationThunk.fulfilled.match(result)) {
        toast.success("QR mapping updated");
        dispatch(fetchVerificationsThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || "Failed to update QR mapping");
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const deleteVerification = useCallback(
    async (id) => {
      const result = await dispatch(deleteVerificationThunk(id));
      if (deleteVerificationThunk.fulfilled.match(result)) {
        toast.success("QR mapping deleted");
        dispatch(fetchVerificationsThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || "Failed to delete QR mapping");
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  return {
    items,
    meta,
    filters,
    status,
    mutationStatus,
    error,
    isLoading: status === "loading",
    isMutating: mutationStatus === "loading",
    loadVerifications,
    updateFilters,
    createVerification,
    updateVerification,
    deleteVerification,
  };
};
