import { AlertTriangle } from 'lucide-react';
import { Button } from './Button.jsx';

export function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-red-200 bg-red-50/50 px-6 py-12 text-center">
      <div className="rounded-full bg-red-100 p-3">
        <AlertTriangle className="size-6 text-red-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700">{title}</p>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
