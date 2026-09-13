import { verificationAPI } from "./verificationAPI.js";
import { unwrapData, unwrapList } from "@/config/api/config.response.js";

/**
 * In-flight public verify requests keyed by normalized qrId.
 * React StrictMode (and rapid remounts) can invoke verify twice for the same
 * code; sharing one promise ensures a single HTTP call → single scan record.
 * Cleared when the request settles so refresh / "Try again" still create new scans.
 */
const verifyInflightByQrId = new Map();

const normalizeVerifyKey = (qrId) => String(qrId ?? "").trim().toUpperCase();

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

  async bulkRemove(ids) {
    const { data } = await verificationAPI.bulkRemove(ids);
    return unwrapData(data);
  },

  async verify(qrId) {
    const key = normalizeVerifyKey(qrId);
    const existing = key ? verifyInflightByQrId.get(key) : null;
    if (existing) return existing;

    const request = (async () => {
      try {
        const { data } = await verificationAPI.verify(qrId);
        return unwrapData(data);
      } finally {
        if (key) verifyInflightByQrId.delete(key);
      }
    })();

    if (key) verifyInflightByQrId.set(key, request);
    return request;
  },
};
