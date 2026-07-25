import { customersAPI } from './customersAPI.js';
import { unwrapData, unwrapList } from '@/config/api/config.response.js';

export const customersService = {
  async list(params) {
    const { data } = await customersAPI.list(params);
    return unwrapList(data);
  },

  async getById(id) {
    const { data } = await customersAPI.getById(id);
    return unwrapData(data);
  },

  async create(payload) {
    const { data } = await customersAPI.create(payload);
    return unwrapData(data);
  },

  async update(id, payload) {
    const { data } = await customersAPI.update(id, payload);
    return unwrapData(data);
  },

  async remove(id) {
    await customersAPI.remove(id);
  },

  async invoices(id, params) {
    const { data } = await customersAPI.invoices(id, params);
    return unwrapList(data);
  },

  async purchaseHistory(id, params) {
    const { data } = await customersAPI.purchaseHistory(id, params);
    return unwrapList(data);
  },

  async createPortalAccount(id, payload) {
    const { data } = await customersAPI.createPortalAccount(id, payload);
    return unwrapData(data);
  },
};
