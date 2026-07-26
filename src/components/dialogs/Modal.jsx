import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
  '3xl': 'max-w-5xl',
  '4xl': 'max-w-6xl',
  '5xl': 'max-w-7xl',
  '6xl': 'max-w-8xl',
  '7xl': 'max-w-9xl',
  '8xl': 'max-w-10xl',
  '9xl': 'max-w-11xl',
  '10xl': 'max-w-12xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  status,
  size = 'md',
  footer,
  children,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black/45 backdrop-blur-xs'
        onClick={onClose}
        aria-hidden='true'
      />
      <div
        role='dialog'
        aria-modal='true'
        className={`relative w-full ${SIZE_CLASSES[size]} max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl`}
      >
        <div className='flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4'>
          <div className='min-w-0 space-y-1.5'>
            {title && (
              <h2 className='text-base font-semibold text-slate-900'>
                {title}
              </h2>
            )}
            {description && (
              <p className='text-sm text-slate-500'>{description}</p>
            )}
            {status && <div className='text-sm'>{status}</div>}
          </div>
          <button
            type='button'
            onClick={onClose}
            className='shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            aria-label='Close'
          >
            <X className='size-5' />
          </button>
        </div>
        <div className='p-4'>{children}</div>
        {footer && (
          <div className='flex justify-end gap-2 border-t border-slate-200 px-5 py-4'>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
