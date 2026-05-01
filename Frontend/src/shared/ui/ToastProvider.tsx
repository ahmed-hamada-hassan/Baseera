import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        className: 'font-arabic',
      }}
      theme="dark"
      dir="rtl"
    />
  );
}
