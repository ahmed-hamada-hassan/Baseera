import { RefreshCw, CheckCircle2, ShieldCheck, Clock, Sparkles, Link as LinkIcon } from 'lucide-react';
import { useAccounts } from '@/features/accounts/hooks/useAccounts';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// Format helper
const fmt = (n: number) => n.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const getProviderTheme = (providerName: string) => {
  const name = providerName.toLowerCase();
  if (name.includes('cib') || name.includes('تجاري')) {
    return { bg: 'bg-[#003B5C]', logo: 'CIB', bankName: 'البنك التجاري الدولي', isWallet: false };
  }
  if (name.includes('vodafone') || name.includes('فودافون')) {
    return { bg: 'bg-[#E60000]', logo: 'Vodafone Cash', bankName: 'فودافون مصر', isWallet: true };
  }
  return { bg: 'bg-slate-800', logo: providerName.substring(0, 3).toUpperCase(), bankName: providerName, isWallet: false };
};

export function AccountsPage() {
  const { data: accounts, isLoading, error, refetch, isFetching } = useAccounts();

  const handleGlobalSync = () => {
    refetch();
  };

  const totalBalance = accounts?.reduce((sum, a) => sum + a.balance, 0) ?? 0;
  
  const banksTotal = accounts?.filter(a => !getProviderTheme(a.providerName).isWallet).reduce((sum, a) => sum + a.balance, 0) ?? 0;
  const walletsTotal = accounts?.filter(a => getProviderTheme(a.providerName).isWallet).reduce((sum, a) => sum + a.balance, 0) ?? 0;

  const chartData = [
    { name: 'بنوك', value: banksTotal, color: '#003B5C' },
    { name: 'محافظ', value: walletsTotal, color: '#E60000' },
  ].filter(d => d.value > 0);

  if (chartData.length === 0) {
    chartData.push({ name: 'لا يوجد', value: 1, color: '#e2e8f0' });
  }

  return (
    <div className="flex flex-col gap-8 animate-fade-in max-w-6xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">الحسابات المرتبطة</h1>
          <p className="text-slate-500 mt-2 text-sm">إدارة ومراقبة جميع حساباتك البنكية والمحافظ الإلكترونية في مكان واحد بأمان تام.</p>
        </div>
        
        <button 
          onClick={handleGlobalSync}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-[#1E293B] hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
          تحديث الأرصدة
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Right Column: Sidebar widgets (Takes 1/3 space visually, but it's on the right in RTL, wait, right visually or logically? */}
        {/* In RTL, the first element in flex-row is on the RIGHT. The image shows the widgets on the LEFT visually, meaning it should be the SECOND element in the flex order, or we just put it first and let it flow right. Let's look at the image again: the widgets are on the LEFT side of the screen. In RTL, if they are on the LEFT, they must come SECOND in the DOM or use order classes. Let's put the Cards first (which will render on the right in RTL), and widgets second (which will render on the left in RTL). */}

        {/* Right Column (Cards): rendered first so it appears on the right in RTL */}
        <div className="flex-1 flex flex-col gap-6">
          {isLoading && (
            <>
              <Skeleton className="h-[220px] w-full rounded-3xl" />
              <Skeleton className="h-[220px] w-full rounded-3xl" />
            </>
          )}

          {error && (
            <div className="bg-red-50 text-red-500 p-6 rounded-2xl border border-red-100 text-center">
              تعذر تحميل الحسابات. يرجى المحاولة لاحقاً.
            </div>
          )}

          {!isLoading && !error && accounts?.map(account => {
            const theme = getProviderTheme(account.providerName);
            const mask = account.id.slice(-4).toUpperCase();
            
            return (
              <div 
                key={account.id} 
                className={`${theme.bg} rounded-3xl p-8 text-white relative overflow-hidden shadow-lg h-[220px] flex flex-col justify-between`}
              >
                {theme.isWallet && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                )}

                <div className="relative z-10 flex items-start justify-between">
                  <div className="font-bold text-2xl tracking-wider">{theme.logo}</div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded-full text-xs backdrop-blur-sm border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    متصل وآمن
                  </div>
                </div>

                <div className="relative z-10 flex items-end justify-between mt-auto">
                  <div>
                    <p className="text-white/80 text-sm mb-1.5">
                      {theme.isWallet ? 'رصيد المحفظة' : 'الرصيد المتاح'}
                    </p>
                    <p className="text-[32px] font-bold flex items-baseline gap-2 leading-none">
                      {fmt(account.balance)}
                      <span className="text-lg font-normal text-white/80">ج.م</span>
                    </p>
                  </div>

                  <div className="text-left" dir="ltr">
                    <p className="text-white/80 text-sm mb-1 text-right" dir="rtl">
                      {theme.isWallet ? 'رقم الهاتف المربوط' : 'رقم الحساب'}
                    </p>
                    <p className="text-xl tracking-widest font-mono font-medium">
                      {theme.isWallet ? `010 •••• ${mask}` : `•••• ${mask}`}
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-8 right-8 text-xs text-white/60 pointer-events-none">
                  <p className="mb-0.5">{theme.bankName}</p>
                </div>
              </div>
            );
          })}

          {!isLoading && !error && accounts?.length === 0 && (
             <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center text-slate-500">
               لا توجد حسابات مرتبطة حالياً.
             </div>
          )}

          {/* Add New Account Card */}
          <button className="w-full border-[1.5px] border-dashed border-slate-300 rounded-3xl py-10 flex flex-col items-center justify-center gap-4 text-slate-500 hover:text-[#8B5CF6] hover:border-[#8B5CF6] hover:bg-purple-50/50 transition-all group">
            <div className="w-14 h-14 rounded-full bg-slate-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
              <LinkIcon size={24} className="text-slate-600 group-hover:text-[#8B5CF6]" />
            </div>
            <div className="text-center">
              <p className="font-bold text-[#1E293B] group-hover:text-[#8B5CF6] transition-colors text-lg mb-2">+ مزامنة حساب بنكي جديد</p>
              <p className="text-sm max-w-sm mx-auto leading-relaxed">قم بربط حساباتك البنكية بأمان تام عبر بروتوكولات التشفير المعتمدة دولياً.</p>
            </div>
          </button>
        </div>

        {/* Left Column (Widgets): rendered second so it appears on the left in RTL */}
        <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-6">
          
          {/* رؤية بصيرة */}
          <div className="bg-white border border-[#E9D5FF] rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-[#8B5CF6]" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-[#8B5CF6]">
                <Sparkles size={18} />
              </div>
              <h3 className="font-bold text-[#1E293B] text-lg">رؤية بصيرة</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-5 font-medium">
              بناءً على تحليلاتنا، لاحظنا تدفقات نقدية مستقرة في حساب CIB. قد يكون هذا الوقت مناسباً لاستكشاف خيارات استثمارية منخفضة المخاطر لتحقيق عائد أفضل على الرصيد الفائض.
            </p>
            <button className="text-xs text-[#8B5CF6] font-bold hover:underline flex items-center gap-1">
              عرض التفاصيل <span dir="ltr">←</span>
            </button>
          </div>

          {/* حالة الأمان */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                <ShieldCheck size={20} className="text-emerald-500" />
              </div>
              <h3 className="font-bold text-[#1E293B] text-lg">حالة الأمان</h3>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-4 py-3 border border-slate-100 rounded-xl bg-slate-50 text-sm font-medium text-slate-700">
                <CheckCircle2 size={18} className="text-emerald-500" />
                التشفير الشامل فعال
              </div>
              <div className="flex items-center gap-3 px-4 py-3 border border-slate-100 rounded-xl bg-slate-50 text-sm font-medium text-slate-700">
                <CheckCircle2 size={18} className="text-emerald-500" />
                المصادقة الثنائية نشطة
              </div>
              <div className="flex items-center gap-3 px-4 py-3 border border-slate-100 rounded-xl bg-slate-50 text-sm font-medium text-slate-500">
                <Clock size={18} className="text-slate-400" />
                آخر مزامنة: منذ 15 دقيقة
              </div>
            </div>
          </div>

          {/* إجمالي الأصول */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                <span className="text-[11px] font-bold text-slate-500 mb-1">إجمالي الأصول</span>
                <span className="text-2xl font-black text-[#1E293B] tracking-tight">
                  {totalBalance >= 1000 ? `${(totalBalance / 1000).toFixed(0)}K` : totalBalance}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#003B5C]" />
                بنوك
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1E293B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E60000]" />
                محافظ
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
