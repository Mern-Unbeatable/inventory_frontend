import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Drawer } from '@/components/ui/Drawer.jsx';
import { Sidebar } from './Sidebar.jsx';
import { Navbar } from './Navbar.jsx';
import { Footer } from './Footer.jsx';

const TITLE_MAP = {
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/inventory': 'Inventory',
  '/branches': 'Branches',
  '/countries': 'Countries',
  '/users': 'Users',
  '/profile': 'Profile',
  '/settings': 'Settings',
};

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  const title = useMemo(() => {
    const match = Object.keys(TITLE_MAP).find((path) =>
      pathname.startsWith(path),
    );
    return TITLE_MAP[match] || 'Inventory';
  }, [pathname]);

  return (
    <div className='flex h-full min-h-screen bg-surface-muted'>
      <div className='hidden w-64 shrink-0 lg:block'>
        <div className='fixed inset-y-0 left-0 w-64'>
          <Sidebar />
        </div>
      </div>

      <Drawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <div className='flex min-w-0 flex-1 flex-col'>
        <Navbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <main className='flex-1 px-4 py-6 sm:px-6 lg:px-8'>
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
    </div>
  );
}
