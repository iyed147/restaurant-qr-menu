import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UserRole = "employe" | "admin" | "super_admin";

interface AuthState {
  token: string | null;
  role: UserRole | null;
  userId: number | null;
  login: (token: string, role: UserRole, userId: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      role: null,
      userId: null,
      login: (token, role, userId) => {
        localStorage.setItem("access_token", token);
        set({ token, role, userId });
      },
      logout: () => {
        localStorage.removeItem("access_token");
        set({ token: null, role: null, userId: null });
      },
    }),
    {
      name: "auth-session",
      storage: createJSONStorage(() => localStorage),
    }
  )
);