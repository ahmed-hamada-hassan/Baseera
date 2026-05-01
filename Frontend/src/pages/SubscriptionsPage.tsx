/**
 * @file pages/SubscriptionsPage.tsx
 */

import { useState, useMemo } from 'react';
import { useSubscriptions, useCancelSubscription } from '@/features/subscriptions/hooks/useSubscriptions';
import { Skeleton } from '@/shared/ui/Skeleton';
import { 
  Building2, MonitorPlay, Dumbbell, PenTool, Music, XCircle, Clock, AlertTriangle 
} from 'lucide-react';

/** احسب عدد الأيام منذ تاريخ معين */
const daysSince = (dateStr: string | null | undefined): number | null => {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/** فرمت التاريخ بالعربية */
const fmtDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'غير محدد';
  return new Date(dateStr).toLocaleDateString('ar-SA', { day: '2-digit', month: 'long', year: 'numeric' });
};

// Helpers to match services to icons and colors
const getServiceConfig = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('netflix')) return { icon: <span className="font-bold text-red-600 text-xl">N</span>, bg: 'bg-red-50' };
  if (lowerName.includes('spotify')) return { icon: <Music size={20} className="text-green-600" />, bg: 'bg-green-50' };
  if (lowerName.includes('gym') || lowerName.includes('fitness')) return { icon: <Dumbbell size={20} className="text-red-600" />, bg: 'bg-red-50' };
  if (lowerName.includes('adobe')) return { icon: <PenTool size={20} className="text-red-600" />, bg: 'bg-red-50' };
  return { icon: <MonitorPlay size={20} className="text-[#8B5CF6]" />, bg: 'bg-[#F3E8FF]' }; // default purple
};

