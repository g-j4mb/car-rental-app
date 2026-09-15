import { create } from 'zustand';

interface UIStore {
  language: 'en' | 'ar';
  setLanguage: (language: 'en' | 'ar') => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  success: string | null;
  setSuccess: (message: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  language: 'en',
  setLanguage: (language) => set({ language }),
  loading: false,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),
  success: null,
  setSuccess: (success) => set({ success }),
}));
