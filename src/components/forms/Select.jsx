import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(function Select(
  {
    label,
    inlineLabel = false,
    error,
    hint,
    options = [],
    placeholder,
    className = '',
    containerClassName = '',
    ...props
  },
  ref,
) {
  const labelElement = label ? (
    <label
      htmlFor={props.id}
      className={
        inlineLabel
          ? 'shrink-0 text-sm font-medium text-slate-700 whitespace-nowrap'
          : 'mb-1.5 block text-sm font-medium text-slate-700'
      }
    >
      {label}
    </label>
  ) : null;

  return (
    <div
      className={`${inlineLabel ? 'flex items-center gap-2' : ''} ${containerClassName}`}
    >
      {labelElement}
      <div className={`relative ${inlineLabel ? 'shrink-0' : ''}`}>
        <select
          ref={ref}
          className={`w-full appearance-none rounded-lg border bg-white px-3 py-2 pr-9 text-sm text-slate-900
            focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
            disabled:bg-slate-50 disabled:text-slate-500
            ${error ? 'border-red-400' : 'border-slate-300'}
            ${className}`}
          {...props}
        >
          {placeholder && (
            <option value='' disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className='pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400' />
      </div>
      {error ? (
        <p className='mt-1.5 text-xs text-red-600'>{error}</p>
      ) : hint ? (
        <p className='mt-1.5 text-xs text-slate-500'>{hint}</p>
      ) : null}
    </div>
  );
});
