import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';

interface AuthStore {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      setUser: (user, token) => {
        set({
          user,
          role: user.role,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },
      logout: () => {
        set({
          user: null,
          role: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
