import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { budgetsService, PresupuestoResponse } from "../../services/budgets.service";

export type Budget = {
  id: number;
  name: string;
  amount: number;
  categoryId: number;
  startDate: string;
  period: "MENSUAL" | "TRIMESTRAL" | "ANUAL";
  status: "BORRADOR" | "ACTIVO";
  active: boolean;
};

type BudgetsContextType = {
  budgets: Budget[];
  loading: boolean;
  activeBudget: Budget | null;
  createBudget: (name: string, amount: number, categoryId: number, startDate: string, period: "MENSUAL" | "TRIMESTRAL" | "ANUAL") => Promise<void>;
  updateBudget: (id: number, name: string, amount: number, categoryId: number, startDate: string, period: "MENSUAL" | "TRIMESTRAL" | "ANUAL") => Promise<void>;
  activateBudget: (id: number) => Promise<void>;
  deleteBudget: (id: number) => Promise<boolean>;
};

const BudgetsContext = createContext<BudgetsContextType | undefined>(undefined);

function mapPresupuestoToBudget(pres: PresupuestoResponse): Budget {
  return {
    id: pres.id,
    name: pres.nombre,
    amount: pres.monto,
    categoryId: pres.categoriaId,
    startDate: pres.fechaInicio,
    period: pres.periodo,
    status: pres.estado,
    active: pres.activo,
  };
}

export function BudgetsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBudgets = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const buds = await budgetsService.listBudgets();
      setBudgets(buds.map(mapPresupuestoToBudget));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al cargar presupuestos";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [user?.id]);

  const activeBudget = budgets.find((b) => b.status === "ACTIVO") || null;

  const createBudget = async (
    name: string,
    amount: number,
    categoryId: number,
    startDate: string,
    period: "MENSUAL" | "TRIMESTRAL" | "ANUAL"
  ) => {
    try {
      const newBudget = await budgetsService.createBudget({
        nombre: name,
        monto: amount,
        categoriaId: categoryId,
        fechaInicio: startDate,
        periodo: period,
      });
      setBudgets((prev) => [...prev, mapPresupuestoToBudget(newBudget)]);
      toast.success("Presupuesto creado");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al crear presupuesto";
      toast.error(errorMessage);
    }
  };

  const updateBudget = async (
    id: number,
    name: string,
    amount: number,
    categoryId: number,
    startDate: string,
    period: "MENSUAL" | "TRIMESTRAL" | "ANUAL"
  ) => {
    try {
      const updated = await budgetsService.updateBudget(id, {
        nombre: name,
        monto: amount,
        categoriaId: categoryId,
        fechaInicio: startDate,
        periodo: period,
      });
      setBudgets((prev) =>
        prev.map((b) => (b.id === id ? mapPresupuestoToBudget(updated) : b))
      );
      toast.success("Presupuesto actualizado");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar presupuesto";
      toast.error(errorMessage);
    }
  };

  const activateBudget = async (id: number) => {
    try {
      const activated = await budgetsService.activateBudget(id);
      setBudgets((prev) =>
        prev.map((b) => mapPresupuestoToBudget(b.id === id ? activated : { ...b, estado: "BORRADOR" as const }))
      );
      toast.success("Presupuesto activado");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al activar presupuesto";
      toast.error(errorMessage);
    }
  };

  const deleteBudget = async (id: number) => {
    try {
      // Backend doesn't have a delete endpoint, so we just remove locally
      setBudgets((prev) => prev.filter((b) => b.id !== id));
      toast.success("Presupuesto eliminado");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar presupuesto";
      toast.error(errorMessage);
      return false;
    }
  };

  return (
    <BudgetsContext.Provider
      value={{
        budgets,
        loading,
        activeBudget,
        createBudget,
        updateBudget,
        activateBudget,
        deleteBudget,
      }}
    >
      {children}
    </BudgetsContext.Provider>
  );
}

export function useBudgets() {
  const context = useContext(BudgetsContext);
  if (context === undefined) {
    throw new Error("useBudgets must be used within a BudgetsProvider");
  }
  return context;
}
