import { Menu } from 'lucide-react';
import { useAuth } from '@/features/auth/authHooks.js';
import { getInitials } from '@/utils/auth/auth.utils.js';
import { RoleChip } from '@/components/ui/StatusChip.jsx';

export function Navbar({ title, onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <h2 className="text-sm font-semibold text-slate-800 sm:text-base">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        {user?.role && <RoleChip role={user.role} />}
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
            {getInitials(user?.name)}
          </div>
          <div className="hidden min-w-0 sm:block">
            <p className="truncate text-sm font-medium text-slate-800">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
