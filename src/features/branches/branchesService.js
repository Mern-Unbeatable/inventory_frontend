import { branchesAPI } from './branchesAPI.js';
import { unwrapData, unwrapList } from '@/config/api/config.response.js';

export const branchesService = {
  async list(params) {
    const { data } = await branchesAPI.list(params);
    return unwrapList(data);
  },
  async create(payload) {
    const { data } = await branchesAPI.create(payload);
    return unwrapData(data);
  },
  async update(id, payload) {
    const { data } = await branchesAPI.update(id, payload);
    return unwrapData(data);
  },
  async remove(id) {
    await branchesAPI.remove(id);
  },
};
