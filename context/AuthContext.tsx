"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// Shape of the auth context
interface AuthContextType {
  username: string | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// AuthProvider wraps the whole app — provides auth state to all children
export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On app load, restore auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUsername = localStorage.getItem("username");
    if (savedToken && savedUsername) {
      setToken(savedToken);
      setUsername(savedUsername);
    }
    setIsLoading(false);
  }, []);

  // Login — call /auth/login, store token
  const login = async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });
    const { token, username: user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("username", user);
    setToken(token);
    setUsername(user);
    router.push("/chat"); // redirect to chat page
  };

  // Register — call /auth/register, then auto-login
  const register = async (username: string, password: string) => {
    await api.post("/auth/register", { username, password });
    await login(username, password); // auto-login after register
  };

  // Logout — clear everything, redirect to login
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ username, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — use this in any component to access auth
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
