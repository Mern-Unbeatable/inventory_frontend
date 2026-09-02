import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  bulkDeleteCountriesThunk,
  createCountryThunk,
  deleteCountryThunk,
  fetchCountriesThunk,
  updateCountryThunk,
} from "./countriesSlice.js";
import {
  selectCountriesError,
  selectCountriesMutationStatus,
  selectCountriesStatus,
  selectCountryItems,
} from "./countriesSelectors.js";

export const useCountries = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCountryItems);
  const status = useSelector(selectCountriesStatus);
  const mutationStatus = useSelector(selectCountriesMutationStatus);
  const error = useSelector(selectCountriesError);

  const loadCountries = useCallback(
    () => dispatch(fetchCountriesThunk()),
    [dispatch],
  );

  const createCountry = useCallback(
    async (payload) => {
      const result = await dispatch(createCountryThunk(payload));
      if (createCountryThunk.fulfilled.match(result)) {
        toast.success("Country created");
        dispatch(fetchCountriesThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || "Failed to create country");
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const updateCountry = useCallback(
    async (id, payload) => {
      const result = await dispatch(updateCountryThunk({ id, payload }));
      if (updateCountryThunk.fulfilled.match(result)) {
        toast.success("Country updated");
        dispatch(fetchCountriesThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || "Failed to update country");
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const deleteCountry = useCallback(
    async (id) => {
      const result = await dispatch(deleteCountryThunk(id));
      if (deleteCountryThunk.fulfilled.match(result)) {
        toast.success("Country deleted");
        dispatch(fetchCountriesThunk());
        return { success: true };
      }
      toast.error(result.payload?.message || "Failed to delete country");
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  const bulkDeleteCountries = useCallback(
    async (ids) => {
      const result = await dispatch(bulkDeleteCountriesThunk(ids));
      if (bulkDeleteCountriesThunk.fulfilled.match(result)) {
        toast.success(
          result.payload?.deletedCount > 1
            ? `${result.payload.deletedCount} countries deleted`
            : "Country deleted",
        );
        dispatch(fetchCountriesThunk());
        return { success: true };
      }
      toast.error(
        result.payload?.message || "Failed to delete selected countries",
      );
      return { success: false, error: result.payload };
    },
    [dispatch],
  );

  return {
    items,
    status,
    mutationStatus,
    error,
    isLoading: status === "loading",
    isMutating: mutationStatus === "loading",
    loadCountries,
    createCountry,
    updateCountry,
    deleteCountry,
    bulkDeleteCountries,
  };
};
