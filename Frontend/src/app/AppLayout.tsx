/**
 * @file app/AppLayout.tsx
 * @description الـ Layout الرئيسي — Sidebar + Main Content
 */

import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Sparkles,
  Bell,
  Settings,
  Activity,
  LogOut,
  Wallet,
  Search,
} from 'lucide-react';
import { Notification } from '@/shared/ui/Notification/Notification';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary/ErrorBoundary';
import { useAuthStore } from '@/shared/store/auth.store';
import { tokenService } from '@/shared/lib/axios';
import { useUIStore } from '@/shared/store/ui.store';
import { ChatbotDrawer } from '@/features/chatbot/components/ChatbotDrawer';
import logo from '@/assets/images/logo.png';


const navItems = [
  { to: '/',              label: 'لوحة القيادة',  icon: LayoutDashboard, end: true },
  { to: '/transactions',  label: 'المعاملات',     icon: CreditCard },
  { to: '/subscriptions', label: 'الاشتراكات',    icon: Activity },
  { to: '/accounts',      label: 'الحسابات',      icon: Wallet },
] as const;

export function AppLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const openChatbot = useUIStore((s) => s.openChatbot);

  const handleLogout = () => {
    logout();
    tokenService.remove();
    navigate('/login');
  };

  return (
    <>
    <div className="flex h-screen h-[100dvh] bg-[#F4F7FF] overflow-hidden" dir="rtl">
      {/* ── Sidebar (Desktop/Tablet) ── */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col bg-white border-l border-slate-200 z-10">
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-30 h-30 flex items-center justify-center bg-white overflow-hidden shrink-0">
              <img src={logo} alt="بصيرة" className="object-contain w-30 h-30" />
            </div>
            <div>
              <p className="font-bold text-xl text-[#1E293B] leading-none mb-1">بصيرة</p>
              <p className="text-[11px] text-slate-500 font-medium">الذكاء المالي</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 flex flex-col" aria-label="القائمة الرئيسية">
          {navItems.map(({ to, label, icon: Icon, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              {...rest}
              className={({ isActive }) => [
                'flex items-center gap-3 px-6 py-3',
                'text-sm font-medium transition-colors border-r-4',
                isActive
                  ? 'text-[#1E293B] bg-[#F8FAFC] border-[#1E293B]'
                  : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-[#1E293B]',
              ].join(' ')}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? 'text-[#1E293B]' : 'text-slate-400'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-6 flex flex-col gap-4">
          <button
            onClick={openChatbot}
            className="w-full flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Sparkles size={16} />
            تحليل الذكاء الاصطناعي
          </button>
          
          <div className="flex flex-col mt-2">
            <button
              onClick={() => navigate('/profile')}
              aria-label="الإعدادات"
              className="flex items-center gap-3 px-2 py-2.5 text-slate-500 hover:text-[#1E293B] text-sm transition-colors"
            >
              <Settings size={18} />
              <span>الإعدادات</span>
            </button>
            <button
              onClick={handleLogout}
              aria-label="تسجيل الخروج"
              className="flex items-center gap-3 px-2 py-2.5 text-slate-500 hover:text-red-600 text-sm transition-colors"
            >
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Column ── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ── Top Header ── */}
        <header className="h-[72px] bg-white flex items-center justify-between px-4 md:px-8 border-b border-slate-200 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-2">
              <div className="w-9 h-9 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden shrink-0">
                <img src={logo} alt="بصيرة" className="object-contain w-7 h-7" />
              </div>
              <span className="font-bold text-base text-[#1E293B]">بصيرة</span>
            </div>
            <div className="text-sm md:text-xs text-slate-400 font-medium hidden sm:block">لوحة التحكم</div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
            {/* Search */}
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="بحث..."
                className="w-64 h-10 px-4 pl-10 bg-[#F8FAFC] border border-slate-200 rounded-full text-sm outline-none focus:border-[#1E293B] transition-colors"
              />
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* AI Analysis Button */}
            <button
              onClick={openChatbot}
              className="h-10 px-4 bg-[#1E293B] text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              تحليل جديد
            </button>

            {/* Bell */}
            <button className="text-slate-400 hover:text-[#1E293B] transition-colors relative">
              <Bell size={20} />
            </button>

            {/* Logout (Mobile Only) */}
            <button 
              onClick={handleLogout}
              className="md:hidden text-slate-400 hover:text-red-500 transition-colors relative ml-1"
              aria-label="تسجيل الخروج"
              title="تسجيل الخروج"
            >
              <LogOut size={20} />
            </button>

            {/* Profile */}
            <button 
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
              title="الملف الشخصي"
            >
              <div className="w-5 h-5 rounded-full border border-slate-400 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </button>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-auto p-4 pb-24 md:p-8 relative">
          <Notification />
          <div className="animate-fade-in max-w-5xl mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
      
      {/* ── Bottom Navigation (Mobile Only) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around px-2 py-2 pb-safe z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink
            key={to}
            to={to}
            {...rest}
            className={({ isActive }) => `
              flex flex-col items-center gap-1 p-2 min-w-[64px] transition-colors
              ${isActive ? 'text-[#8B5CF6]' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            {({ isActive }) => (
              <>
                <Icon size={22} className={isActive ? 'text-[#8B5CF6]' : ''} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
        {/* Chatbot trigger in mobile */}
        <button 
          onClick={openChatbot}
          className="flex flex-col items-center gap-1 p-2 min-w-[64px] text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Sparkles size={22} />
          <span className="text-[10px] font-medium">بصيرة</span>
        </button>
      </nav>
    </div>

    {/* ── AI Chatbot Drawer ── */}
    <ChatbotDrawer />
    </>
  );
}
