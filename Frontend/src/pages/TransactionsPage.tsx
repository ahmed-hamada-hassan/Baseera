import { useState } from 'react';
import { Skeleton } from '@/shared/ui/Skeleton';
import { CreditCard, ScanLine, ShoppingBag, Coffee, MonitorPlay, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactions, useUpdateTransactionStatus } from '@/features/transactions/hooks/useTransactions';
import { OcrScannerModal } from '@/features/transactions/components/OcrScannerModal';
import type { Transaction } from '@/shared/lib/schemas/openapi.schema';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Shopping:      <ShoppingBag size={18} />,
  Food:          <Coffee size={18} />,
  Entertainment: <MonitorPlay size={18} />,
  Utilities:     <Zap size={18} />,
  Other:         <CreditCard size={18} />,
};

// Based on screenshot, icons have a light blue or purple circle background
const getIconColorClass = (category: string) => {
  if (category === 'Shopping' || category === 'Food' || category === 'Utilities') return 'bg-[#E0F2FE] text-[#1E293B]'; // Light blue circle, dark blue icon
  return 'bg-[#F3E8FF] text-[#8B5CF6]'; // Light purple circle, purple icon
};

const STATUS_FILTERS = ['الكل', 'المكتملة', 'قيد المراجعة'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

function TransactionRow({ tx, onConfirm }: { tx: Transaction; onConfirm: (id: string) => void }) {
  const icon  = CATEGORY_ICONS[tx.category]  ?? CATEGORY_ICONS['Other'];
  const colorClass = getIconColorClass(tx.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 gap-4 sm:gap-0 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
    >
      {/* Right Side (Icon & Info) */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm sm:text-base font-bold text-[#1E293B] mb-1">{tx.merchantName}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="bg-[#E0F2FE] text-[#1E293B] px-2 py-0.5 rounded text-[10px]">{tx.category || 'أخرى'}</span>
            <span className="hidden sm:inline">·</span>
            <time>{new Date(tx.transactionDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</time>
          </div>
        </div>
      </div>

      {/* Middle & Left Wrapper for Mobile */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0">
        {/* Middle Side (Badges & Actions) */}
        <div className="flex items-center gap-2 flex-wrap">
          {tx.status === 'Pending' ? (
            <>
              <span className="bg-[#FEF08A] text-[#854D0E] text-[10px] px-2 py-1 rounded-md flex items-center gap-1">
                <span>•••</span> <span className="hidden sm:inline">قيد الانتظار</span>
              </span>
              <button className="h-7 sm:h-8 px-3 sm:px-4 bg-white border border-slate-200 text-slate-600 text-[10px] sm:text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors">
                تعديل
              </button>
              <button onClick={() => onConfirm(tx.id)} className="h-7 sm:h-8 px-3 sm:px-4 bg-[#8B5CF6] text-white text-[10px] sm:text-xs font-medium rounded-lg hover:bg-[#7C3AED] transition-colors">
                تأكيد
              </button>
            </>
          ) : null}
        </div>

        {/* Left Side (Amount) */}
        <div className="flex flex-col items-end min-w-[80px] sm:min-w-[100px]">
          <span className="text-base sm:text-lg font-bold text-[#1E293B] font-mono flex items-center gap-1">
            {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span className="text-xs sm:text-sm font-normal">.</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export function TransactionsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('الكل');
  const [showOcr, setShowOcr] = useState(false);

  const { data: transactions, isLoading, error } = useTransactions(1, 100);
  const { mutate: updateStatus } = useUpdateTransactionStatus();

  const pendingCount = (transactions ?? []).filter(tx => tx.status === 'Pending').length;

  const filtered = (transactions ?? []).filter(tx => {
    if (statusFilter === 'الكل') return true;
    if (statusFilter === 'المكتملة') return tx.status === 'Confirmed';
    if (statusFilter === 'قيد المراجعة') return tx.status === 'Pending';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full max-w-5xl mx-auto" dir="rtl">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#1E293B] mb-2">
            المعاملات
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            إدارة وتتبع نفقاتك اليومية
          </p>
        </div>
        
        <button
          onClick={() => setShowOcr(true)}
          className="w-full sm:w-auto justify-center h-10 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <ScanLine size={16} />
          مسح إيصال جديد
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Tabs */}
        <div className="flex items-center px-4 sm:px-6 border-b border-slate-200 overflow-x-auto no-scrollbar whitespace-nowrap">
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors relative flex items-center gap-2 shrink-0 ${
                statusFilter === f ? 'text-[#8B5CF6]' : 'text-slate-500 hover:text-[#1E293B]'
              }`}
            >
              {f}
              {f === 'قيد المراجعة' && pendingCount > 0 && (
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#8B5CF6] text-white text-[10px] flex items-center justify-center">{pendingCount}</span>
              )}
              {statusFilter === f && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5CF6] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex flex-col">
          {error && (
            <div className="p-8 text-center text-red-500">تعذر تحميل المعاملات. تأكد من تشغيل الخادم.</div>
          )}

          {isLoading && (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-6 border-b border-slate-100">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-52" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-5 w-24" />
                </div>
              </div>
            ))
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="p-12 text-center text-slate-400">لا توجد معاملات مطابقة لهذا الفلتر.</div>
          )}

          <AnimatePresence>
            {filtered.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                onConfirm={(id) => updateStatus({ id, status: 'Confirmed' })}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* OCR Modal */}
      <OcrScannerModal isOpen={showOcr} onClose={() => setShowOcr(false)} />
    </div>
  );
}
