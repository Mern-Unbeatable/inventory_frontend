import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Boxes, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/ui/Input.jsx';
import { FullPageLoader } from '@/components/ui/Loader.jsx';
import { useAuth } from '@/features/auth/authHooks.js';
import { loginSchema } from '@/features/auth/authValidation.js';
import { appConfig } from '@/config/app.config.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isBootstrapped, status, error } = useAuth();
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isBootstrapped && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isBootstrapped, navigate, from]);

  if (!isBootstrapped) return <FullPageLoader label="Checking session…" />;
  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = async (values) => {
    const result = await login(values);
    if (result.success) navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-600/30 via-transparent to-transparent" />
        <div className="relative flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary-500">
            <Boxes className="size-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">{appConfig.appName}</span>
        </div>
        <div className="relative max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Real-time stock across every branch
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Replace WhatsApp photo updates with live inventory across countries and branches,
            with role-based access for admins and sellers.
          </p>
        </div>
        <p className="relative text-xs text-slate-500">Secure JWT session · Admin & Seller roles</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-surface-muted px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary-500">
                <Boxes className="size-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900">{appConfig.appName}</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
            <Input
              id="email"
              type="email"
              label="Email"
              icon={Mail}
              placeholder="admin@inventory.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="password"
              type="password"
              label="Password"
              icon={Lock}
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
            />

            {error && status === 'failed' ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" isLoading={status === 'loading'}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
