import { create } from 'zustand';
import type { User } from '@pulse/shared/types';
import employeesData from '@pulse/shared/seeds/employees.json';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

// Helper to safely cast employees.json JSON data to User[]
const employees = employeesData as unknown as User[];

export const useAuthStore = create<AuthState>((set) => {
  // Try to load user from localStorage on initialization
  let initialUser: User | null = null;
  try {
    const storedUser = localStorage.getItem('pulse_session_user');
    if (storedUser) {
      initialUser = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error('Failed to parse stored user session', e);
  }

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    isLoading: false,
    error: null,

    login: async (email: string) => {
      set({ isLoading: true, error: null });
      
      // Simulate premium 800ms network latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      const foundUser = employees.find(
        (emp) => emp.email.toLowerCase() === email.trim().toLowerCase() && emp.isActive
      );

      if (foundUser) {
        localStorage.setItem('pulse_session_user', JSON.stringify(foundUser));
        set({ user: foundUser, isAuthenticated: true, isLoading: false, error: null });
        return true;
      } else {
        set({ 
          isLoading: false, 
          error: 'Invalid corporate email address or inactive account. Try priya.menon@pulse.co, arjun.rao@pulse.co, or meera.iyer@pulse.co' 
        });
        return false;
      }
    },

    logout: () => {
      localStorage.removeItem('pulse_session_user');
      set({ user: null, isAuthenticated: false, error: null });
    },

    clearError: () => set({ error: null })
  };
});
