import { toast } from 'sonner';

export function handleGlobalError(error: unknown) {
  let msg = 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.';
  
  if (typeof error === 'object' && error !== null) {
    const anyError = error as any;
    if (anyError.response?.status === 429) {
      msg = 'الكثير من الطلبات، يرجى الانتظار قليلاً.';
    } else if (anyError.response?.data?.message) {
      msg = anyError.response.data.message;
    } else if (anyError.message) {
      msg = anyError.message;
    }
  } else if (typeof error === 'string') {
    msg = error;
  }

  toast.error(msg);
}

export function useGlobalError() {
  return handleGlobalError;
}
