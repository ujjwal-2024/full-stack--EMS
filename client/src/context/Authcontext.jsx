import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Refresh session
  const refreshSession = async () => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      setToken(storedToken);

      try {
        const { data } = await api.get("/auth/session");

        setUser(data.user);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    refreshSession();
  }, []);

  // Login
  const login = async (email, password, role_type) => {
    const { data } = await api.post("/auth/login", {
      email,
      password,
      role_type,
    });

    localStorage.setItem("token", data.token);

    setToken(data.token);
    setUser(data.user);

    return data.user;
  };

  // Logout
  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthContext;