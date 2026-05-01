import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, ShieldAlert, Building2, PieChart as PieChartIcon, ArrowUpRight, AlertTriangle, TrendingDown,
} from 'lucide-react';
import { NudgeCard }         from '@/shared/ui/NudgeCard/NudgeCard';
import { NudgeCardSkeleton } from '@/shared/ui/NudgeCard/NudgeCardSkeleton';
import { Skeleton }          from '@/shared/ui/Skeleton';
import { TransactionsList }  from '@/features/transactions/components/TransactionsList';
import { useDashboard }      from '@/features/dashboard/hooks/useDashboard';
import { useTransactions }   from '@/features/transactions/hooks/useTransactions';
import { useCancelSubscription } from '@/features/subscriptions/hooks/useSubscriptions';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';

const CHART_COLORS = [
  '#8B5CF6', // Purple
  '#1E3A8A', // Dark Blue
  '#BAE6FD', // Light Blue
  '#F472B6', // Pink
  '#34D399', // Teal
];

const CATEGORY_AR: Record<string, string> = {
  Entertainment: 'ترفيه',
  Food:          'طعام',
  Utilities:     'فواتير',
  Shopping:      'تسوق',
  Other:         'أخرى',
};

/** Format a number as Arabic-locale currency string */
const fmt = (n: number) =>
  n.toLocaleString('ar-EG', { maximumFractionDigits: 0 });

