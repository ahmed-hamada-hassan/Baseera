/**
 * @file shared/store/ui.store.ts
 * @description Zustand store للحالة المحلية للواجهة (Client State)
 *
 * القاعدة الهندسية:
 *  - Server State  → TanStack Query  (بيانات الخادم، cache، sync)
 *  - Client State  → Zustand         (UI فقط: modals، sidebar، alerts)
 *
 * استخدام useUIStore مع selector محدد يمنع Re-render
 * للمكونات التي لا تتأثر بالتغيير:
 *   const isOpen = useUIStore(s => s.isCreateSubOpen); // ✅ فعّال
 *   const store  = useUIStore();                        // ❌ يُعيد تصيير كل شيء
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/* ── أنواع البيانات ── */
type ModalId =
  | 'createSubscription'
  | 'cancelSubscription'
  | 'viewSubscriber'
  | null;

interface UIState {
  /* Sidebar */
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  /* Modals */
  activeModal:    ModalId;
  modalPayload:   unknown;             // بيانات السياق (مثل: id المشترك)
  openModal:      (id: ModalId, payload?: unknown) => void;
  closeModal:     () => void;

  /* Global Notifications */
  notification:      { type: 'success' | 'error' | 'info'; message: string } | null;
  showNotification:  (type: 'success' | 'error' | 'info', message: string) => void;
  clearNotification: () => void;
  isChatbotOpen: boolean;

  openChatbot:  () => void;
  closeChatbot: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      /* ── Sidebar ── */
      isSidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed }), false, 'ui/toggleSidebar'),

      /* ── Modals ── */
      activeModal:  null,
      modalPayload: undefined,
      openModal: (id, payload) =>
        set({ activeModal: id, modalPayload: payload }, false, `ui/openModal:${String(id)}`),
      closeModal: () =>
        set({ activeModal: null, modalPayload: undefined }, false, 'ui/closeModal'),

      /* ── Notifications ── */
      notification: null,
      showNotification: (type, message) =>
        set({ notification: { type, message } }, false, 'ui/notify'),
      clearNotification: () => set({ notification: null }, false, 'ui/clearNotify'),

      // Chatbot Actions
      isChatbotOpen: false,
      openChatbot:  () => set({ isChatbotOpen: true }, false, 'ui/openChatbot'),
      closeChatbot: () => set({ isChatbotOpen: false }, false, 'ui/closeChatbot'),
    }),
    { name: 'basira-ui' },
  ),
);
