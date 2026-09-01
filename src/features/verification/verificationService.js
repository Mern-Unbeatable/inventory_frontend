import { verificationAPI } from "./verificationAPI.js";
import { unwrapData, unwrapList } from "@/config/api/config.response.js";

export const verificationService = {
  async list(params) {
    const { data } = await verificationAPI.list(params);
    return unwrapList(data);
  },

  async getById(id) {
    const { data } = await verificationAPI.getById(id);
    return unwrapData(data);
  },

  async create(payload) {
    const { data } = await verificationAPI.create(payload);
    return unwrapData(data);
  },

  async update(id, payload) {
    const { data } = await verificationAPI.update(id, payload);
    return unwrapData(data);
  },

  async remove(id) {
    await verificationAPI.remove(id);
  },

  async verify(qrId) {
    const { data } = await verificationAPI.verify(qrId);
    return unwrapData(data);
  },
};
