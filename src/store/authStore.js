import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_PASSWORD = 'Spidy@123';

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (password) => {
        if (password === DEFAULT_PASSWORD) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
