import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/features/cart/cartHooks.js';

export function CartButton() {
  const { lineCount } = useCart();

  return (
    <Link
      to='/cart'
      className='relative rounded-lg p-2 text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-700'
      aria-label={`Cart${lineCount ? `, ${lineCount} products` : ''}`}
    >
      <ShoppingCart className='size-5' />
      {lineCount > 0 ? (
        <span className='absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white'>
          {lineCount > 99 ? '99+' : lineCount}
        </span>
      ) : null}
    </Link>
  );
}
