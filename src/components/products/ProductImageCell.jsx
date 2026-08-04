import { resolveMediaUrl } from '@/utils/media/url.js';

/** Table thumbnail — matches Products page inventory list styling. */
export function ProductImageCell({ imageUrl }) {
  const src = resolveMediaUrl(imageUrl);

  if (src) {
    return (
      <img
        src={src}
        alt=''
        className='size-9 rounded-lg object-cover ring-1 ring-slate-200 sm:size-10'
        loading='lazy'
      />
    );
  }

  return (
    <div className='flex size-9 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 sm:size-10'>
      —
    </div>
  );
}
