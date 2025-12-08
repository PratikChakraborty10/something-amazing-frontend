import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import type { User, Profile, Session } from "./api";

// Re-export types for convenience
export type { User, Profile, Session };

// ============================================================================
// SSR-Safe Storage Adapter
// ============================================================================

// Custom storage that safely handles SSR (localStorage doesn't exist on server)
const ssrSafeStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.removeItem(name);
  },
};

// ============================================================================
// Cookie Helpers (for middleware access)
// ============================================================================

function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// ============================================================================
// Auth Store State
// ============================================================================

interface AuthState {
  // State
  user: User | null;
  profile: Profile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  hasHydrated: boolean;

  // Actions
  setSession: (session: Session, user: User) => void;
  setUser: (user: User) => void;
  setProfile: (profile: Profile) => void;
  setLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
  signOut: () => void;
}

// ============================================================================
// Auth Store
// ============================================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      hasHydrated: false,

      // Actions
      setSession: (session, user) => {
        setCookie("access_token", session.accessToken);
        set({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          user,
        });
      },

      setUser: (user) => {
        set({ user });
      },

      setProfile: (profile) => {
        set({
          profile,
          user: {
            id: profile.id,
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
          },
        });
      },

      setLoading: (isLoading) => set({ isLoading }),

      clearAuth: () => {
        deleteCookie("access_token");
        set({
          user: null,
          profile: null,
          accessToken: null,
          refreshToken: null,
        });
      },

      signOut: () => {
        get().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => ssrSafeStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        profile: state.profile,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("[Auth Storage] Rehydration error:", error);
          return;
        }
        if (state?.accessToken) {
          setCookie("access_token", state.accessToken);
        }
      },
    }
  )
);

if (typeof window !== "undefined") {
  useAuthStore.persist.onFinishHydration(() => {
    useAuthStore.setState({ hasHydrated: true });
  });
}

// ============================================================================
// Convenience hooks
// ============================================================================

export const useUser = () => useAuthStore((state) => state.user);
export const useProfile = () => useAuthStore((state) => state.profile);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.accessToken);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useHasHydrated = () => useAuthStore((state) => state.hasHydrated);

