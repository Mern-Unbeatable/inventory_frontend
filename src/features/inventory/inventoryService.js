import { inventoryAPI } from './inventoryAPI.js';
import { unwrapData, unwrapList } from '@/config/api/config.response.js';

export const inventoryService = {
  async list(params) {
    const { data } = await inventoryAPI.list(params);
    return unwrapList(data);
  },

  async myInventory() {
    const { data } = await inventoryAPI.me();
    const payload = unwrapData(data);
    return {
      user: payload?.user || null,
      items: payload?.items || [],
      summary: payload?.summary || { productCount: 0, totalQuantity: 0 },
    };
  },

  async getUserInventory(userId) {
    const { data } = await inventoryAPI.getByUser(userId);
    return unwrapData(data);
  },

  async assign(payload) {
    const { data } = await inventoryAPI.assign(payload);
    return unwrapData(data);
  },

  async setQuantity(id, quantity) {
    const { data } = await inventoryAPI.setQuantity(id, { quantity });
    return unwrapData(data);
  },

  async adjust(id, delta) {
    const { data } = await inventoryAPI.adjust(id, { delta });
    return unwrapData(data);
  },

  async sell(id, quantity) {
    const { data } = await inventoryAPI.sell(id, { quantity });
    return unwrapData(data);
  },

  async unassign(id) {
    const { data } = await inventoryAPI.unassign(id);
    return unwrapData(data);
  },
};
