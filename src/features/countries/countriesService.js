import { countriesAPI } from "./countriesAPI.js";
import { unwrapData, unwrapList } from "@/config/api/config.response.js";

export const countriesService = {
  async list() {
    const { data } = await countriesAPI.list();
    // Countries endpoint returns a plain array in data
    const payload = unwrapData(data);
    if (Array.isArray(payload)) {
      return {
        items: payload,
        meta: {
          page: 1,
          limit: payload.length,
          total: payload.length,
          totalPages: 1,
        },
      };
    }
    return unwrapList(data);
  },
  async create(payload) {
    const { data } = await countriesAPI.create(payload);
    return unwrapData(data);
  },
  async update(id, payload) {
    const { data } = await countriesAPI.update(id, payload);
    return unwrapData(data);
  },
  async remove(id) {
    await countriesAPI.remove(id);
  },
  async bulkRemove(ids) {
    const { data } = await countriesAPI.bulkRemove(ids);
    return unwrapData(data);
  },
};
