import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Full-screen image preview overlay.
 * Uses the same portal / backdrop / escape / close pattern as Modal.jsx.
 */
export function ImageLightbox({ isOpen, onClose, src, alt = '' }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return createPortal(
    <div className='fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-8'>
      <div
        className='absolute inset-0 bg-black/75 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden='true'
      />
      <button
        type='button'
        onClick={onClose}
        className='absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70'
        aria-label='Close image preview'
      >
        <X className='size-5' />
      </button>
      <img
        src={src}
        alt={alt}
        className='relative max-h-[85vh] max-w-full rounded-lg object-contain shadow-2xl'
        onClick={(event) => event.stopPropagation()}
      />
    </div>,
    document.body,
  );
}
