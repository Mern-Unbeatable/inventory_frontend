import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    showPasswordToggle = false,
    type,
    className = '',
    containerClassName = '',
    ...props
  },
  ref
) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPasswordField = type === 'password';
  const inputType =
    showPasswordToggle && isPasswordField
      ? passwordVisible
        ? 'text'
        : 'password'
      : type;

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
          type={inputType}
          className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500
            disabled:bg-slate-50 disabled:text-slate-500
            ${Icon ? 'pl-9' : ''}
            ${showPasswordToggle && isPasswordField ? 'pr-10' : ''}
            ${error ? 'border-red-400' : 'border-slate-300'}
            ${className}`}
          {...props}
        />
        {showPasswordToggle && isPasswordField ? (
          <button
            type="button"
            tabIndex={-1}
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            {passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
});
