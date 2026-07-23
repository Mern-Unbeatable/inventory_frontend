import { usersAPI } from './usersAPI.js';
import { unwrapData, unwrapList } from '@/config/api/config.response.js';

export const usersService = {
  async list(params) {
    const { data } = await usersAPI.list(params);
    return unwrapList(data);
  },
  async getById(id) {
    const { data } = await usersAPI.getById(id);
    return unwrapData(data);
  },
  async create(payload) {
    const { data } = await usersAPI.create(payload);
    return unwrapData(data);
  },
  async update(id, payload) {
    const { data } = await usersAPI.update(id, payload);
    return unwrapData(data);
  },
  async remove(id) {
    await usersAPI.remove(id);
  },
};
