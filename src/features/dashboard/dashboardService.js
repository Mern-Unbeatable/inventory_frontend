import { dashboardAPI } from './dashboardAPI.js';
import { unwrapData } from '@/config/api/config.response.js';

export const dashboardService = {
  async fetchOverview() {
    const { data } = await dashboardAPI.getOverview();
    return unwrapData(data);
  },
};
