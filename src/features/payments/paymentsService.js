import { paymentsAPI } from './paymentsAPI.js';
import { unwrapData, unwrapList } from '@/config/api/config.response.js';

export const paymentsService = {
  async list(params) {
    const { data } = await paymentsAPI.list(params);
    return unwrapList(data);
  },

  async getById(id) {
    const { data } = await paymentsAPI.getById(id);
    return unwrapData(data);
  },

  async create(payload) {
    const { data } = await paymentsAPI.create(payload);
    return unwrapData(data);
  },

  async remove(id) {
    const { data } = await paymentsAPI.remove(id);
    return unwrapData(data);
  },
};
