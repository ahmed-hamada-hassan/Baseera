import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

const pricingPlans = [
  {
    name: 'الباقة الأساسية',
    price: 'مجاناً',
    period: '',
    description: 'بداية مثالية لإدارة أموالك',
    features: [
      'تسجيل المعاملات يدوياً',
      'تحليل ميزانية مبسط',
      '٥ مسحات ضوئية للفواتير شهرياً',
    ],
    buttonText: 'خطتك الحالية',
    buttonVariant: 'outline',
    bgColor: 'bg-white',
    textColor: 'text-slate-900',
    borderColor: 'border-slate-200',
    iconColor: 'text-slate-700',
    popular: false,
  },
  {
    name: 'بصيرة الذكية (Pro)',
    price: '500',
    period: 'جنيه / شهرياً',
    description: 'تحليلات متقدمة وإدارة شاملة',
    features: [
      'مسح ضوئي لامحدود للفواتير (OCR)',
      'المستشار المالي الذكي (AI)',
      'ربط غير محدود للحسابات البنكية',
      'تنبيهات ذكية مبكرة للديون',
      'رادار الاشتراكات المتقدم',
      'تقارير مالية مخصصة',
    ],
    buttonText: 'الترقية الآن',
    buttonVariant: 'solid',
    buttonColor: 'bg-yellow-500 hover:bg-yellow-600 text-slate-900',
    bgColor: 'bg-slate-900',
    textColor: 'text-white',
    borderColor: 'border-slate-800',
    iconColor: 'text-yellow-500',
    popular: true,
    badge: 'الذكاء الاصطناعي مفعل',
  },
  {
    name: 'بصيرة للعائلة',
    price: '2000',
    period: 'جنيه / شهرياً',
    description: 'إدارة مالية ذكية للأسرة',
    features: [
      'حتى ٥ أفراد',
      'تقارير مشاركة ذكية',
      'تنبيهات ذكية للعائلة',
      'تخصيص ميزانية لكل فرد',
      'كل ميزات باقة Pro لكل فرد',
    ],
    buttonText: 'اشترك الآن',
    buttonVariant: 'solid',
    buttonColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-950',
    borderColor: 'border-purple-200',
    iconColor: 'text-purple-600',
    popular: false,
  },
  {
    name: 'بصيرة للأعمال',
    price: '1500',
    period: 'جنيه / شهرياً',
    description: 'حلول متكاملة للشركات الصغيرة',
    features: [
      'إدارة عدة ميزانيات',
      'تصدير بيانات محاسبية',
      'دعم فني مخصص ٢٤/٧',
      'تحليل تدفقات نقدية متقدم',
      'تعدد المستخدمين والصلاحيات',
      'كل ميزات باقة Pro',
    ],
    buttonText: 'تواصل معنا',
    buttonVariant: 'solid',
    buttonColor: 'bg-slate-800 hover:bg-slate-900 text-white',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-900',
    borderColor: 'border-slate-200',
    iconColor: 'text-slate-600',
    popular: false,
  },
];

export const PricingPage = () => {
  return (
    <div className="font-sans">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold text-slate-900 mb-4"
          >
            اختر الباقة المناسبة لك
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
          >
            حلول مرنة تناسب الأفراد، العائلات، والشركات
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={`relative flex flex-col rounded-3xl border p-8 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-xl ${plan.bgColor} ${plan.borderColor} ${plan.textColor}`}
            >
              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="flex items-center gap-1.5 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-4">{plan.name}</h3>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                </div>
                {plan.period && (
                  <div className="text-sm opacity-80 font-medium">{plan.period}</div>
                )}
                <p className="mt-4 text-sm opacity-90 leading-relaxed min-h-[40px]">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1">
                <ul className="space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 rounded-full p-0.5 ${plan.popular ? 'bg-yellow-500/20' : 'bg-slate-200'}`}>
                        <Check className={`w-4 h-4 ${plan.iconColor}`} />
                      </div>
                      <span className="text-sm font-medium leading-tight">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6">
                <button
                  className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-200
                    ${plan.buttonVariant === 'outline' 
                      ? 'border-2 border-slate-300 text-slate-700 hover:bg-slate-50' 
                      : plan.buttonColor
                    }
                  `}
                >
                  {plan.buttonText}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
