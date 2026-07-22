import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardThunk } from './dashboardSlice.js';
import {
  selectDashboardData,
  selectDashboardError,
  selectDashboardStatus,
} from './dashboardSelectors.js';

export const useDashboard = () => {
  const dispatch = useDispatch();
  const data = useSelector(selectDashboardData);
  const status = useSelector(selectDashboardStatus);
  const error = useSelector(selectDashboardError);

  const loadDashboard = useCallback(() => dispatch(fetchDashboardThunk()), [dispatch]);

  return {
    data,
    status,
    error,
    isLoading: status === 'loading',
    loadDashboard,
  };
};
