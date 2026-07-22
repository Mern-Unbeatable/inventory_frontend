import { Toaster } from 'react-hot-toast';

/**
 * Centralizes react-hot-toast's visual styling so every `toast.success()` /
 * `toast.error()` call elsewhere in the app looks consistent without each
 * call site repeating style props.
 */
export function ToastProvider() {
  return (
    <Toaster
      position='bottom-right'
      toastOptions={{
        duration: 3500,
        style: {
          fontSize: '0.875rem',
          borderRadius: '0.5rem',
          padding: '0.625rem 0.875rem',
        },
        success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
        error: { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
      }}
    />
  );
}
