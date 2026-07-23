import { NavLink } from 'react-router-dom';
import {
  Boxes,
  Building2,
  Globe2,
  LayoutDashboard,
  LogOut,
  Package,
  Users,
  Warehouse,
} from 'lucide-react';
import { appConfig } from '@/config/app.config.js';
import { useAuth } from '@/features/auth/authHooks.js';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/countries', label: 'Countries', icon: Globe2, adminOnly: true },
  { to: '/branches', label: 'Branches', icon: Building2, adminOnly: true },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
];

export function Sidebar({ onNavigate }) {
  const { isAdmin, logout } = useAuth();

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className='flex h-full flex-col bg-slate-950 text-slate-100'>
      <div className='flex gap-2.5 border-b border-slate-800 px-5 h-18 items-center justify-start sm:justify-center'>
        <div className='flex size-9 items-center justify-center rounded-lg bg-primary-500'>
          <Boxes className='size-5 text-white' />
        </div>
        <div className='min-w-0'>
          <p className='truncate text-sm font-semibold tracking-tight'>
            {appConfig.appName}
          </p>
          <p className='text-xs text-slate-400'>Multi-branch stock</p>
        </div>
      </div>

      <nav className='flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin'>
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`
            }
          >
            <Icon className='size-4 shrink-0' />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className='border-t border-slate-800 p-3'>
        <button
          type='button'
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className='flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-900 hover:text-white'
        >
          <LogOut className='size-4' />
          Logout
        </button>
      </div>
    </aside>
  );
}
