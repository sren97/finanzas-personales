import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

export type AccountType = "EFECTIVO" | "BANCO" | "AHORRO" | "OTRO";

export type Account = {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  balance: number;
  active: boolean;
};

type AccountsContextType = {
  accounts: Account[];
  createAccount: (name: string, type: AccountType, initialBalance?: number) => void;
  updateAccount: (id: string, name: string, type: AccountType, balance?: number) => void;
  deleteAccount: (id: string) => boolean;
};

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [allAccounts, setAllAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem("app_accounts");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("app_accounts", JSON.stringify(allAccounts));
  }, [allAccounts]);

  const userAccounts = allAccounts.filter(
    (a) => a.userId === user?.id && a.active
  );

  const createAccount = (name: string, type: AccountType, initialBalance = 0) => {
    if (!user) return;
    const newAccount: Account = {
      id: crypto.randomUUID(),
      userId: user.id,
      name,
      type,
      balance: initialBalance,
      active: true,
    };
    setAllAccounts((prev) => [...prev, newAccount]);
    toast.success("Cuenta creada exitosamente");
  };

  const updateAccount = (id: string, name: string, type: AccountType, balance?: number) => {
    setAllAccounts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, name, type, balance: balance !== undefined ? balance : a.balance };
        }
        return a;
      })
    );
    // Don't show toast for balance updates to avoid spam when adding transactions
    if (balance === undefined) {
      toast.success("Cuenta actualizada");
    }
  };

  const deleteAccount = (id: string) => {
    const account = allAccounts.find((a) => a.id === id);
    if (!account) return false;

    // According to HU-04, we warn if balance > 0 (handled in UI)
    // Actually performing soft delete:
    setAllAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: false } : a))
    );
    toast.success("Cuenta eliminada");
    return true;
  };

  return (
    <AccountsContext.Provider
      value={{ accounts: userAccounts, createAccount, updateAccount, deleteAccount }}
    >
      {children}
    </AccountsContext.Provider>
  );
}

export function useAccounts() {
  const context = useContext(AccountsContext);
  if (context === undefined) {
    throw new Error("useAccounts must be used within an AccountsProvider");
  }
  return context;
}
