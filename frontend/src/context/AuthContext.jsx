import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAccess, setTokens, clearTokens } from "../api/tokens";
import { getMe, login as apiLogin } from "../api/endpoints";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await getMe();
      setUser(response.data);
      return response.data;
    } catch {
      setUser(null);
      clearTokens();
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccess();
      if (token) {
        await fetchCurrentUser();
      }
      setLoading(false);
    };

    initAuth();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    const { access, refresh } = res.data;
    setTokens({ access, refresh });
    const userData = await fetchCurrentUser();
    return userData;
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  const refreshUser = async () => {
    return await fetchCurrentUser();
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
