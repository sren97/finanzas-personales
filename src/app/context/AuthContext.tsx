import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

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

// Mock DB
const mockUsers: Record<string, User & { pass: string }> = {};

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
    const emailLower = email.toLowerCase();
    const foundUser = mockUsers[emailLower];
    if (foundUser && foundUser.pass === pass) {
      if (!foundUser.activo) {
        toast.error("Tu cuenta está desactivada. Contacta al administrador");
        return false;
      }
      const { pass: _, ...safeUser } = foundUser;
      setUser(safeUser);
      return true;
    }
    toast.error("Correo o contraseña incorrectos");
    return false;
  };

  const register = async (name: string, email: string, pass: string) => {
    const emailLower = email.toLowerCase();
    if (mockUsers[emailLower]) {
      toast.error("Este correo ya está registrado");
      return false;
    }
    const newUser: User & { pass: string } = {
      id: crypto.randomUUID(),
      name,
      email: emailLower,
      pass,
      role: "USUARIO_ESTANDAR",
      activo: true,
    };
    mockUsers[emailLower] = newUser;
    const { pass: _, ...safeUser } = newUser;
    setUser(safeUser);
    return true;
  };

  const logout = () => {
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
