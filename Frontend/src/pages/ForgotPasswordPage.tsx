import { useState } from 'react';
import { Link } from 'react-router-dom';
import BackgroundImage from "@/assets/images/Background Image for Illustration.png"
import { ArrowRight } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen flex bg-gradient-to-br from-[#f8f7ff] to-[#f1f5f9]"
      dir="rtl"
    >
      {/* Right Panel (Visually Right in RTL) — Form */}
      <div className="relative z-10 flex-1 flex flex-col p-6 lg:p-12 overflow-y-auto max-h-screen">
        
        {/* Back Arrow */}
        <div className="flex justify-start w-full">
          <Link to="/login" className="p-2 text-[#1E293B] hover:bg-slate-100 rounded-full transition-colors">
            <ArrowRight size={24} />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="
            flex flex-col
            w-full max-w-[448px] h-fit
            px-[32px] pt-[40px] pb-[48px] gap-[32px]
            rounded-[16px] border border-white/40
            bg-white/90 backdrop-blur-[16px]
            shadow-[0_10px_40px_0_rgba(26,54,93,0.05)]
            text-center
          ">
            
            {/* Titles */}
            <div>
              <h2 className="text-[28px] font-bold text-[#1E293B] mb-3">نسيت كلمة المرور؟</h2>
              <p className="text-[15px] text-[#64748B] leading-relaxed px-4">
                لا تقلق، أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.
              </p>
            </div>

            {/* Form */}
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                
                {/* Email Input */}
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-[#1E293B] mb-2 text-right">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full h-12 px-4 pl-12 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-[#1E293B] placeholder-[#94A3B8] focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] outline-none text-right dir-ltr transition-all"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!email}
                  className="w-full h-12 mt-2 rounded-lg bg-[#0F172A] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#1E293B] transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="text-[15px]">إرسال رابط الاستعادة</span>
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
                </div>
                <h3 className="text-xl font-bold text-[#1E293B]">تم إرسال الرابط!</h3>
                <p className="text-sm text-[#64748B]">
                  يرجى التحقق من بريدك الإلكتروني {email} لتعيين كلمة مرور جديدة.
                </p>
              </div>
            )}

            {/* Back to Login Link */}
            <div className="mt-2 text-sm text-[#64748B]">
              تذكرت كلمة المرور؟ <Link to="/login" className="text-[#8B5CF6] hover:text-[#7C3AED] font-medium transition-colors">العودة لتسجيل الدخول</Link>
            </div>
            
            {/* Help Link */}
            <div className="mt-4 text-[11px] text-[#94A3B8]">
              هل تواجه مشكلة؟ <a href="#" className="text-[#8B5CF6] hover:underline">اتصل بالدعم الفني</a>
            </div>

          </div>
        </div>
      </div>

      {/* Left Panel (Visually Left in RTL) — Branding Image */}
      <div
        className="hidden lg:flex w-1/2 relative overflow-hidden"
        style={{ backgroundImage: `url('${BackgroundImage}')`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}
      >
      </div>
      
    </div>
  );
}