export function DashboardPage() {
  const navigate = useNavigate();
  const { data: dashboard, isLoading, error } = useDashboard();
  const { data: transactions } = useTransactions(1, 500); // Fetch a large batch to calculate chart
  const { mutate: cancelSub } = useCancelSubscription();
  const [dismissedNudges, setDismissedNudges] = useState<Set<string>>(new Set());

  const handleDismissNudge = (id: string) =>
    setDismissedNudges((prev) => new Set(prev).add(id));

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
        <ShieldAlert size={48} className="opacity-30" />
        <p>تعذر تحميل لوحة التحكم. تأكد من تشغيل الخادم.</p>
      </div>
    );
  }

  // ── Calculate Real Data from Transactions (Frontend computation) ────
  let calculatedTotalSpend = 0;
  const spendDataMap = new Map<string, number>();

  if (transactions && transactions.length > 0) {
    transactions.forEach(tx => {
      // You can filter by tx.status === 'Confirmed' if you only want to chart confirmed expenses
      calculatedTotalSpend += tx.amount;
      const cat = tx.category || 'Other';
      spendDataMap.set(cat, (spendDataMap.get(cat) || 0) + tx.amount);
    });
  }

  // ── Real data from API with Local Fallbacks ────────────────────────
  const monthlyIncome      = dashboard?.monthlyIncome      ?? 0;
  // Use frontend computed if available, else backend
  const totalSpend         = calculatedTotalSpend > 0 ? calculatedTotalSpend : (dashboard?.totalSpendThisMonth ?? 0);
  const remainingBudget    = monthlyIncome > 0 ? (monthlyIncome - totalSpend) : (dashboard?.remainingBudget ?? 0);

  // Progress bar: remaining / income (capped 0-100)
  const budgetProgress = monthlyIncome > 0
    ? Math.min(100, Math.max(0, Math.round((remainingBudget / monthlyIncome) * 100)))
    : 0;

  // Spending ratio for alert threshold
  const spendRatio = monthlyIncome > 0 ? totalSpend / monthlyIncome : 0;
  const overBudget = spendRatio > 0.8;

  let spendData = Array.from(spendDataMap.entries()).map(([category, amount]) => ({
    name: CATEGORY_AR[category] ?? category,
    value: amount,
    category,
  })).sort((a, b) => b.value - a.value); // Sort highest spend first

  // Fallback to backend if no transactions are fetched yet
  if (spendData.length === 0) {
    spendData = (dashboard?.spendByCategory ?? []).map((item) => ({
      name:     CATEGORY_AR[item.category] ?? item.category,
      value:    item.amount,
      category: item.category,
    }));
  }

  // ── KPI card definitions (live data) ──────────────────────────────
  const kpiCards = [
    {
      id:          'income',
      label:       'الرصيد الإجمالي',
      value:       fmt(monthlyIncome),
      suffix:      'ج.م',
      icon:        Building2,
      trendLabel:  'الدخل الشهري',
      trendColor:  'text-emerald-500',
      trendIcon:   ArrowUpRight,
    },
    {
      id:           'remaining',
      label:        'الميزانية المتبقية',
      value:        fmt(remainingBudget),
      suffix:       'ج.م',
      icon:         PieChartIcon,
      progressBar:  true,
      progressValue: budgetProgress,
    },
    {
      id:         'spend',
      label:      'المنصرف هذا الشهر',
      value:      fmt(totalSpend),
      suffix:     'ج.م',
      icon:       CreditCard,
      alert:      overBudget ? 'تجاوزت 80% من ميزانيتك' : undefined,
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in" dir="rtl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">مرحباً بعودتك</h1>
          <p className="text-slate-500 mt-1 text-sm">نظرة عامة على أدائك المالي هذا الشهر.</p>
        </div>
      </div>

      {/* ── Top Row (KPIs + Nudge) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* KPI Cards */}
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-slate-500 font-medium">{kpi.label}</p>
                <div className="text-[#8B5CF6]">
                  <Icon size={20} />
                </div>
              </div>

              {isLoading ? (
                /* Skeleton while loading */
                <div className="flex flex-col gap-2 mt-1">
                  <Skeleton className="h-8 w-3/4 rounded-lg" />
                  <Skeleton className="h-3 w-1/2 rounded-full" />
                </div>
              ) : (
                <div>
                  <p className="text-[28px] font-bold text-[#1E293B] flex items-baseline gap-1">
                    {kpi.value}
                    <span className="text-lg font-bold">{kpi.suffix}</span>
                  </p>

                  {kpi.trendLabel && (
                    <p className={`text-[10px] mt-2 flex items-center gap-1 ${kpi.trendColor}`}>
                      <ArrowUpRight size={12} />
                      {kpi.trendLabel}
                    </p>
                  )}

                  {kpi.progressBar && (
                    <div className="w-full h-1.5 bg-slate-100 rounded-full mt-4 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${kpi.progressValue}%`,
                          background: kpi.progressValue! < 20
                            ? '#EF4444'   // red when almost gone
                            : '#8B5CF6', // purple normal
                        }}
                      />
                    </div>
                  )}

                  {kpi.progressBar && (
                    <p className="text-[10px] mt-1.5 text-slate-400">
                      {kpi.progressValue}% متبقي
                    </p>
                  )}

                  {kpi.alert && (
                    <p className="text-[10px] mt-2 flex items-center gap-1 text-red-500">
                      <AlertTriangle size={12} />
                      {kpi.alert}
                    </p>
                  )}

                  {/* spend card: show spend ratio bar */}
                  {kpi.id === 'spend' && !kpi.alert && (
                    <p className="text-[10px] mt-2 flex items-center gap-1 text-slate-400">
                      <TrendingDown size={12} />
                      {Math.round(spendRatio * 100)}% من الميزانية
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Nudge Card (4th Column) — Smart Alert */}
        {isLoading ? (
          <NudgeCardSkeleton />
        ) : (
          dashboard?.atRiskSubscriptionsList
            .filter((sub) => !dismissedNudges.has(sub.id))
            .slice(0, 1)
            .map((sub) => (
              <NudgeCard
                key={sub.id}
                id={sub.id}
                isVisible={true}
                icon={<ShieldAlert size={20} />}
                title="تنبيه ذكي"
                description={`اشتراك ${sub.serviceName} غير مستخدم. هل تريد إلغاءه لتوفير ${fmt(sub.monthlyCost)} ج.م؟`}
                actionLabel="إلغاء الاشتراك"
                onAction={() => cancelSub(sub.id)}
                onDismiss={() => handleDismissNudge(sub.id)}
              />
            ))
        )}
      </div>

      {/* ── Bottom Row (2 Columns) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">

        {/* Right Column: Transactions List */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[400px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-[#1E293B]">أحدث المعاملات</h2>
            <button
              onClick={() => navigate('/transactions')}
              className="text-xs text-slate-500 font-medium hover:text-[#1E293B] transition-colors"
            >
              عرض الكل
            </button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            <TransactionsList />
          </div>
        </div>

        {/* Left Column: Donut Chart — Expense Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col h-[400px]">
          <h2 className="font-bold text-[#1E293B] mb-8">توزيع النفقات</h2>

          {isLoading ? (
            <div className="flex-1 flex justify-center items-center">
              <Skeleton className="w-48 h-48 rounded-full" />
            </div>
          ) : spendData.length === 0 ? (
            <p className="text-center text-slate-500 text-sm py-4 m-auto">لا توجد بيانات بعد</p>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center relative">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={spendData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {spendData.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length] as string} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#1e293b',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    formatter={(v) => [`${fmt(Number(v ?? 0))} ج.م`]}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Inner Label — shows live total */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-[30px]">
                <span className="text-[10px] text-slate-400 font-medium">الإجمالي</span>
                <span className="text-lg font-bold text-[#1E293B]">
                  {totalSpend >= 1000
                    ? `${(totalSpend / 1000).toFixed(1)}k`
                    : fmt(totalSpend)}
                </span>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-3 mt-auto">
                {spendData.map((item, idx) => (
                  <div
                    key={item.category}
                    className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
