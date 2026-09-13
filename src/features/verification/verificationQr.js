import QRCode from "qrcode";

/** High-res size for downloads — keeps modules sharp when printed/scanned. */
export const QR_DOWNLOAD_SIZE = 1024;
/** On-screen preview size (CSS may scale; source stays crisp). */
export const QR_DISPLAY_SIZE = 280;

const DARK = "#000000";
const LIGHT = "#FFFFFF";

/**
 * Build the public verification URL encoded into the QR.
 * Example: http://localhost:5173/verify/ABC12346
 */
export function buildVerificationUrl(qrId, publicAppUrl = "") {
  if (!qrId) return "";
  const origin = (
    publicAppUrl ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    "http://localhost:5173"
  ).replace(/\/$/, "");
  return `${origin}/verify/${String(qrId).trim()}`;
}

function qrOptions(width) {
  return {
    errorCorrectionLevel: "M",
    margin: 4,
    width,
    color: { dark: DARK, light: LIGHT },
  };
}

export async function generateQrPngDataUrl(text, width = QR_DOWNLOAD_SIZE) {
  return QRCode.toDataURL(text, {
    ...qrOptions(width),
    type: "image/png",
  });
}

export async function generateQrSvgString(text, width = QR_DOWNLOAD_SIZE) {
  return QRCode.toString(text, {
    ...qrOptions(width),
    type: "svg",
  });
}

function safeFilename(qrId) {
  return `qr-${String(qrId).replace(/[^A-Za-z0-9_-]/g, "_")}`;
}

function triggerDownload(blob, filename) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "application/octet-stream";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

/** Convert a PNG data URL to a JPEG blob with an explicit white background. */
function pngDataUrlToJpegBlob(pngDataUrl, quality = 0.95) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not create canvas for JPEG export"));
        return;
      }
      ctx.fillStyle = LIGHT;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("JPEG conversion failed"));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => reject(new Error("Failed to load QR image for JPEG"));
    img.src = pngDataUrl;
  });
}

/**
 * Download a QR for the given verification URL.
 * @param {"png"|"jpg"|"jpeg"|"svg"|"pdf"} format
 */
export async function downloadVerificationQr(verifyUrl, qrId, format) {
  const base = safeFilename(qrId);
  const normalized = String(format).toLowerCase();

  if (normalized === "png") {
    const dataUrl = await generateQrPngDataUrl(verifyUrl);
    triggerDownload(dataUrlToBlob(dataUrl), `${base}.png`);
    return;
  }

  if (normalized === "jpg" || normalized === "jpeg") {
    const dataUrl = await generateQrPngDataUrl(verifyUrl);
    const blob = await pngDataUrlToJpegBlob(dataUrl);
    triggerDownload(blob, `${base}.jpg`);
    return;
  }

  if (normalized === "svg") {
    const svg = await generateQrSvgString(verifyUrl);
    triggerDownload(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
      `${base}.svg`,
    );
    return;
  }

  if (normalized === "pdf") {
    const [{ jsPDF }, dataUrl] = await Promise.all([
      import("jspdf"),
      generateQrPngDataUrl(verifyUrl),
    ]);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });
    const pageW = pdf.internal.pageSize.getWidth();
    const qrSize = 320;
    const x = (pageW - qrSize) / 2;
    const y = 96;

    pdf.setFontSize(12);
    pdf.setTextColor(30);
    pdf.text(`QR ID: ${qrId}`, pageW / 2, 56, { align: "center" });
    pdf.addImage(dataUrl, "PNG", x, y, qrSize, qrSize);
    pdf.setFontSize(9);
    pdf.setTextColor(100);
    const urlLines = pdf.splitTextToSize(verifyUrl, pageW - 80);
    pdf.text(urlLines, pageW / 2, y + qrSize + 28, { align: "center" });
    pdf.save(`${base}.pdf`);
    return;
  }

  throw new Error(`Unsupported QR download format: ${format}`);
}
