import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/** Tracks stacked modals so body scroll stays locked until the last one closes. */
let openModalCount = 0;

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
  /** Optional fixed strip under the header (e.g. search) — does not scroll. */
  toolbar,
  children,
  /** When false, clicking the backdrop does not close the modal. */
  closeOnBackdrop = true,
  /** When false, skips backdrop blur (smoother scroll in nested/heavy modals). */
  blurBackdrop = true,
  /** Tailwind z-index class for nested modals (default z-50). */
  zIndexClass = 'z-50',
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    openModalCount += 1;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className={`fixed inset-0 ${zIndexClass} flex items-center justify-center p-4`}>
      <div
        className={`absolute inset-0 bg-black/45 ${blurBackdrop ? 'backdrop-blur-xs' : ''}`}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden='true'
      />
      <div
        role='dialog'
        aria-modal='true'
        className={`relative flex w-full ${SIZE_CLASSES[size]} max-h-[min(90vh,100dvh)] flex-col overflow-hidden rounded-xl bg-white shadow-xl isolate`}
      >
        <div className='sticky top-0 z-20 shrink-0 border-b border-slate-200 bg-white px-5 py-4'>
          <div className='flex items-start justify-between gap-3'>
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
        </div>

        {toolbar ? (
          <div className='shrink-0 border-b border-slate-200 bg-white px-4 py-2.5'>
            {toolbar}
          </div>
        ) : null}

        <div className='min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]'>
          {children}
        </div>

        {footer && (
          <div className='sticky bottom-0 z-20 shrink-0 border-t border-slate-200 bg-white px-5 py-4'>
            <div className='flex justify-end gap-2'>{footer}</div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
