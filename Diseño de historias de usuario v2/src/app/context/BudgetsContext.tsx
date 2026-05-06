import React, { createContext, useContext, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export type CategoryBudget = {
  categoryId: string;
  limitAmount: number;
  spentAmount: number;
};

export type Budget = {
  id: string;
  userId: string;
  period: string; // e.g. "2026-05"
  globalAmount: number;
  globalSpent: number;
  categoryLimits: CategoryBudget[];
  active: boolean;
};

const MOCK_BUDGETS: Budget[] = [
  {
    id: "b-1",
    userId: "u-1", // Ana's ID
    period: new Date().toISOString().slice(0, 7),
    globalAmount: 1500,
    globalSpent: 0, // We will update this dynamically or statically
    categoryLimits: [
      {
        categoryId: "cat-2", // Comida
        limitAmount: 400,
        spentAmount: 0
      },
      {
        categoryId: "cat-4", // Transporte
        limitAmount: 150,
        spentAmount: 0
      }
    ],
    active: true
  }
];

type BudgetsContextType = {
  budgets: Budget[];
  activeBudget: Budget | null;
  addExpenseToBudget: (date: string, categoryId: string, amount: number) => void;
};

const BudgetsContext = createContext<BudgetsContextType | undefined>(undefined);

export function BudgetsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [allBudgets, setAllBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem("app_budgets");
    return saved ? JSON.parse(saved) : MOCK_BUDGETS;
  });

  // Persist budgets
  React.useEffect(() => {
    localStorage.setItem("app_budgets", JSON.stringify(allBudgets));
  }, [allBudgets]);

  const userBudgets = allBudgets.filter(b => b.userId === user?.id);
  
  // Asumimos que el presupuesto activo es el del mes actual
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const activeBudget = userBudgets.find(b => b.active && b.period === currentMonth) || null;

  const addExpenseToBudget = (date: string, categoryId: string, amount: number) => {
    if (!user) return;
    const txMonth = date.slice(0, 7);
    
    setAllBudgets(prev => prev.map(budget => {
      // Solo afectamos el presupuesto si pertenece al mes de la transacción y es del usuario
      if (budget.userId === user.id && budget.period === txMonth && budget.active) {
        
        let newGlobalSpent = budget.globalSpent + amount;
        
        const newCategoryLimits = budget.categoryLimits.map(cat => {
          if (cat.categoryId === categoryId) {
            const newSpent = cat.spentAmount + amount;
            // Mostrar alertas opcionales en el prototipo si se supera el 100%
            if (newSpent > cat.limitAmount && cat.spentAmount <= cat.limitAmount) {
              toast.warning(`¡Atención! Has superado el límite de tu presupuesto para esta categoría.`);
            } else if (newSpent >= cat.limitAmount * 0.8 && cat.spentAmount < cat.limitAmount * 0.8) {
              toast.info(`Has consumido el 80% del límite de tu presupuesto para esta categoría.`);
            }
            return { ...cat, spentAmount: newSpent };
          }
          return cat;
        });

        // Si la categoría no estaba explícitamente limitada, igual cuenta para el global, 
        // pero en un MVP a veces solo se limitan algunas categorías. El total siempre suma.

        if (newGlobalSpent > budget.globalAmount && budget.globalSpent <= budget.globalAmount) {
          toast.error(`¡Has superado el monto global de tu presupuesto mensual!`);
        } else if (newGlobalSpent >= budget.globalAmount * 0.8 && budget.globalSpent < budget.globalAmount * 0.8) {
          toast.warning(`Atención: Has consumido el 80% de tu presupuesto mensual.`);
        }

        return {
          ...budget,
          globalSpent: newGlobalSpent,
          categoryLimits: newCategoryLimits
        };
      }
      return budget;
    }));
  };

  return (
    <BudgetsContext.Provider value={{ budgets: userBudgets, activeBudget, addExpenseToBudget }}>
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