export function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'risk'>('all');
  const { data: subscriptions, isLoading, error } = useSubscriptions();
  const { mutate: cancelSub, isPending: isCancelling } = useCancelSubscription();

  const filteredSubs = useMemo(() => {
    if (!subscriptions) return [];
    if (activeTab === 'active') return subscriptions.filter(s => s.status === 'Active');
    if (activeTab === 'risk') return subscriptions.filter(s => s.status === 'AtRisk');
    return subscriptions;
  }, [subscriptions, activeTab]);

  const atRiskCount = subscriptions?.filter(s => s.status === 'AtRisk').length || 0;
  const activeCount = subscriptions?.filter(s => s.status === 'Active').length || 0;
  const totalCount = subscriptions?.length || 0;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-red-500">
        <AlertTriangle size={48} className="opacity-50" />
        <p>عذراً، حدث خطأ أثناء تحميل بيانات الاشتراكات.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in" dir="rtl">
      
      {/* ── Header & Tabs Row ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Tabs (Left in LTR, Right in RTL depending on layout. Screenshot has Tabs on Left, Title on Right) */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 order-2 md:order-1 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'all' ? 'bg-[#DBEAFE] text-[#1E3A8A]' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            الكل ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'active' ? 'bg-[#DBEAFE] text-[#1E3A8A]' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            نشط ({activeCount})
          </button>
          <button
            onClick={() => setActiveTab('risk')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'risk' ? 'bg-[#DBEAFE] text-[#1E3A8A]' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            خطر ({atRiskCount})
          </button>
        </div>

        {/* Header Titles (Right in RTL) */}
        <div className="text-right order-1 md:order-2">
          <h1 className="text-3xl font-bold text-[#1E293B]">إدارة الاشتراكات</h1>
          <p className="text-slate-500 mt-1 text-sm">تحليل ذكي لاشتراكاتك النشطة والمهملة.</p>
        </div>

      </div>

      {/* ── Nudge Card (Top Banner) ── */}
      {atRiskCount > 0 && (
        <div className="bg-[#F5F3FF] border border-[#DDD6FE] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#8B5CF6] text-white flex items-center justify-center flex-shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#1E293B] text-lg mb-1">تنبيه ذكي: اشتراك غير مستخدم</h3>
              <p className="text-[#475569] text-sm">
                {(() => {
                  const firstRisk = subscriptions?.find(s => s.status === 'AtRisk');
                  const days = firstRisk ? daysSince(firstRisk.lastActivityDate) : null;
                  return days !== null
                    ? `لاحظنا أن اشتراك "${firstRisk?.serviceName}" غير مستخدم منذ ${days} يوماً. يمكنك توفير ${firstRisk?.monthlyCost.toLocaleString('ar-SA')} ج.م شهرياً بإلغائه.`
                    : 'لديك اشتراكات غير مستخدمة. يمكنك توفير مبالغ شهرية بإلغائها.';
                })()}
              </p>
            </div>
          </div>

          <button 
            onClick={() => setActiveTab('risk')}
            className="whitespace-nowrap px-6 py-2.5 bg-[#8B5CF6] text-white font-medium rounded-xl hover:bg-[#7C3AED] transition-colors"
          >
            مراجعة الاشتراكات
          </button>
          
        </div>
      )}

      {/* ── Grid of Subscription Cards ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl h-64 p-5 flex flex-col justify-between">
              <Skeleton className="h-6 w-1/2" />
              <div className="flex items-center gap-3"><Skeleton className="w-12 h-12 rounded-full" /><Skeleton className="h-4 w-24" /></div>
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredSubs.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white border border-slate-200 rounded-2xl">
          لا توجد اشتراكات في هذا التصنيف.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-2">
          {filteredSubs.map((sub) => {
            const isRisk = sub.status === 'AtRisk';
            const config = getServiceConfig(sub.serviceName);

            return (
              <div 
                key={sub.id} 
                className={`bg-white rounded-2xl flex flex-col overflow-hidden transition-shadow hover:shadow-md ${
                  isRisk ? 'border-2 border-red-500 shadow-sm' : 'border border-slate-200'
                }`}
              >
                {/* Top Border Line */}
                <div className={`h-1.5 w-full ${isRisk ? 'bg-red-500' : 'bg-[#34D399]'}`} />
                
                <div className="p-5 flex flex-col flex-1">
                  
                  {/* Badge Row */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${config.bg}`}>
                        {config.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1E293B] text-lg">{sub.serviceName}</h3>
                        <p className="text-slate-500 text-xs">آخر دفعة: {fmtDate(sub.lastPaymentDate)}</p>
                      </div>
                    </div>
                    
                    {/* Badge */}
                    {isRisk ? (
                      <div className="flex items-center gap-1.5 bg-[#FEE2E2] text-red-600 px-2.5 py-1 rounded-full text-[10px] font-bold">
                        <Clock size={12} />
                        غير مستخدم منذ فترة
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 bg-[#D1FAE5] text-[#065F46] px-2.5 py-1 rounded-full text-[10px] font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        نشط ويتم استخدامه
                      </div>
                    )}
                  </div>

                  {/* Details Row */}
                  <div className="grid grid-cols-2 gap-4 mb-6 mt-auto bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500 mb-1 font-medium">آخر نشاط</p>
                      <p className="font-bold text-[#1E293B] text-sm">
                        {fmtDate(sub.lastActivityDate)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs mb-1 font-medium ${isRisk ? 'text-red-500' : 'text-slate-500'}`}>
                        {isRisk ? 'التكلفة الشهرية المحتسبة' : 'التكلفة الشهرية'}
                      </p>
                      <p className={`font-bold text-lg ${isRisk ? 'text-red-600' : 'text-[#1E293B]'}`}>
                        {sub.monthlyCost.toLocaleString('ar-SA')} ج.م
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  {isRisk ? (
                    <button 
                      onClick={() => cancelSub(sub.id)}
                      disabled={isCancelling}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#B91C1C] hover:bg-[#991B1B] text-white font-medium rounded-xl transition-colors disabled:opacity-70"
                    >
                      <XCircle size={18} />
                      إلغاء الاشتراك الآن
                    </button>
                  ) : (
                    <button 
                      className="w-full py-3 bg-white border border-slate-200 text-[#475569] hover:bg-slate-50 font-medium rounded-xl transition-colors"
                    >
                      إدارة الاشتراك
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
