import { productsAPI } from './productsAPI.js';
import { unwrapData, unwrapList } from '@/config/api/config.response.js';

export const productsService = {
  async list(params) {
    const { data } = await productsAPI.list(params);
    return unwrapList(data);
  },

  async getById(id) {
    const { data } = await productsAPI.getById(id);
    return unwrapData(data);
  },

  async create(payload) {
    const { data } = await productsAPI.create(payload);
    return unwrapData(data);
  },

  async update(id, payload) {
    const { data } = await productsAPI.update(id, payload);
    return unwrapData(data);
  },

  async remove(id) {
    await productsAPI.remove(id);
  },
};
