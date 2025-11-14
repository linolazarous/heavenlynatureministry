// src/components/AuthContext.jsx
import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [auth, setAuth] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  /* -----------------------------
     Login (Mock)
  -------------------------------- */
  const login = useCallback(async (email) => {
    if (!email || !email.includes("@")) {
      toast.error("Enter a valid email.");
      return;
    }

    setAuth((p) => ({ ...p, isLoading: true }));

    await new Promise((r) => setTimeout(r, 500));

    const user = {
      id: Date.now().toString(),
      email,
      name: email.split("@")[0],
    };

    localStorage.setItem("user", JSON.stringify(user));

    setAuth({
      user,
      isAuthenticated: true,
      isLoading: false,
    });

    toast.success("Logged in successfully.");
    navigate(location.state?.from || "/", { replace: true });
  }, []);

  /* -----------------------------
     Logout
  -------------------------------- */
  const logout = useCallback(() => {
    localStorage.removeItem("user");
    setAuth({ user: null, isAuthenticated: false, isLoading: false });
    toast.success("Logged out.");
    navigate("/login", { replace: true });
  }, []);

  /* -----------------------------
     Load user from storage
  -------------------------------- */
  const check = useCallback(() => {
    try {
      const data = localStorage.getItem("user");
      if (data) {
        setAuth({ user: JSON.parse(data), isAuthenticated: true, isLoading: false });
      } else {
        setAuth({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      setAuth({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  useEffect(() => check(), [check]);

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        login,
        logout,
        refreshUser: check,
        getToken: async () => "mock-token",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* -----------------------------
   Hooks
-------------------------------- */
export function useAuth() {
  return useContext(AuthContext);
}

export function useRequireAuth(redirect = "/login") {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(redirect, { state: { from: location.pathname } });
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, isLoading };
}
