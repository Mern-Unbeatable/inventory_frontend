import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader.jsx';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/forms/Input.jsx';
import { useAuth } from '@/features/auth/authHooks.js';
import { changePasswordSchema } from '@/features/auth/authValidation.js';

const SETTINGS_SECTIONS = [
  {
    id: 'security',
    title: 'Security',
    description: 'Manage your password and account security.',
  },
];

export default function SettingsPage() {
  const navigate = useNavigate();
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
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Settings"
        description="Configure your account preferences. More options can be added here over time."
      />

      <div className="space-y-6">
        {SETTINGS_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
          >
            <h2 className="text-sm font-semibold text-slate-900">{section.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{section.description}</p>

            {section.id === 'security' && (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
                <Input
                  id="currentPassword"
                  type="password"
                  label="Current password"
                  icon={Lock}
                  autoComplete="current-password"
                  error={errors.currentPassword?.message}
                  disabled={isSaving}
                  {...register('currentPassword')}
                />
                <Input
                  id="newPassword"
                  type="password"
                  label="New password"
                  icon={KeyRound}
                  autoComplete="new-password"
                  hint="At least 8 characters"
                  error={errors.newPassword?.message}
                  disabled={isSaving}
                  {...register('newPassword')}
                />
                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirm new password"
                  icon={KeyRound}
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  disabled={isSaving}
                  {...register('confirmPassword')}
                />

                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={isSaving} disabled={isSaving}>
                    Update password
                  </Button>
                </div>
              </form>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
