import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { authService } from "../../services/auth.service";
import { apiClient } from "../../services/api";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "USUARIO_ESTANDAR" | "ADMINISTRADOR";
  activo: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth_user");
    }
  }, [user]);

  const login = async (email: string, pass: string) => {
    try {
      const response = await authService.login(email, pass);
      apiClient.setToken(response.token);
      const user: User = {
        id: response.usuarioId.toString(),
        name: response.nombre,
        email,
        role: "USUARIO_ESTANDAR",
        activo: true,
      };
      setUser(user);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Correo o contraseña incorrectos";
      toast.error(errorMessage);
      return false;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const response = await authService.register(name, email, pass);
      apiClient.setToken(response.token);
      const user: User = {
        id: response.usuarioId.toString(),
        name: response.nombre,
        email,
        role: "USUARIO_ESTANDAR",
        activo: true,
      };
      setUser(user);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al registrarse";
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = () => {
    apiClient.removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
