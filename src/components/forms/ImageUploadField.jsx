import { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { resolveMediaUrl } from '@/utils/media/url.js';
import { appConfig } from '@/config/app.config.js';

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';
const DEFAULT_MAX_BYTES = appConfig.uploadMaxFileSize || 2 * 1024 * 1024;

/**
 * Reusable local image picker with preview.
 * Does not upload by itself — parent submits the File via FormData.
 */
export function ImageUploadField({
  label = 'Image',
  hint,
  error,
  valueFile = null,
  existingUrl = null,
  onChange,
  onClearExisting,
  disabled = false,
  accept = DEFAULT_ACCEPT,
  maxBytes = DEFAULT_MAX_BYTES,
  className = '',
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [localError, setLocalError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!valueFile) {
      setPreviewUrl(null);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(valueFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [valueFile]);

  const displayUrl = previewUrl || resolveMediaUrl(existingUrl);
  const maxMb = Math.round(maxBytes / (1024 * 1024));

  const validateAndSelect = (file) => {
    setLocalError(null);
    if (!file) {
      onChange?.(null);
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setLocalError('Only JPG, PNG, or WEBP images are allowed');
      onChange?.(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    if (file.size > maxBytes) {
      setLocalError(`Image must be ${maxMb}MB or smaller`);
      onChange?.(null);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    onChange?.(file);
  };

  const handleClear = () => {
    setLocalError(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = '';
    if (existingUrl && !valueFile) {
      onClearExisting?.();
    }
  };

  const showClear = Boolean(valueFile || existingUrl);
  const message = error || localError || hint || `JPG, PNG, or WEBP · max ${maxMb}MB`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
          {displayUrl ? (
            <img src={displayUrl} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus className="size-8 text-slate-300" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={accept}
            disabled={disabled}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-60"
            onChange={(event) => validateAndSelect(event.target.files?.[0] || null)}
          />

          {showClear && (
            <ButtonClear onClick={handleClear} disabled={disabled} />
          )}

          <p className={`text-xs ${error || localError ? 'text-red-600' : 'text-slate-500'}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}

function ButtonClear({ onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-red-600 disabled:opacity-60"
    >
      <X className="size-3.5" />
      Remove image
    </button>
  );
}
