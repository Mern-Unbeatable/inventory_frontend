export function ProductCardSkeleton() {
  return (
    <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm'>
      <div className='h-44 w-full animate-pulse bg-slate-200' />
      <div className='space-y-3 p-4'>
        <div className='h-4 w-3/4 animate-pulse rounded bg-slate-200' />
        <div className='h-3 w-1/2 animate-pulse rounded bg-slate-100' />
        <div className='grid grid-cols-2 gap-3 pt-2'>
          <div className='h-10 animate-pulse rounded-lg bg-slate-100' />
          <div className='h-10 animate-pulse rounded-lg bg-slate-100' />
        </div>
        <div className='h-8 w-full animate-pulse rounded-lg bg-slate-100' />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
