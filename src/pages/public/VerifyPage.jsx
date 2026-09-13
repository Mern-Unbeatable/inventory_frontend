import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  BadgeCheck,
  Check,
  Loader2,
  Package,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { verificationService } from "@/features/verification/verificationService.js";
import { formatDateTime } from "@/utils/format/date.js";
import { resolveMediaUrl } from "@/utils/media/url.js";

/**
 * Public product verification page (no authentication required).
 * Reachable via the printed QR code URL: /verify/:qrId
 */
export default function VerifyPage() {
  const { qrId } = useParams();
  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
  });

  const runVerify = useCallback(async () => {
    setState({ status: "loading", data: null, error: null });
    try {
      const data = await verificationService.verify(qrId);
      setState({ status: "success", data, error: null });
    } catch (error) {
      setState({
        status: "error",
        data: null,
        error: error?.message || "This QR code could not be verified.",
      });
    }
  }, [qrId]);

  useEffect(() => {
    let cancelled = false;

    setState({ status: "loading", data: null, error: null });

    // Call verify immediately (sync start) so StrictMode remounts share one in-flight request.
    verificationService
      .verify(qrId)
      .then((data) => {
        if (!cancelled) {
          setState({ status: "success", data, error: null });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            status: "error",
            data: null,
            error: error?.message || "This QR code could not be verified.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [qrId]);

  const productImageSrc =
    state.status === "success"
      ? resolveMediaUrl(state.data?.productImageUrl)
      : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-5 flex items-center justify-center gap-2 text-slate-500">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span className="text-sm font-medium tracking-tight">
             Product Verification
          </span>
        </div>

        {state.status === "loading" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto size-8 animate-spin text-emerald-600" />
            <p className="mt-4 text-sm text-slate-500">Verifying this code…</p>
          </div>
        )}

        {state.status === "error" && (
          <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
            <div className="bg-slate-900 px-6 py-8 text-center text-white">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-500/20 ring-4 ring-red-500/30">
                <ShieldAlert className="size-8 text-red-400" />
              </div>
              <h1 className="mt-4 text-xl font-bold tracking-tight">
                Not verified
              </h1>
              <p className="mt-1.5 text-sm text-slate-300">
                This code could not be confirmed.
              </p>
            </div>
            <div className="space-y-4 px-6 py-6 text-center">
              <p className="text-sm text-slate-600">{state.error}</p>
              <p className="font-mono text-sm text-slate-400">Code: {qrId}</p>
              <button
                type="button"
                onClick={runVerify}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {state.status === "success" && state.data && (
          <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
            {/* Header */}
            <div className="bg-slate-900 px-6 py-8 text-center text-white">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-emerald-500/35">
                <BadgeCheck className="size-8 text-white" strokeWidth={2.25} />
              </div>
              <h1 className="mt-4 text-xl font-bold tracking-tight">
                Verified
              </h1>
              <p className="mt-1.5 text-sm text-slate-300">
                This product is authentic and registered.
              </p>
            </div>

            {/* Body */}
            <div className="space-y-5 px-6 py-6">
              {/* Product image */}
              {productImageSrc ? (
                <div className="flex justify-center">
                  <img
                    src={productImageSrc}
                    alt={state.data.productName || "Product"}
                    className="size-28 rounded-2xl object-cover ring-1 ring-slate-200"
                  />
                </div>
              ) : (
                <div className="mx-auto flex size-28 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200">
                  <Package className="size-10 text-slate-400" strokeWidth={1.5} />
                </div>
              )}

              {/* Detail rows */}
              <div className="space-y-3.5">
                <DetailRow
                  label="Name:"
                  value={state.data.productName || "—"}
                />
                {state.data.brand ? (
                  <DetailRow label="Brand" value={state.data.brand} />
                ) : null}
                <DetailRow label="QR ID:">
                  <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 font-mono text-sm font-semibold text-slate-800">
                    {state.data.qrId}
                  </span>
                </DetailRow>
                <DetailRow label="Status:">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium ${
                      state.data.status === "ACTIVE"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        state.data.status === "ACTIVE"
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                      }`}
                    />
                    {state.data.status === "ACTIVE"
                      ? "Active"
                      : state.data.status}
                  </span>
                </DetailRow>
              </div>

              {/* Scan message */}
              <div
                className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
                  state.data.isFirstScan
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                <span
                  className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                    state.data.isFirstScan
                      ? "bg-emerald-500 text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <p className="text-xs">
                  {state.data.isFirstScan
                    ? "Verified — First scan of this code. This product is genuine."
                    : "Verified — This code has previously been scanned. Multiple scans are normal. If you have any concerns, please contact the manufacturer."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, children }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      {children ?? (
        <span className="text-right text-sm font-semibold text-slate-900">
          {value}
        </span>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold text-slate-900">
        {value}
      </dd>
    </div>
  );
}
