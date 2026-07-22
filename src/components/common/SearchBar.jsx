import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

/**
 * Debounces user input before calling `onSearch`, so callers don't fire a
 * request on every keystroke. Keeps its own draft value in local state and
 * only commits upstream after `delay` ms of inactivity.
 */
export function SearchBar({ value = '', onSearch, placeholder = 'Search…', delay = 400, className = '' }) {
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (draft !== value) onSearch(draft);
    }, delay);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900
          placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
      />
    </div>
  );
}
