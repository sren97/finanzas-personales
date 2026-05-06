import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export type CategoryType = "INGRESO" | "EGRESO" | "AMBOS";
export type CategoryOrigin = "SISTEMA" | "USUARIO";

export type Category = {
  id: string;
  userId: string | null;
  name: string;
  type: CategoryType;
  origin: CategoryOrigin;
  icon: string;
  active: boolean;
};

type CategoriesContextType = {
  categories: Category[];
  createCategory: (name: string, type: CategoryType, icon: string) => boolean;
  updateCategory: (id: string, name: string, icon: string) => boolean;
  deleteCategory: (id: string) => boolean;
  getCategoryName: (id: string) => string;
};

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: Category[] = [
  { id: "sys-1", userId: null, name: "Salario", type: "INGRESO", origin: "SISTEMA", icon: "briefcase", active: true },
  { id: "sys-2", userId: null, name: "Alimentación", type: "EGRESO", origin: "SISTEMA", icon: "utensils", active: true },
  { id: "sys-3", userId: null, name: "Transporte", type: "EGRESO", origin: "SISTEMA", icon: "car", active: true },
  { id: "sys-4", userId: null, name: "Varios", type: "AMBOS", origin: "SISTEMA", icon: "layout-grid", active: true },
];

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [allCategories, setAllCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem("app_categories");
    if (saved) {
      const parsed = JSON.parse(saved);
      // Asegurar que las del sistema existan
      const hasSystem = parsed.some((c: Category) => c.origin === "SISTEMA");
      return hasSystem ? parsed : [...DEFAULT_CATEGORIES, ...parsed];
    }
    return [...DEFAULT_CATEGORIES];
  });

  useEffect(() => {
    localStorage.setItem("app_categories", JSON.stringify(allCategories));
  }, [allCategories]);

  // Las categorías del sistema (userId === null) y las del usuario
  const userCategories = allCategories.filter(
    (c) => (c.userId === null || c.userId === user?.id) && c.active
  );

  const checkDuplicateName = (name: string, excludeId?: string) => {
    return userCategories.some(
      (c) => c.name.toLowerCase() === name.toLowerCase() && c.id !== excludeId
    );
  };

  const createCategory = (name: string, type: CategoryType, icon: string) => {
    if (!user) return false;
    
    if (checkDuplicateName(name)) {
      toast.error("Ya tienes una categoría con ese nombre");
      return false;
    }

    const newCategory: Category = {
      id: crypto.randomUUID(),
      userId: user.id,
      name,
      type,
      origin: "USUARIO",
      icon,
      active: true,
    };
    
    setAllCategories((prev) => [...prev, newCategory]);
    toast.success("Categoría creada exitosamente");
    return true;
  };

  const updateCategory = (id: string, name: string, icon: string) => {
    if (checkDuplicateName(name, id)) {
      toast.error("Ya tienes una categoría con ese nombre");
      return false;
    }

    setAllCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          // Si es del sistema, simulamos un "override" local mutando el objeto
          // En un sistema real se guardaría una copia o se manejaría distinto
          return { ...c, name, icon };
        }
        return c;
      })
    );
    toast.success("Categoría actualizada");
    return true;
  };

  const deleteCategory = (id: string) => {
    // Regla: mínimo una categoría activa
    if (userCategories.length <= 1) {
      toast.error("Debes tener al menos una categoría activa para poder registrar transacciones");
      return false;
    }

    // Aquí deberíamos validar si tiene transacciones asociadas para mostrar un mensaje o impedir borrado duro.
    // Como dice el alcance: "Soft delete implementado para categorías con transacciones asociadas"
    // Haremos soft delete siempre.
    
    setAllCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: false } : c))
    );
    toast.success("Categoría eliminada");
    return true;
  };

  const getCategoryName = (id: string) => {
    const cat = allCategories.find(c => c.id === id);
    return cat ? cat.name : "Desconocido";
  };

  return (
    <CategoriesContext.Provider
      value={{ categories: userCategories, createCategory, updateCategory, deleteCategory, getCategoryName }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
}
