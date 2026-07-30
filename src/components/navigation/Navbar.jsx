import { Menu, Search } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/features/auth/authHooks.js';
import { ROLES } from '@/utils/auth/auth.utils.js';
import { CartButton } from '@/components/cart/CartButton.jsx';
import { NavbarUserMenu } from './NavbarUserMenu.jsx';

export function Navbar({ title, onMenuClick }) {
  const { user, isCustomer } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const roleLabel =
    user?.role === ROLES.ADMIN
      ? 'Admin'
      : user?.role === ROLES.CUSTOMER
        ? 'Customer'
        : 'Seller';

  return (
    <header className='sticky top-0 z-30 flex py-2 sm:py-[12px] items-center justify-between gap-3 border-b border-gray-200 bg-white/80 px-4 backdrop-blur-xl transition-all duration-200 sm:px-6'>
      <div className='flex min-w-0 items-center gap-3'>
        <button
          type='button'
          onClick={onMenuClick}
          className='rounded-lg p-2 text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 active:scale-95 lg:hidden'
          aria-label='Toggle menu'
        >
          <Menu className='size-5' />
        </button>
      </div>

      <div className='flex items-center gap-2 sm:gap-3'>
        <div className='relative hidden md:block'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='Search...'
            className='h-9 w-48 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 transition-all duration-200 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 lg:w-64'
          />
        </div>

        <button
          type='button'
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className='rounded-lg p-2 text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700 md:hidden'
          aria-label='Toggle search'
        >
          <Search className='size-5' />
        </button>

        <div className='hidden h-8 w-px bg-gray-200 sm:block' />

        {isCustomer ? <CartButton /> : null}

        <NavbarUserMenu />
      </div>

      {isSearchOpen && (
        <div className='absolute left-0 right-0 top-full mt-0 border-b border-gray-200 bg-white p-3 shadow-lg md:hidden'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search...'
              className='h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100'
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
