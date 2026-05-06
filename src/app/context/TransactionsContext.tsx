import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { transactionsService, TransaccionResponse } from "../../services/transactions.service";

export type Transaction = {
  id: number;
  type: "INGRESO" | "EGRESO";
  accountId: number;
  categoryId: number;
  amount: number;
  date: string;
  description: string;
  active: boolean;
};

type TransactionsContextType = {
  transactions: Transaction[];
  loading: boolean;
  createIncome: (accountId: number, categoryId: number, amount: number, date: string, description?: string) => Promise<boolean>;
  createExpense: (accountId: number, categoryId: number, amount: number, date: string, description?: string) => Promise<boolean>;
  refreshTransactions: () => Promise<void>;
};

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

function mapTransaccionToTransaction(txn: TransaccionResponse): Transaction {
  return {
    id: txn.id,
    type: txn.tipo,
    accountId: txn.cuentaId,
    categoryId: txn.categoriaId,
    amount: txn.monto,
    date: txn.fecha,
    description: txn.descripcion || "",
    active: txn.activo ?? true,
  };
}

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTransactions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const txns = await transactionsService.listTransactions();
      setTransactions(txns.map(mapTransaccionToTransaction));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al cargar transacciones";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setTransactions([]);
    }
  }, [user]);

  const createIncome = async (
    accountId: number,
    categoryId: number,
    amount: number,
    date: string,
    description?: string
  ): Promise<boolean> => {
    try {
      const newTxn = await transactionsService.createTransaction({
        tipo: "INGRESO",
        cuentaId: accountId,
        categoriaId: categoryId,
        monto: amount,
        fecha: date,
        descripcion: description,
      });
      setTransactions((prev) => [mapTransaccionToTransaction(newTxn), ...prev]);
      toast.success("Ingreso registrado");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al registrar ingreso";
      toast.error(errorMessage);
      return false;
    }
  };

  const createExpense = async (
    accountId: number,
    categoryId: number,
    amount: number,
    date: string,
    description?: string
  ): Promise<boolean> => {
    try {
      const newTxn = await transactionsService.createTransaction({
        tipo: "EGRESO",
        cuentaId: accountId,
        categoriaId: categoryId,
        monto: amount,
        fecha: date,
        descripcion: description,
      });
      setTransactions((prev) => [mapTransaccionToTransaction(newTxn), ...prev]);
      toast.success("Gasto registrado");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al registrar gasto";
      toast.error(errorMessage);
      return false;
    }
  };

  const refreshTransactions = async () => {
    await loadTransactions();
  };

  return (
    <TransactionsContext.Provider
      value={{
        transactions,
        loading,
        createIncome,
        createExpense,
        refreshTransactions,
      }}
    >
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
