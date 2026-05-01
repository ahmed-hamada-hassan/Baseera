/**
 * @file features/transactions/components/ManualTransactionModal.tsx
 * @description نافذة إضافة معاملة يدوية للعرض في الديمو
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { PlusCircle, FileText } from 'lucide-react';
import { useCreateTransaction } from '../hooks/useTransactions';
import { toast } from 'sonner';

interface ManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManualTransactionModal({ isOpen, onClose }: ManualTransactionModalProps) {
  const [mounted, setMounted] = useState(false);
  const { mutate: createTransaction, isPending } = useCreateTransaction();

  const [amount, setAmount] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [category, setCategory] = useState('Food');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setMerchantName('');
      setCategory('Food');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || !merchantName) return;

    createTransaction(
      {
        amount: Number(amount),
        merchantName,
        category,
        transactionDate: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('تمت إضافة المعاملة بنجاح!');
          onClose();
        },
        onError: (error: any) => {
          console.error("Create Tx Error:", error?.response?.data || error);
          const errorMsg = error?.response?.data?.title || error?.response?.data?.message || JSON.stringify(error?.response?.data) || 'حدث خطأ غير معروف';
          toast.error(`حدث خطأ أثناء إضافة المعاملة: ${errorMsg}`);
        },
      }
    );
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4"
      dir="rtl"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[400px] bg-[#F8FAFC] rounded-[28px] shadow-2xl flex flex-col p-8"
        role="dialog"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#E0E7FF] text-[#8B5CF6] flex items-center justify-center mb-4 shadow-sm">
            <PlusCircle size={28} />
          </div>
          <h2 className="text-2xl font-bold text-[#1E293B] mb-1">إضافة معاملة يدوية</h2>
          <p className="text-[#64748B] text-sm">أدخل تفاصيل المعاملة الجديدة لتحديث ميزانيتك.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5 text-right">المبلغ (ج.م)</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="مثال: 500"
              className="w-full h-12 px-4 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] outline-none text-right transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5 text-right">اسم التاجر أو الجهة</label>
            <input
              type="text"
              required
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="مثال: ستاربكس"
              className="w-full h-12 px-4 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] outline-none text-right transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1E293B] mb-1.5 text-right">الفئة</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-[#CBD5E1] bg-white text-[#1E293B] outline-none text-right transition-all"
            >
              <option value="Food">طعام (Food)</option>
              <option value="Entertainment">ترفيه (Entertainment)</option>
              <option value="Shopping">تسوق (Shopping)</option>
              <option value="Utilities">فواتير (Utilities)</option>
              <option value="Other">أخرى (Other)</option>
            </select>
          </div>

          <div className="flex w-full gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-3.5 bg-[#8B5CF6] text-white rounded-xl text-sm font-bold hover:bg-[#7C3AED] transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              <FileText size={18} />
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
