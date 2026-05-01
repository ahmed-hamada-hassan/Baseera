/**
 * @file pages/LoginPage.tsx
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin, useRegister } from '@/features/auth/hooks/useAuth';

import BackgroundImage from "@/assets/images/Background Image for Illustration.png"

const LoginSchema = z.object({
  email:    z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل'),
});
type LoginForm = z.infer<typeof LoginSchema>;

const RegisterSchema = z.object({
  firstName:     z.string().min(2, 'الاسم الأول مطلوب'),
  lastName:      z.string().min(2, 'اسم العائلة مطلوب'),
  email:         z.string().email('البريد الإلكتروني غير صالح'),
  password:      z.string().min(6, 'كلمة المرور يجب أن تكون ٦ أحرف على الأقل'),
  monthlyIncome: z.coerce.number().min(0, 'يجب أن يكون الدخل الشهري رقماً موجباً'),
});
type RegisterForm = z.infer<typeof RegisterSchema>;

export function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
  });

  const registerForm = useForm<RegisterForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(RegisterSchema) as any,
  });

  const onLoginSubmit = (data: LoginForm) => loginMutation.mutate(data);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onRegisterSubmit = (data: RegisterForm) => registerMutation.mutate(data as any);

  return (
    <div
      className="min-h-screen flex bg-gradient-to-br from-[#f8f7ff] to-[#f1f5f9]"
      dir="rtl"
    >
      {/* Right Panel (Visually Right in RTL) — Branding Image */}
      <div
        className="hidden lg:flex w-1/2 relative overflow-hidden"
        style={{ backgroundImage: `url('${BackgroundImage}')`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}
      >
      </div>

      {/* Left Panel (Visually Left in RTL) — Form */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto max-h-screen">
        <div className="
          flex flex-col
          w-full max-w-[448px] h-fit
          px-[32px] pt-[32px] pb-[48px] gap-[32px]
          rounded-[12px] border border-white/40
          bg-white/90 backdrop-blur-[16px]
          shadow-[0_10px_40px_0_rgba(26,54,93,0.08)]
          my-auto
        ">
          
          {/* Tabs */}
          <div className="flex border border-[#2563EB] rounded-lg overflow-hidden mb-8 h-11">
            <button 
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 flex items-center justify-center text-sm transition-colors ${
                mode === 'register' 
                  ? 'font-bold text-[#1E293B] bg-white border-l border-[#2563EB]' 
                  : 'font-medium text-[#64748B] bg-[#EFF6FF] hover:bg-[#E2E8F0]'
              }`}
            >
              إنشاء حساب
            </button>
            <button 
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 flex items-center justify-center text-sm transition-colors ${
                mode === 'login' 
                  ? 'font-bold text-[#1E293B] bg-white border-r border-[#2563EB]' 
                  : 'font-medium text-[#64748B] bg-[#EFF6FF] hover:bg-[#E2E8F0]'
              }`}
            >
              تسجيل الدخول
            </button>
          </div>

          {/* Titles */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-2">مرحباً بك في بصيرة</h2>
            <p className="text-sm text-[#64748B]">
              {mode === 'login' ? 'أدخل بياناتك للوصول إلى لوحة التحكم الخاصة بك' : 'قم بإنشاء حساب جديد للبدء في إدارة أموالك'}
            </p>
          </div>

          {/* Form */}
          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} noValidate className="flex flex-col gap-5">
              
              {/* Email Input */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-[#1E293B] mb-1.5 text-right">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    id="login-email"
                    type="email"
                    required
                    placeholder="example.com@اسمك"
                    className="w-full h-12 px-4 pl-12 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-right dir-ltr transition-all"
                    {...loginForm.register('email')}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                </div>
                {loginForm.formState.errors.email && <p className="text-xs text-red-500 mt-1 text-right">{loginForm.formState.errors.email.message}</p>}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Link to="/forgot-password" className="text-xs text-[#8B5CF6] hover:underline">نسيت كلمة المرور؟</Link>
                  <label htmlFor="login-password" className="text-sm font-medium text-[#1E293B]">
                    كلمة المرور
                  </label>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full h-12 px-4 pl-12 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-right transition-all tracking-widest"
                    {...loginForm.register('password')}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><line x1="3" x2="21" y1="3" y2="21"/></svg>
                  </div>
                </div>
                {loginForm.formState.errors.password && <p className="text-xs text-red-500 mt-1 text-right">{loginForm.formState.errors.password.message}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-12 mt-2 rounded-lg bg-[#1E293B] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#0F172A] transition-colors shadow-lg disabled:opacity-70"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                <span className="text-lg">دخول</span>
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} noValidate className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                {/* First Name Input */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-[#1E293B] mb-1.5 text-right">الاسم الأول</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    placeholder="الاسم الاول"
                    className="w-full h-12 px-4 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-right transition-all"
                    {...registerForm.register('firstName')}
                  />
                  {registerForm.formState.errors.firstName && <p className="text-xs text-red-500 mt-1 text-right">{registerForm.formState.errors.firstName.message}</p>}
                </div>
                {/* Last Name Input */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-[#1E293B] mb-1.5 text-right">اسم العائلة</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    placeholder="اسم العائلة"
                    className="w-full h-12 px-4 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-right transition-all"
                    {...registerForm.register('lastName')}
                  />
                  {registerForm.formState.errors.lastName && <p className="text-xs text-red-500 mt-1 text-right">{registerForm.formState.errors.lastName.message}</p>}
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="register-email" className="block text-sm font-medium text-[#1E293B] mb-1.5 text-right">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    id="register-email"
                    type="email"
                    required
                    placeholder="example.com@اسمك"
                    className="w-full h-12 px-4 pl-12 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-right dir-ltr transition-all"
                    {...registerForm.register('email')}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                </div>
                {registerForm.formState.errors.email && <p className="text-xs text-red-500 mt-1 text-right">{registerForm.formState.errors.email.message}</p>}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-[#1E293B] mb-1.5 text-right">كلمة المرور</label>
                <div className="relative">
                  <input
                    id="register-password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full h-12 px-4 pl-12 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-right transition-all tracking-widest"
                    {...registerForm.register('password')}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                </div>
                {registerForm.formState.errors.password && <p className="text-xs text-red-500 mt-1 text-right">{registerForm.formState.errors.password.message}</p>}
              </div>

              {/* Bank or Wallet Input */}
              <div>
                <label htmlFor="monthlyIncome" className="block text-sm font-medium text-[#1E293B] mb-1.5 text-right">رقم الحساب البنكي أو المحفظة</label>
                <div className="relative flex gap-2" dir="rtl">
                  <select 
                    className="w-1/3 h-12 px-2 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none transition-all text-sm"
                  >
                    <option value="bank">حساب بنكي</option>
                    <option value="wallet">محفظة إلكترونية</option>
                  </select>
                  <input
                    id="monthlyIncome"
                    type="number"
                    required
                    placeholder="أدخل الرقم..."
                    className="w-2/3 h-12 px-4 rounded-lg border border-[#CBD5E1] bg-white text-[#1E293B] placeholder-[#94A3B8] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-right transition-all tracking-widest font-mono"
                    {...registerForm.register('monthlyIncome', { valueAsNumber: true })}
                  />
                </div>
                {registerForm.formState.errors.monthlyIncome && <p className="text-xs text-red-500 mt-1 text-right">{registerForm.formState.errors.monthlyIncome.message}</p>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full h-12 mt-2 rounded-lg bg-[#1E293B] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#0F172A] transition-colors shadow-lg disabled:opacity-70"
              >
                <span className="text-lg">إنشاء حساب</span>
              </button>
            </form>
          )}

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-8 text-xs text-[#64748B]">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            <span>مدعوم بتحليل الذكاء الاصطناعي</span>
          </div>

        </div>
      </div>
    </div>
  );
}
