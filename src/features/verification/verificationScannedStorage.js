import { getLocalItem, setLocalItem } from "@/utils/storage/localStorage.js";
import { STORAGE_KEYS } from "@/utils/storage/storageKeys.js";

export const normalizeStoredQrId = (qrId) =>
  String(qrId ?? "").trim().toUpperCase();

const readScannedQrIds = () => {
  const stored = getLocalItem(STORAGE_KEYS.VERIFIED_QR_IDS, []);
  return Array.isArray(stored) ? stored.map(normalizeStoredQrId) : [];
};

/** Whether this browser has already recorded a scan for the QR id. */
export function hasScannedQrId(qrId) {
  const key = normalizeStoredQrId(qrId);
  if (!key) return false;
  return readScannedQrIds().includes(key);
}

/** Persist that this browser recorded a scan for the QR id. */
export function markQrIdScanned(qrId) {
  const key = normalizeStoredQrId(qrId);
  if (!key) return;

  const ids = readScannedQrIds();
  if (ids.includes(key)) return;

  setLocalItem(STORAGE_KEYS.VERIFIED_QR_IDS, [...ids, key]);
}
