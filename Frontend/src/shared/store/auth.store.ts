/**
/** src/shared/store/auth.store.ts */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { User } from '@/shared/lib/schemas/auth.schema'; // Adjust import path if needed

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    setUser: (user) => set({ user, isAuthenticated: true }),
    setToken: (token) => set({ token, isAuthenticated: true }),
    logout: () => {
      // Clean local storage to avoid infinite redirect loops
      localStorage.removeItem('basira_token');
      localStorage.removeItem('basira_user');
      set({ user: null, token: null, isAuthenticated: false });
    },
  })),
);
