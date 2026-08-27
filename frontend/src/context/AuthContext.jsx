import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("fixguard_token");
    if (!token) {
      setReady(true);
      return;
    }
    authApi("/api/auth/me")
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => localStorage.removeItem("fixguard_token"))
      .finally(() => setReady(true));
  }, []);

  async function login(credentials) {
    const result = await authApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    localStorage.setItem("fixguard_token", result.token);
    setUser(result.user);
    return result.user;
  }

  function logout() {
    localStorage.removeItem("fixguard_token");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, ready, login, logout, setUser, isAuthenticated: Boolean(user) }),
    [user, ready],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
