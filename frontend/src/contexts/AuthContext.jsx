import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
<<<<<<< HEAD
    // Convert userId to id for consistency
    const normalizedUser = {
      ...userData,
      id: userData.userId || userData.id,
    };
=======
    const normalizedUser = {
      ...userData,
      role: userData.roles?.[0] || "CUSTOMER",
    };

>>>>>>> b9d646e2b48bcd8c96c9f3f58d597f51b9f7b8b5
    setUser(normalizedUser);
    localStorage.setItem("user", JSON.stringify(normalizedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
