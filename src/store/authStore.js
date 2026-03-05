import { create } from 'zustand';

const DEFAULT_PASSWORD = 'Spidy@123';

// Check session storage on init
const getInitialAuth = () => {
  try {
    const stored = sessionStorage.getItem('auth-session');
    if (stored) {
      const { isAuthenticated } = JSON.parse(stored);
      return isAuthenticated || false;
    }
  } catch (error) {
    console.error('Error reading session:', error);
  }
  return false;
};

export const useAuthStore = create((set) => ({
  isAuthenticated: getInitialAuth(),
  
  login: (password) => {
    if (password === DEFAULT_PASSWORD) {
      sessionStorage.setItem('auth-session', JSON.stringify({ isAuthenticated: true }));
      set({ isAuthenticated: true });
      return true;
    }
    return false;
  },
  
  logout: () => {
    sessionStorage.removeItem('auth-session');
    set({ isAuthenticated: false });
  },
}));
