import { useState } from 'react';
import { User, Settings2, Pencil } from 'lucide-react';
import logo from '@/assets/images/logo.png';

export function ProfilePage() {
  const [isAiAlertsEnabled, setIsAiAlertsEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8" dir="rtl">
      {/* ── Profile Header Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative">
        
        <div className="flex flex-col items-start gap-1 flex-1 order-2 sm:order-1 w-full text-right sm:text-right">
          <h2 className="text-xl font-bold text-[#1E293B]">مستخدم</h2>
          <p className="text-sm text-slate-500 mb-3">user@example.com</p>
          <button className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
            تعديل الصورة
          </button>
        </div>

        <div className="relative order-1 sm:order-2 shrink-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-white flex items-center justify-center">
            <img src={logo} alt="Profile" className="w-full h-full object-contain p-2" />
          </div>
          <button className="absolute bottom-1 right-1 w-8 h-8 bg-[#1E293B] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-slate-800 transition-colors">
            <Pencil size={14} />
          </button>
        </div>
      </div>

      {/* ── Personal Data Form ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6 text-[#1E293B]">
          <User size={20} className="text-slate-400" />
          <h3 className="text-lg font-bold">البيانات الشخصية</h3>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">الاسم الكامل</label>
              <input 
                type="text" 
                defaultValue="مستخدم جديد"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">البريد الإلكتروني</label>
              <input 
                type="email" 
                defaultValue="user@example.com"
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">الدخل الشهري</label>
            <input 
              type="text" 
              defaultValue="15,000 EGP"
              className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-3 text-sm text-[#1E293B] focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] transition-all"
            />
          </div>

          <div className="pt-2">
            <button className="px-6 py-3 bg-[#1E293B] text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-md">
              تحديث البيانات
            </button>
          </div>
        </form>
      </div>

      {/* ── App Settings ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6 text-[#1E293B]">
          <Settings2 size={20} className="text-slate-400" />
          <h3 className="text-lg font-bold">إعدادات التطبيق</h3>
        </div>

        <div className="space-y-4">
          
          {/* AI Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#F8FAFC]/80 rounded-xl border-r-4 border-[#8B5CF6]">
            <div>
              <p className="font-bold text-[#1E293B] mb-1">تنبيهات الذكاء الاصطناعي للاشتراكات</p>
              <p className="text-xs text-slate-500">تحليل ذكي لمواعيد تجديد الخدمات والاشتراكات</p>
            </div>
            <button 
              onClick={() => setIsAiAlertsEnabled(!isAiAlertsEnabled)}
              className={`w-12 h-6 rounded-full relative transition-colors ${isAiAlertsEnabled ? 'bg-[#8B5CF6]' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isAiAlertsEnabled ? 'left-1' : 'left-7'}`} />
            </button>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
            <div>
              <p className="font-bold text-[#1E293B] mb-1">الوضع الليلي</p>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-[#1E293B]' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDarkMode ? 'left-1' : 'left-7'}`} />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
