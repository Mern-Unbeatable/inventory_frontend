import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Boxes,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Shield,
  Users,
} from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

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

  if (!isBootstrapped) return <FullPageLoader label='Checking session…' />;
  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = async (values) => {
    const result = await login(values);
    if (result.success) navigate(from, { replace: true });
  };

  return (
    <div className='flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50'>
      {/* Left Panel - Branding */}
      <div className='relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12'>
        {/* Animated Gradient Background */}
        <div className='absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-blue-600'>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className='absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary-400/20 blur-3xl' />
          <div className='absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl' />
        </div>

        {/* Logo */}
        <div className='relative z-10 flex items-center gap-3'>
          <div className='flex size-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm ring-1 ring-white/20'>
            <Boxes className='size-6 text-white' />
          </div>
          <span className='text-xl font-semibold text-white'>
            {appConfig.appName}
          </span>
        </div>

        {/* Main Content */}
        <div className='relative z-10 max-w-lg'>
          <div className='mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur-sm ring-1 ring-white/20'>
            <Sparkles className='size-4' />
            <span>Next-gen inventory management</span>
          </div>

          <h1 className='text-5xl font-bold tracking-tight text-white leading-tight'>
            Real-time stock across{' '}
            <span className=' text-primary-200 font-bold'>every branch</span>
          </h1>

          <p className='mt-6 text-base leading-relaxed text-white/70'>
            Replace WhatsApp photo updates with live inventory across countries
            and branches, with role-based access for admins and sellers.
          </p>

          {/* Feature Tags */}
          <div className='mt-8 flex flex-wrap gap-3'>
            <div className='flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm'>
              <Shield className='size-4' />
              Secure JWT session
            </div>
            <div className='flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm'>
              <Users className='size-4' />
              Admin & Seller roles
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className='relative z-10 text-sm text-white/40'>
          © 2026 {appConfig.appName}. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className='flex flex-1 items-center justify-center px-6 py-12 lg:px-8'>
        <div className='w-full max-w-md'>
          {/* Mobile Logo */}
          <div className='mb-8 lg:hidden'>
            <div className='flex items-center justify-center gap-2'>
              <div className='flex size-10 items-center justify-center rounded-xl bg-primary-600'>
                <Boxes className='size-5 text-white' />
              </div>
              <span className='text-lg font-semibold text-slate-900'>
                {appConfig.appName}
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className='rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-200/50 lg:p-10'>
            {/* Header */}
            <div className='mb-8'>
              <h2 className='text-2xl font-bold text-slate-900'>
                Welcome back
              </h2>
              <p className='mt-1.5 text-sm text-slate-500'>
                Sign in to your account to continue
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className='space-y-5'
              noValidate
            >
              <Input
                id='email'
                type='email'
                label='Email address'
                icon={Mail}
                placeholder='admin@inventory.com'
                autoComplete='email'
                error={errors.email?.message}
                className='transition-all duration-200 focus:ring-2 focus:ring-primary-500/20'
                {...register('email')}
              />

              <div className='space-y-1.5'>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    label='Password'
                    icon={Lock}
                    placeholder='Enter your password'
                    autoComplete='current-password'
                    error={errors.password?.message}
                    className='transition-all duration-200 focus:ring-2 focus:ring-primary-500/20 pr-12'
                    {...register('password')}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-[38px] text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors'
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && status === 'failed' && (
                <div
                  className='flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200/50'
                  role='alert'
                >
                  <div className='size-2 rounded-full bg-red-600 animate-pulse' />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type='submit'
                className='w-full group relative overflow-hidden bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 transition-all duration-200'
                isLoading={status === 'loading'}
              >
                <span className='flex items-center justify-center gap-2'>
                  Sign in
                  {!status === 'loading' && (
                    <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
                  )}
                </span>
              </Button>
            </form>
          </div>

          {/* Footer Links */}
          <div className='mt-6 text-center text-sm text-slate-500'>
            <span>Need help? </span>
            <a
              href='#'
              className='font-medium text-primary-600 hover:text-primary-700 transition-colors'
            >
              Contact support
            </a>
            <span className='mx-2'>·</span>
            <a
              href='#'
              className='font-medium text-primary-600 hover:text-primary-700 transition-colors'
            >
              Privacy policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
