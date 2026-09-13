import { verificationAPI } from "./verificationAPI.js";
import { unwrapData, unwrapList } from "@/config/api/config.response.js";
import { normalizeStoredQrId } from "./verificationScannedStorage.js";

/**
 * In-flight public verify requests keyed by qrId + recordScan flag.
 * React StrictMode remounts share one in-flight promise per key.
 */
const verifyInflightByKey = new Map();

const verifyInflightKey = (qrId, recordScan) =>
  `${normalizeStoredQrId(qrId)}:${recordScan ? "1" : "0"}`;

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

  /**
   * @param {string} qrId
   * @param {{ recordScan?: boolean }} [options]
   *   recordScan=true (default) appends a scan; false returns current stats only.
   */
  async verify(qrId, { recordScan = true } = {}) {
    const key = verifyInflightKey(qrId, recordScan);
    const existing = key ? verifyInflightByKey.get(key) : null;
    if (existing) return existing;

    const request = (async () => {
      try {
        const { data } = await verificationAPI.verify(qrId, { recordScan });
        return unwrapData(data);
      } finally {
        if (key) verifyInflightByKey.delete(key);
      }
    })();

    if (key) verifyInflightByKey.set(key, request);
    return request;
  },
};
