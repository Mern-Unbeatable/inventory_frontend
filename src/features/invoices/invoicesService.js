import { invoicesAPI } from './invoicesAPI.js';
import { unwrapData, unwrapList } from '@/config/api/config.response.js';

export const invoicesService = {
  async list(params) {
    const { data } = await invoicesAPI.list(params);
    return unwrapList(data);
  },

  async getById(id) {
    const { data } = await invoicesAPI.getById(id);
    return unwrapData(data);
  },

  async create(payload) {
    const { data } = await invoicesAPI.create(payload);
    return unwrapData(data);
  },

  async update(id, payload) {
    const { data } = await invoicesAPI.update(id, payload);
    return unwrapData(data);
  },

  async confirm(id) {
    const { data } = await invoicesAPI.confirm(id);
    return unwrapData(data);
  },

  async cancel(id) {
    const { data } = await invoicesAPI.cancel(id);
    return unwrapData(data);
  },

  async remove(id) {
    await invoicesAPI.remove(id);
  },
};
