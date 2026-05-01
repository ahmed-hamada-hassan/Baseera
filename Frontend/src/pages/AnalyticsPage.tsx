/**
 * @file pages/AnalyticsPage.tsx
 * @description التحليلات — مربوطة بـ spendByCategory من Dashboard API
 */

import { Card }   from '@/shared/ui/Card/Card';
import { Skeleton } from '@/shared/ui/Skeleton';
import { BarChart3, TrendingDown, Wallet, Activity } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';

const COLORS = [
  'var(--color-brand-400)',
  'var(--color-accent-emerald)',
  'var(--color-accent-rose)',
  'var(--color-accent-amber)',
  'var(--color-accent-cyan)',
  'var(--color-accent-violet)',
];

const CATEGORY_AR: Record<string, string> = {
  Entertainment: 'ترفيه',
  Food:          'طعام',
  Utilities:     'فواتير',
  Shopping:      'تسوق',
  Other:         'أخرى',
};

export function AnalyticsPage() {
  const { data: dashboard, isLoading, error } = useDashboard();

  const spendData = dashboard?.spendByCategory.map((item) => ({
    ...item,
    name: CATEGORY_AR[item.category] ?? item.category,
  })) ?? [];

  const budgetData = dashboard ? [
    { name: 'المصروفات', amount: dashboard.totalSpendThisMonth },
    { name: 'الاشتراكات', amount: dashboard.totalSubscriptionCost },
    { name: 'المتبقي',    amount: Math.max(dashboard.remainingBudget, 0) },
  ] : [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400">
        <p>تعذر تحميل بيانات التحليلات. تأكد من تشغيل الخادم.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 size={28} style={{ color: 'var(--color-accent-cyan)' }} />
          التحليلات المالية
        </h1>
        <p className="text-slate-400 mt-1 text-sm">نظرة عميقة على أنماط إنفاقك</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} hoverable={false}>
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </Card>
          ))
        ) : (
          [
            {
              label: 'إجمالي المصروفات',
              value: `${dashboard?.totalSpendThisMonth.toLocaleString('ar-SA')} ر.س`,
              icon: TrendingDown,
              color: 'var(--color-accent-rose)',
            },
            {
              label: 'تكلفة الاشتراكات',
              value: `${dashboard?.totalSubscriptionCost.toLocaleString('ar-SA')} ر.س`,
              icon: Activity,
              color: 'var(--color-accent-violet)',
            },
            {
              label: 'الميزانية المتبقية',
              value: `${dashboard?.remainingBudget.toLocaleString('ar-SA')} ر.س`,
              icon: Wallet,
              color: 'var(--color-accent-emerald)',
            },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${kpi.color}20` }}>
                    <Icon size={16} style={{ color: kpi.color }} />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
                <p className="text-xl font-bold text-white">{kpi.value}</p>
              </Card>
            );
          })
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart — Spend by Category */}
        <Card hoverable={false}>
          <h2 className="font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 inline-block" />
            توزيع المصروفات حسب الفئة
          </h2>
          {isLoading ? (
            <div className="flex justify-center"><Skeleton className="w-48 h-48 rounded-full" /></div>
          ) : spendData.length === 0 ? (
            <p className="text-center text-slate-400 py-8">لا توجد بيانات كافية.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={spendData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="amount"
                  nameKey="name"
                  paddingAngle={3}
                >
                  {spendData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length] as string} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#13132a', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', color: '#e2e8f0' }}
                  formatter={(v) => [`${Number(v ?? 0).toLocaleString('ar-SA')} ج.م`]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}

          {/* Legend */}
          {!isLoading && spendData.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {spendData.map((item, idx) => (
                <div key={item.category} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: COLORS[idx % COLORS.length] }} />
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Bar Chart — Budget breakdown */}
        <Card hoverable={false}>
          <h2 className="font-semibold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-emerald inline-block" />
            توزيع الميزانية الشهرية
          </h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-lg" />)}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={budgetData} layout="vertical" margin={{ right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} width={70} />
                <Tooltip
                  contentStyle={{ background: '#13132a', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px', color: '#e2e8f0' }}
                  formatter={(v) => [`${Number(v ?? 0).toLocaleString('ar-SA')} ج.م`]}
                />
                <Bar dataKey="amount" radius={[0, 8, 8, 0]}>
                  {budgetData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length] as string} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
