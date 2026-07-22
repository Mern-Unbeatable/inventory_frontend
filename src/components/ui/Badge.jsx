const COLOR_CLASSES = {
  slate: 'bg-slate-100 text-slate-700',
  primary: 'bg-primary-100 text-primary-700',
  green: 'bg-green-100 text-green-700',
  amber: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
};

export function Badge({ color = 'slate', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLOR_CLASSES[color]} ${className}`}
    >
      {children}
    </span>
  );
}
