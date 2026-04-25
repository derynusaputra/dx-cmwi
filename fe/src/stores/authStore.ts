import { create } from 'zustand';

interface User {
  id: number;
  username: string;
  roles: string[];
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  activeRole: 'admin' | 'operator' | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  setActiveRole: (role: 'admin' | 'operator') => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  activeRole: null,
  isAuthenticated: false,
  setAuth: (token, user) => set({ accessToken: token, user, isAuthenticated: true }),
  setActiveRole: (role) => set({ activeRole: role }),
  logout: () => set({ accessToken: null, user: null, activeRole: null, isAuthenticated: false }),
}));
