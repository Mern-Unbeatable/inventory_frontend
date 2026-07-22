import { Loader2 } from 'lucide-react';

export function Loader({ size = 24, className = '', label }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 py-10 text-slate-400 ${className}`}>
      <Loader2 style={{ width: size, height: size }} className="animate-spin" />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}

export function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex h-screen items-center justify-center bg-surface-muted">
      <Loader size={32} label={label} />
    </div>
  );
}
