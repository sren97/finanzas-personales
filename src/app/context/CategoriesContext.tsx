import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { categoriesService, CategoriaResponse } from "../../services/categories.service";

export type Category = {
  id: number;
  name: string;
  type: "INGRESO" | "EGRESO" | "AMBOS";
  icon: string;
  active: boolean;
};

type CategoriesContextType = {
  categories: Category[];
  loading: boolean;
  createCategory: (name: string, type: "INGRESO" | "EGRESO" | "AMBOS", icon?: string) => Promise<void>;
  updateCategory: (id: number, name: string, type: "INGRESO" | "EGRESO" | "AMBOS", icon?: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<boolean>;
  getCategoryName: (id: number) => string;
};

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

function mapCategoriaToCategory(cat: CategoriaResponse): Category {
  return {
    id: cat.id,
    name: cat.nombre,
    type: cat.tipo,
    icon: cat.icono,
    active: cat.activo,
  };
}

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const cats = await categoriesService.listCategories();
      setCategories(cats.map(mapCategoriaToCategory));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al cargar categorías";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [user?.id]);

  const createCategory = async (
    name: string,
    type: "INGRESO" | "EGRESO" | "AMBOS",
    icon = "tag"
  ) => {
    try {
      const newCat = await categoriesService.createCategory({
        nombre: name,
        tipo: type,
        icono: icon,
      });
      setCategories((prev) => [...prev, mapCategoriaToCategory(newCat)]);
      toast.success("Categoría creada exitosamente");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al crear categoría";
      toast.error(errorMessage);
    }
  };

  const updateCategory = async (
    id: number,
    name: string,
    type: "INGRESO" | "EGRESO" | "AMBOS",
    icon?: string
  ) => {
    try {
      const updated = await categoriesService.updateCategory(id, {
        nombre: name,
        tipo: type,
        icono: icon,
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? mapCategoriaToCategory(updated) : c))
      );
      toast.success("Categoría actualizada");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar categoría";
      toast.error(errorMessage);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await categoriesService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast.success("Categoría eliminada");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar categoría";
      toast.error(errorMessage);
      return false;
    }
  };

  const getCategoryName = (id: number): string => {
    return categories.find((c) => c.id === id)?.name || "Sin categoría";
  };

  return (
    <CategoriesContext.Provider
      value={{
        categories,
        loading,
        createCategory,
        updateCategory,
        deleteCategory,
        getCategoryName,
      }}
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
