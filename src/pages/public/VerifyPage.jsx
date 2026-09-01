import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BadgeCheck, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { verificationService } from "@/features/verification/verificationService.js";
import { appConfig } from "@/config/app.config.js";
import { formatDateTime } from "@/utils/format/date.js";

/**
 * Public product verification page (no authentication required).
 * Reachable via the printed QR code URL: /verify/:qrId
 * Displays only safe, customer-facing information.
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
    runVerify();
  }, [runVerify]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex items-center justify-center gap-2 text-slate-500">
          <ShieldCheck className="size-5 text-primary-600" />
          <span className="text-sm font-semibold tracking-tight">
            {appConfig.appName} · Product Verification
          </span>
        </div>

        {state.status === "loading" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Loader2 className="mx-auto size-8 animate-spin text-primary-600" />
            <p className="mt-4 text-sm text-slate-500">Verifying this code…</p>
          </div>
        )}

        {state.status === "error" && (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-100">
              <ShieldAlert className="size-7 text-red-600" />
            </div>
            <h1 className="mt-4 text-lg font-semibold text-slate-900">
              Not verified
            </h1>
            <p className="mt-2 text-sm text-slate-500">{state.error}</p>
            <p className="mt-4 font-mono text-xs text-slate-400">
              Code: {qrId}
            </p>
            <button
              type="button"
              onClick={runVerify}
              className="mt-6 inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Try again
            </button>
          </div>
        )}

        {state.status === "success" && state.data && (
          <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">
            <div className="bg-gray-900 px-6 py-6 text-center text-white">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-500/50">
                <BadgeCheck className="size-8" />
              </div>
              <h1 className="mt-3 text-xl font-bold tracking-tight">
                Verified Product
              </h1>
            </div>

            <div className="space-y-4 px-6 py-6">
              <Field label="Product name" value={state.data.productName} />
              {state.data.brand && (
                <Field label="Brand" value={state.data.brand} />
              )}
              <Field label="Product code" value={state.data.qrId} mono />
              <Field
                label="Status"
                value={
                  state.data.status === "ACTIVE" ? "Active" : state.data.status
                }
              />

              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  state.data.isFirstScan
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {state.data.isFirstScan
                  ? "Verified — First scan of this code."
                  : "Verified — This code has previously been scanned."}
              </div>

              <dl className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
                <Stat label="Total scans" value={state.data.totalScans ?? 0} />
                <Stat
                  label="First scan"
                  value={formatDateTime(state.data.firstScannedAt)}
                />
                <Stat
                  label="Last scan"
                  value={formatDateTime(state.data.lastScannedAt)}
                />
              </dl>
            </div>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          Multiple scans are normal and do not indicate a counterfeit product.
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span
        className={`text-right text-sm font-semibold text-slate-900 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-700">{value}</dd>
    </div>
  );
}
