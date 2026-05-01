/**
 * @file features/subscriptions/components/CreateSubscriptionModal.tsx
 * @description نافذة منبثقة لإنشاء اشتراك جديد
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUIStore } from '@/shared/store/ui.store';
import { useCreateSubscription } from '../hooks/useSubscriptions';
import { CreateSubscriptionFormSchema, type CreateSubscriptionForm } from '@/shared/lib/schemas/subscription.schema';
import { Button } from '@/shared/ui/Button/Button';
import { FormInput } from '@/shared/ui/Form/FormInput';
import { FormSelect } from '@/shared/ui/Form/FormSelect';
import { X } from 'lucide-react';

export function CreateSubscriptionModal() {
  const activeModal = useUIStore((s) => s.activeModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const showNotification = useUIStore((s) => s.showNotification);

  const createMutation = useCreateSubscription();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(CreateSubscriptionFormSchema),
    defaultValues: { currency: 'SAR', plan: 'starter' },
  });

  if (activeModal !== 'createSubscription') return null;

  const onSubmit = (data: CreateSubscriptionForm) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createMutation.mutate(data as any, {
      onSuccess: () => {
        showNotification('success', 'تم إنشاء الاشتراك بنجاح!');
        reset();
        closeModal();
      },
      onError: (err) => {
        showNotification('error', 'حدث خطأ أثناء الإنشاء، حاول مرة أخرى.');
        console.error(err);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md bg-surface-card border border-surface-border rounded-2xl shadow-card flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between p-6 border-b border-surface-border">
          <h2 id="modal-title" className="text-xl font-bold text-white">إضافة اشتراك جديد</h2>
          <button
            onClick={closeModal}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-4">
          <FormInput
            id="name"
            label="اسم المشترك"
            registration={register('name')}
            error={errors.name}
            placeholder="أدخل الاسم الكامل"
          />

          <FormInput
            id="email"
            label="البريد الإلكتروني"
            type="email"
            registration={register('email')}
            error={errors.email}
            placeholder="example@domain.com"
          />

          <FormSelect
            id="plan"
            label="الباقة"
            registration={register('plan')}
            error={errors.plan}
            options={[
              { value: 'free', label: 'مجاني' },
              { value: 'starter', label: 'مبتدئ' },
              { value: 'growth', label: 'نمو' },
              { value: 'enterprise', label: 'مؤسسي' },
            ]}
          />

          <FormSelect
            id="currency"
            label="العملة"
            registration={register('currency')}
            error={errors.currency}
            options={[
              { value: 'SAR', label: 'ريال سعودي (SAR)' },
              { value: 'USD', label: 'دولار أمريكي (USD)' },
            ]}
          />

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={closeModal} type="button">
              إلغاء
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              حفظ الاشتراك
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
