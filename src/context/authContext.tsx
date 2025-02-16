'use client';

import React, { createContext, useState, useContext, useEffect } from "react";
import { auth } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

interface User {
  id: string;
  email: string | null;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        const userInfo = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || "User",
        };
        setToken(token);
        setUser(userInfo);
        setIsAuthenticated(true);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userInfo));
      } else {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (newToken: string, userInfo: User) => {
    setToken(newToken);
    setUser(userInfo);
    setIsAuthenticated(true);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userInfo));
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};