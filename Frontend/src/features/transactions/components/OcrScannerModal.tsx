/**
 * @file features/transactions/components/OcrScannerModal.tsx
 * @description نافذة المسح الضوئي للإيصالات — ترسل البيانات عبر POST /api/Transactions/ocr
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ScanLine, FileText, Camera } from 'lucide-react';
import { useSubmitOcr } from '../hooks/useTransactions';
import { toast } from 'sonner';

interface OcrScannerModalProps {
  isOpen:  boolean;
  onClose: () => void;
}

export function OcrScannerModal({ isOpen, onClose }: OcrScannerModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const { mutate: submitOcr, isPending: scanning } = useSubmitOcr();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedImage(null);
      setFile(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setSelectedImage(URL.createObjectURL(selected));
    }
  };

  const handleScan = () => {
    if (!file) return;
    submitOcr(file, {
      onSuccess: (data) => {
        if (data && data.amount) {
           toast.success(`تم استخراج الإيصال بنجاح!`, {
             description: `المبلغ: ${data.amount} ريال - التاجر: ${data.merchantName || 'غير محدد'}`,
           });
        } else {
           toast.success(`تم استخراج الإيصال بنجاح!`);
        }
        setTimeout(() => {
          onClose();
        }, 1000);
      },
      onError: () => {
        toast.error('حدث خطأ أثناء تحليل الإيصال، يرجى المحاولة مرة أخرى.');
      }
    });
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4"
      dir="rtl"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[400px] bg-[#F8FAFC] rounded-[28px] shadow-2xl flex flex-col items-center p-8 text-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ocr-modal-title"
      >
        
        {/* Top Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#E0E7FF] text-[#8B5CF6] flex items-center justify-center mb-5 shadow-sm">
          <ScanLine size={28} />
        </div>

        {/* Text */}
        <h2 id="ocr-modal-title" className="text-2xl font-bold text-[#1E293B] mb-2">
          {scanning ? 'جاري تحليل الإيصال...' : 'مسح إيصال جديد'}
        </h2>
        <p className="text-[#64748B] text-sm mb-6 px-2">
          {scanning ? 'يقوم الذكاء الاصطناعي باستخراج البيانات وتصنيف النفقات' : 'التقط صورة للإيصال أو قم برفعها من جهازك لتحليلها تلقائياً'}
        </p>

        {/* Scanner Image Area */}
        <div className={`relative w-full h-[240px] rounded-2xl overflow-hidden mb-8 flex items-center justify-center transition-all duration-300 ${!selectedImage ? 'bg-slate-50 border-2 border-dashed border-slate-300 hover:bg-slate-100 hover:border-violet-400 group' : 'bg-slate-100 border border-slate-200'}`}>
          
          {!selectedImage ? (
            <div className="flex flex-col items-center justify-center w-full h-full p-4 relative">
              <input 
                id="ocr-file-upload"
                type="file" 
                accept="image/*" 
                capture="environment" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                onChange={handleFileChange}
              />
              <div className="w-16 h-16 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-violet-200 transition-all duration-300 shadow-sm">
                <Camera size={32} />
              </div>
              <span className="text-slate-700 font-bold mb-1">اضغط لالتقاط صورة</span>
              <span className="text-slate-400 text-xs font-medium">أو المس لرفع ملف من جهازك</span>
            </div>
          ) : (
            <>
              {/* Selected Image */}
              <img src={selectedImage} alt="Receipt" className="w-full h-full object-cover opacity-90" />
              
              {/* Scanning Line Animation */}
              {scanning && (
                <div 
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-[#8B5CF6]/40 to-[#8B5CF6] opacity-60 animate-scan shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
                  style={{ height: '50%', borderBottom: '3px solid #8B5CF6' }}
                />
              )}
            </>
          )}

        </div>

        {/* Actions */}
        <div className="flex w-full gap-3">
          <button 
            onClick={onClose}
            disabled={scanning}
            className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm disabled:opacity-50"
          >
            إلغاء
          </button>
          
          {selectedImage && !scanning && (
            <button 
              onClick={handleScan}
              className="flex-1 py-3.5 bg-[#10B981] text-white rounded-xl text-sm font-bold hover:bg-[#059669] transition-all shadow-md shadow-emerald-200 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <FileText size={18} />
              تحليل الآن
            </button>
          )}
        </div>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
