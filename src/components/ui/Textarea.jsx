import { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, className = '', containerClassName = '', rows = 3, ...props },
  ref
) {
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={props.id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
          disabled:bg-slate-50 disabled:text-slate-500
          ${error ? 'border-red-400' : 'border-slate-300'}
          ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});
