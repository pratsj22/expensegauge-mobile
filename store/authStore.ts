import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthStore = {
  name: string | null;
  email: string | null;
  role: string | null;
  admin: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  setTokens: (access: string, refresh: string) => void;
  setUser: (name: string, email: string, role: string) => void;
  clearTokens: () => void;
  reset: () => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      name: null,
      email: null,
      role: null,
      admin: null,
      accessToken: null,
      refreshToken: null,
      setTokens: (access, refresh) => set({ accessToken: access, refreshToken: refresh }),
      setUser: (name, email, role) => set({ name: name, email: email, role: role }),
      clearTokens: () => set({ accessToken: null, refreshToken: null }),
      reset: () => set(() => {
        return {
          name: null,
          email: null,
          role: null,
          admin: null,
          accessToken: null,
          refreshToken: null,
        }
      }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
