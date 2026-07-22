import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Slide-in panel from the left, used for the mobile sidebar navigation.
 */
export function Drawer({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} aria-hidden="true" />
      <div className="relative flex h-full w-72 max-w-[80%] flex-col bg-white shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close menu"
        >
          <X className="size-5" />
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
}
