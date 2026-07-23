import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/authHooks.js';
import { ROLES } from '@/utils/auth/auth.utils.js';

const MENU_ITEMS = [
  { type: 'link', to: '/profile', label: 'Profile', icon: User },
  { type: 'divider' },
  {
    type: 'action',
    id: 'logout',
    label: 'Sign Out',
    icon: LogOut,
    danger: true,
  },
];

export function NavbarUserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    // Capture phase so outside clicks are caught even if children stop propagation
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  const handleAction = async (id) => {
    close();
    if (id === 'logout') await logout();
  };

  const roleLabel = user?.role === ROLES.ADMIN ? 'Admin' : 'Seller';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-lg p-1.5 transition-all duration-200 hover:bg-gray-100"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-sm font-semibold text-white shadow-sm ring-2 ring-primary-100 transition-all duration-200 hover:shadow-md">
          <User className="size-5 text-white" />
        </div>

        <div className="hidden min-w-0 text-left sm:block">
          <p className="truncate text-sm font-medium text-gray-800">{user?.name}</p>
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
        </div>

        <ChevronDown
          className={`hidden size-4 text-gray-400 transition-transform duration-200 sm:block ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl shadow-gray-200/50"
        >
          <div className="border-b border-gray-100 px-4 pb-3">
            <p className="text-sm font-medium text-gray-800">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <p className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-500">
              {roleLabel}
            </p>
          </div>

          {MENU_ITEMS.map((item, index) => {
            if (item.type === 'divider') {
              return (
                <div key={`divider-${index}`} className="my-1 border-t border-gray-100" />
              );
            }

            const Icon = item.icon;
            const className = item.danger
              ? 'flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50'
              : 'flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900';

            if (item.type === 'link') {
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  role="menuitem"
                  onClick={close}
                  className={className}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                onClick={() => handleAction(item.id)}
                className={className}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
