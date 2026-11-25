export function StatCard({ title, value, icon: Icon, hint, tone = 'primary' }) {
  const toneClasses = {
    primary: 'bg-primary-50 text-primary-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="flex h-full min-h-[5.5rem] items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:min-h-[6rem] sm:p-5">
      {Icon && (
        <div className={`mt-0.5 shrink-0 rounded-lg p-2 sm:p-2.5 ${toneClasses[tone]}`}>
          <Icon className="size-4 sm:size-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-500 sm:text-sm">{title}</p>
        <p className="mt-1 break-words text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          {value}
        </p>
        {hint ? (
          <p className="mt-1 truncate text-xs text-slate-400">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
