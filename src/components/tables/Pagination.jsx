import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function Pagination({ page = 1, totalPages = 1, total = 0, limit = 10, onPageChange }) {
  if (totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
      <p className="text-sm text-slate-500">
        Showing <span className="font-medium text-slate-700">{startItem}</span>–
        <span className="font-medium text-slate-700">{endItem}</span> of{' '}
        <span className="font-medium text-slate-700">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={ChevronLeft}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        />
        <span className="text-sm text-slate-600">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          icon={ChevronRight}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        />
      </div>
    </div>
  );
}
