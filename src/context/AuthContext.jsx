import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
import { isFirebaseConfigured } from "../firebase/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseLive, setIsFirebaseLive] = useState(isFirebaseConfigured());

  useEffect(() => {
    const unsubscribe = authService.onAuthChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      setCurrentUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, displayName) => {
    setLoading(true);
    try {
      const res = await authService.register(email, password, displayName);
      setCurrentUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        isFirebaseLive,
        login,
        register,
        logout,
        setIsFirebaseLive
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
