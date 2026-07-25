import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, className = '', containerClassName = '', ...props },
  ref
) {
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={props.id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />}
        <input
          ref={ref}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
            disabled:bg-slate-50 disabled:text-slate-500
            ${Icon ? 'pl-9' : ''}
            ${error ? 'border-red-400' : 'border-slate-300'}
            ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});
