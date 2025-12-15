import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  deriveKey,
  generateMasterKey,
  unwrapMasterKey,
  wrapMasterKey,
} from "../api/encryption";

interface User {
  id: number;
  username: string;
  email: string;
  salt: string;
}

interface AuthState {
  user: User | null;
  encryptionKey: CryptoKey | null;
  isAuthenticated: boolean;
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;

  login: (username: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  initEncryptionKey: (password: string, salt: string) => Promise<void>;
}

const API_URL = "http://localhost:8000/api";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      encryptionKey: null,
      isAuthenticated: false,
      rememberMe: false,
      setRememberMe: (bool) => {
        set({ rememberMe: bool });
      },
      initEncryptionKey: async (password: string, salt: string) => {
        const key = await deriveKey(password, salt);
        set({ encryptionKey: key });
      },

      register: async (username: string, email: string, password: string) => {
        const masterKey = await generateMasterKey();
        const salt = crypto.randomUUID();
        const kek = await deriveKey(password, salt);
        const wrappedMasterKey = await wrapMasterKey(masterKey, kek);

        const response = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            username,
            email,
            password,
            salt,
            wrappedMasterKey,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail);
        }

        const data = await response.json();

        set({
          user: data.user,
          isAuthenticated: true,
          encryptionKey: masterKey,
        });
      },

      login: async (username: string, password: string) => {
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail);
        }

        const { user } = await response.json();

        const kek = await deriveKey(password, user.salt);
        const masterKey = await unwrapMasterKey(user.wrapped_master_key, kek);

        set({ encryptionKey: masterKey, user, isAuthenticated: true });
      },

      logout: async () => {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });

        set({
          user: null,
          encryptionKey: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        try {
          const response = await fetch(`${API_URL}/auth/me`, {
            credentials: "include",
          });

          if (!response.ok) {
            get().logout();
            return;
          }

          const data = await response.json();
          set({ user: data.user, isAuthenticated: true });
        } catch (e) {
          get().logout();
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => {
        return {
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        };
      },
    },
  ),
);
