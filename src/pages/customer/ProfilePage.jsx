import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  Globe,
  KeyRound,
  Lock,
  Mail,
  Shield,
  User,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/forms/Input.jsx';
import { useAuth } from '@/features/auth/authHooks.js';
import { changePasswordSchema } from '@/features/auth/authValidation.js';
import { getInitials, ROLES } from '@/utils/auth/auth.utils.js';

const PROFILE_TAB = { id: 'profile', label: 'Profile Information' };
const PASSWORD_TAB = { id: 'password', label: 'Change Password' };

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

function ChangePasswordPanel() {
  const { changePassword, mutationStatus } = useAuth();
  const isSaving = mutationStatus === 'loading';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    const result = await changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });

    if (result.success) {
      reset();
    }
  };

  return (
    <section className='rounded-xl border border-slate-200 bg-white p-5 sm:p-6'>
      <h2 className='text-sm font-semibold text-slate-900'>Change password</h2>
      <p className='mt-1 text-sm text-slate-500'>
        Update your password. You will be signed out after a successful change.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='mt-5 max-w-md space-y-4'
        noValidate
      >
        <Input
          id='currentPassword'
          type='password'
          label='Current password'
          icon={Lock}
          autoComplete='current-password'
          error={errors.currentPassword?.message}
          disabled={isSaving}
          {...register('currentPassword')}
        />
        <Input
          id='newPassword'
          type='password'
          label='New password'
          icon={KeyRound}
          autoComplete='new-password'
          hint='At least 8 characters'
          error={errors.newPassword?.message}
          disabled={isSaving}
          {...register('newPassword')}
        />
        <Input
          id='confirmPassword'
          type='password'
          label='Confirm new password'
          icon={KeyRound}
          autoComplete='new-password'
          error={errors.confirmPassword?.message}
          disabled={isSaving}
          {...register('confirmPassword')}
        />

        <div className='flex justify-end pt-2'>
          <Button type='submit' isLoading={isSaving} disabled={isSaving}>
            Update password
          </Button>
        </div>
      </form>
    </section>
  );
}

export default function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabs = isAdmin ? [PROFILE_TAB, PASSWORD_TAB] : [PROFILE_TAB];
  const requestedTab = searchParams.get('tab');
  const activeTab =
    isAdmin && requestedTab === 'password' ? 'password' : 'profile';

  useEffect(() => {
    if (!isAdmin && requestedTab === 'password') {
      setSearchParams({}, { replace: true });
      return;
    }
    if (requestedTab && !tabs.some((tab) => tab.id === requestedTab)) {
      setSearchParams({}, { replace: true });
    }
  }, [isAdmin, requestedTab, setSearchParams, tabs]);

  const roleLabel = useMemo(() => {
    if (user?.role === ROLES.ADMIN) return 'Admin';
    if (user?.role === ROLES.CUSTOMER) return 'Customer';
    return 'Seller';
  }, [user?.role]);

  const countryLabel = user?.branch?.country?.name || '—';
  const branchLabel =
    user?.branch?.name ||
    (user?.role === ROLES.ADMIN ? 'All branches' : 'Not assigned');

  return (
    <div className='mx-auto max-w-2xl'>
      <PageHeader
        title='Profile'
        description='Manage your account information and security settings.'
      />

      {isAdmin ? (
        <div className='mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1'>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type='button'
                onClick={() =>
                  setSearchParams(tab.id === 'profile' ? {} : { tab: tab.id })
                }
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {activeTab === 'profile' ? (
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
            {user?.role !== ROLES.CUSTOMER ? (
              <>
                <InfoRow icon={Globe} label='Country' value={countryLabel} />
                <InfoRow icon={Building2} label='Branch' value={branchLabel} />
              </>
            ) : null}
            <InfoRow icon={User} label='Full name' value={user?.name} />
            <InfoRow icon={Mail} label='Email' value={user?.email} />
          </dl>
        </section>
      ) : isAdmin ? (
        <ChangePasswordPanel />
      ) : null}
    </div>
  );
}
