/**
 * @file app/router.tsx
 */

import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout }        from './AppLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { Spinner } from '@/shared/ui/Spinner/Spinner';

// Lazy load pages for code splitting
const DashboardPage     = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const TransactionsPage  = lazy(() => import('@/pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const SubscriptionsPage = lazy(() => import('@/pages/SubscriptionsPage').then(m => ({ default: m.SubscriptionsPage })));
const AccountsPage      = lazy(() => import('@/pages/AccountsPage').then(m => ({ default: m.AccountsPage })));
const AnalyticsPage     = lazy(() => import('@/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ChatbotPage       = lazy(() => import('@/pages/ChatbotPage').then(m => ({ default: m.ChatbotPage })));
const ProfilePage       = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const LoginPage         = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const ForgotPasswordPage= lazy(() => import('@/pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));

// Fallback loader for lazy pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <Spinner size="lg" />
  </div>
);

export const router = createBrowserRouter([
  { 
    path: '/login',    
    element: (
      <Suspense fallback={<PageLoader />}>
        <LoginPage />
      </Suspense>
    ) 
  },
  { 
    path: '/forgot-password',    
    element: (
      <Suspense fallback={<PageLoader />}>
        <ForgotPasswordPage />
      </Suspense>
    ) 
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <AppLayout />,
        children: [
          { index: true,               element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
          { path: 'transactions',      element: <Suspense fallback={<PageLoader />}><TransactionsPage /></Suspense> },
          { path: 'subscriptions',     element: <Suspense fallback={<PageLoader />}><SubscriptionsPage /></Suspense> },
          { path: 'accounts',          element: <Suspense fallback={<PageLoader />}><AccountsPage /></Suspense> },
          { path: 'analytics',         element: <Suspense fallback={<PageLoader />}><AnalyticsPage /></Suspense> },
          { path: 'chatbot',           element: <Suspense fallback={<PageLoader />}><ChatbotPage /></Suspense> },
          { path: 'profile',           element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> },
        ],
      },
    ],
  },
]);
