import { Inbox } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
      <div className="rounded-full bg-slate-100 p-3">
        <Icon className="size-6 text-slate-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
