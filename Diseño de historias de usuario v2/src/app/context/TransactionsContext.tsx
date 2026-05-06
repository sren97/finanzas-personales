import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useAccounts } from "./AccountsContext";
import { useBudgets } from "./BudgetsContext";
import { toast } from "sonner";

export type TransactionType = "INGRESO" | "EGRESO" | "TRANSFERENCIA";

export type Transaction = {
  id: string;
  userId: string;
  accountId: string;
  categoryId: string | null;
  type: TransactionType;
  amount: number;
  date: string;
  description: string | null;
  destinationAccountId: string | null; // For transfers
};

type TransactionsContextType = {
  transactions: Transaction[];
  createIncome: (accountId: string, categoryId: string, amount: number, date: string, description?: string) => boolean;
  createExpense: (accountId: string, categoryId: string, amount: number, date: string, description?: string) => boolean;
};

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { accounts, updateAccount } = useAccounts();
  const { addExpenseToBudget } = useBudgets();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("app_transactions");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("app_transactions", JSON.stringify(allTransactions));
  }, [allTransactions]);

  const userTransactions = allTransactions.filter((t) => t.userId === user?.id);

  const createIncome = (accountId: string, categoryId: string, amount: number, date: string, description?: string) => {
    if (!user) return false;
    
    if (amount <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      toast.error("La fecha no puede ser posterior a la fecha actual");
      return false;
    }

    const account = accounts.find(a => a.id === accountId);
    if (!account) {
      toast.error("Debes seleccionar una cuenta válida");
      return false;
    }

    if (!categoryId) {
      toast.error("Debes seleccionar una categoría");
      return false;
    }

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      userId: user.id,
      accountId,
      categoryId,
      type: "INGRESO",
      amount,
      date,
      description: description || null,
      destinationAccountId: null
    };

    // Atomic update in our mock
    setAllTransactions(prev => [newTx, ...prev]);
    updateAccount(account.id, account.name, account.type, account.balance + amount);
    
    toast.success("Ingreso registrado exitosamente");
    return true;
  };

  const createExpense = (accountId: string, categoryId: string, amount: number, date: string, description?: string) => {
    if (!user) return false;
    
    if (amount <= 0) {
      toast.error("El monto debe ser mayor a cero");
      return false;
    }

    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      toast.error("La fecha no puede ser posterior a la fecha actual");
      return false;
    }

    const account = accounts.find(a => a.id === accountId);
    if (!account) {
      toast.error("Debes seleccionar una cuenta válida");
      return false;
    }

    if (!categoryId) {
      toast.error("Debes seleccionar una categoría");
      return false;
    }

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      userId: user.id,
      accountId,
      categoryId,
      type: "EGRESO",
      amount,
      date,
      description: description || null,
      destinationAccountId: null
    };

    // Atomic update in our mock
    setAllTransactions(prev => [newTx, ...prev]);
    updateAccount(account.id, account.name, account.type, account.balance - amount);
    
    // Imputación al presupuesto activo (si aplica)
    addExpenseToBudget(date, categoryId, amount);

    toast.success("Gasto registrado exitosamente");
    return true;
  };

  return (
    <TransactionsContext.Provider value={{ transactions: userTransactions, createIncome, createExpense }}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionsProvider");
  }
  return context;
}
