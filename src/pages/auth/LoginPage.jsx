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
  Eye,
  EyeOff,
  CheckCircle,
  Building2,
  Globe,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/Button.jsx';
import { Input } from '@/components/forms/Input.jsx';
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
  const [isFocused, setIsFocused] = useState(false);

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
    <div className='flex min-h-screen overflow-hidden bg-white'>
      {/* Left Panel - Premium Branding */}
      <div className='flex flex-1 items-center justify-center px-4 sm:px-6 py-12 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-slate-50/50'>
        <div className='w-full max-w-md'>
          {/* Mobile Logo */}
          <div className='mb-8 lg:hidden'>
            <div className='flex flex-col items-center justify-center gap-3'>
              <div className='flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg'>
                <Boxes className='size-6 text-white' />
              </div>

              <span className='text-xl font-semibold text-slate-900 tracking-tight sm:text-2xl md:text-3xl'>
                {appConfig.appName}
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className='relative'>
            {/* Card Decoration */}
            <div className='absolute -top-6 -right-6 h-20 w-20 rounded-full bg-blue-500/10 blur-2xl' />
            <div className='absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-purple-500/10 blur-2xl' />

            <div className='relative rounded-3xl bg-white/80 p-6 sm:p-8 shadow-2xl shadow-slate-200/60 backdrop-blur-xl ring-1 ring-slate-200/50 lg:p-10'>
              {/* Header */}
              <div className='mb-8'>
                <h2 className='sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight'>
                  Welcome back
                </h2>
                <p className='mt-2 text-xs sm:text-sm md:text-base lg:text-lg text-slate-500'>
                  Sign in to your account to continue
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className='space-y-4 sm:space-y-6'
                noValidate
              >
                {/* Email Field */}
                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-slate-700'>
                    Email
                  </label>
                  <div className='relative'>
                    <div className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
                      <Mail className='size-4' />
                    </div>
                    <input
                      type='email'
                      placeholder='admin@inventory.com'
                      autoComplete='email'
                      className={`
                        w-full rounded-xl border-2 bg-slate-50/50 px-4 py-3 pl-10 text-slate-900
                        placeholder:text-slate-400
                        transition-all duration-200
                        ${
                          errors.email
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20'
                        }
                        focus:outline-none focus:bg-white
                      `}
                      {...register('email')}
                    />
                    {errors.email && (
                      <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                        <div className='size-2 rounded-full bg-red-500 animate-pulse' />
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className='text-sm text-red-500 mt-1'>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className='space-y-1.5'>
                  <div className='flex items-center justify-between'>
                    <label className='text-sm font-medium text-slate-700'>
                      Password
                    </label>
                  </div>
                  <div className='relative'>
                    <div className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
                      <Lock className='size-4' />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Enter your password'
                      autoComplete='current-password'
                      className={`
                        w-full rounded-xl border-2 bg-slate-50/50 px-4 py-3 pl-10 pr-12 text-slate-900
                        placeholder:text-slate-400
                        transition-all duration-200
                        ${
                          errors.password
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20'
                        }
                        focus:outline-none focus:bg-white
                      `}
                      {...register('password')}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'
                    >
                      {showPassword ? (
                        <EyeOff className='size-4' />
                      ) : (
                        <Eye className='size-4' />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className='text-sm text-red-500 mt-1'>
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Error Message */}
                {error && status === 'failed' && (
                  <div className='flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200/50'>
                    <div className='size-2 rounded-full bg-red-500 animate-pulse' />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type='submit'
                  className='w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-3.5 transition-all duration-300 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50'
                  isLoading={status === 'loading'}
                >
                  <span className='flex items-center justify-center gap-2'>
                    Sign in
                    {status !== 'loading' && (
                      <ArrowRight className='size-4 transition-transform duration-300 group-hover:translate-x-1' />
                    )}
                  </span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className='relative hidden w-1/2 lg:flex lg:flex-col'>
        {/* Premium Gradient Background */}
        <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
          {/* Animated Mesh Gradient */}
          <div className='absolute inset-0'>
            <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent' />
            <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent' />
            <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-400/5 blur-3xl animate-pulse' />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,255,255,0.03)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E')] opacity-50" />

          {/* Floating Orbs */}
          <div className='absolute top-20 right-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl animate-float' />
          <div className='absolute bottom-20 left-20 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl animate-float-delayed' />
        </div>

        {/* Content Container */}
        <div className='relative z-10 flex flex-1 flex-col justify-between p-12'>
          {/* Logo */}
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div className='absolute inset-0 rounded-2xl bg-white/20 blur-xl' />
              <div className='relative flex size-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl ring-1 ring-white/20'>
                <Boxes className='size-6 text-white' />
              </div>
            </div>
            <span className='text-xl font-semibold text-white tracking-tight'>
              {appConfig.appName}
            </span>
          </div>

          {/* Hero Content */}
          <div className='space-y-8'>
            <div className='space-y-2'>
              <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur-xl ring-1 ring-white/20'>
                <Zap className='size-4 text-yellow-400' />
                <span>Next-gen inventory management</span>
              </div>

              <h1 className='text-5xl font-bold text-white leading-tight tracking-tight'>
                Real-time stock across
                <span className='block mt-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent'>
                  every branch
                </span>
              </h1>
            </div>

            <p className='text-lg leading-relaxed text-white/60 max-w-md'>
              Replace WhatsApp photo updates with live inventory across
              countries and branches, with role-based access for admins and
              sellers.
            </p>

            {/* Feature Grid */}
            <div className='grid grid-cols-2 gap-3 max-w-md'>
              <div className='flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 backdrop-blur-xl ring-1 ring-white/10'>
                <Shield className='size-4 text-blue-400' />
                <span className='text-sm text-white/80'>Secure</span>
              </div>
              <div className='flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 backdrop-blur-xl ring-1 ring-white/10'>
                <Users className='size-4 text-cyan-400' />
                <span className='text-sm text-white/80'>Role-based</span>
              </div>
              <div className='flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 backdrop-blur-xl ring-1 ring-white/10'>
                <Globe className='size-4 text-purple-400' />
                <span className='text-sm text-white/80'>Multi-branch</span>
              </div>
              <div className='flex items-center gap-2 rounded-xl bg-white/5 px-4 py-3 backdrop-blur-xl ring-1 ring-white/10'>
                <Building2 className='size-4 text-indigo-400' />
                <span className='text-sm text-white/80'>Enterprise</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between text-sm text-white/30'>
            <span>© 2026 {appConfig.appName}</span>
            <div className='flex items-center gap-4'>
              <a href='#' className='hover:text-white/60 transition-colors'>
                Privacy
              </a>
              <a href='#' className='hover:text-white/60 transition-colors'>
                Terms
              </a>
              <a href='#' className='hover:text-white/60 transition-colors'>
                Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 10s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
