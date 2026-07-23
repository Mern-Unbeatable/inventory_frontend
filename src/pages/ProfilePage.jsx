import { Building2, Globe, Mail, Shield, User } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { useAuth } from '@/features/auth/authHooks.js';
import { getInitials, ROLES } from '@/utils/auth/auth.utils.js';

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className='rounded-lg bg-slate-50 px-4 py-3'>
      <dt className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500'>
        <Icon className='size-3.5' />
        {label}
      </dt>
      <dd className='mt-1 text-sm font-medium text-slate-900'>
        {value || '—'}
      </dd>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();

  const roleLabel = user?.role === ROLES.ADMIN ? 'Admin' : 'Seller';
  const countryLabel = user?.branch?.country?.name || '—';
  const branchLabel =
    user?.branch?.name ||
    (user?.role === ROLES.ADMIN ? 'All branches' : 'Not assigned');

  return (
    <div className='mx-auto max-w-2xl'>
      <PageHeader title='Profile' description='Your account information.' />

      <section className='rounded-xl border border-slate-200 bg-white p-5 sm:p-6'>
        <div className='flex items-center gap-4 border-b border-slate-100 pb-5'>
          <div className='flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-lg font-semibold text-white shadow-sm'>
            {getInitials(user?.name)}
          </div>
          <div className='min-w-0'>
            <h2 className='truncate text-lg font-semibold text-slate-900'>
              {user?.name}
            </h2>
            <p className='truncate text-sm text-slate-500'>{user?.email}</p>
          </div>
        </div>

        <dl className='mt-5 grid gap-4 sm:grid-cols-2'>
          <InfoRow icon={Shield} label='Role' value={roleLabel} />
          <InfoRow icon={Globe} label='Country' value={countryLabel} />
          <InfoRow icon={Building2} label='Branch' value={branchLabel} />
          <InfoRow icon={User} label='Full name' value={user?.name} />
          <InfoRow icon={Mail} label='Email' value={user?.email} />
        </dl>
      </section>
    </div>
  );
}
