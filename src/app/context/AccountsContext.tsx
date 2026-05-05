import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { accountsService, AccountType, CuentaResponse } from "../../services/accounts.service";

export type Account = {
  id: number;
  name: string;
  type: AccountType;
  balance: number;
  active: boolean;
};

type AccountsContextType = {
  accounts: Account[];
  loading: boolean;
  createAccount: (name: string, type: AccountType, initialBalance?: number) => Promise<void>;
  updateAccount: (id: number, name: string, type: AccountType, balance?: number) => Promise<void>;
  deleteAccount: (id: number) => Promise<boolean>;
  refreshAccounts: () => Promise<void>;
};

const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

function mapCuentaToAccount(cuenta: CuentaResponse): Account {
  return {
    id: cuenta.id,
    name: cuenta.nombre,
    type: cuenta.tipo,
    balance: cuenta.saldo,
    active: cuenta.activo,
  };
}

export function AccountsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAccounts = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const cuentas = await accountsService.listAccounts();
      setAccounts(cuentas.map(mapCuentaToAccount));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al cargar cuentas";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [user?.id]);

  const createAccount = async (
    name: string,
    type: AccountType,
    initialBalance = 0
  ) => {
    try {
      const newCuenta = await accountsService.createAccount({
        nombre: name,
        tipo: type,
        saldo: initialBalance,
      });
      setAccounts((prev) => [...prev, mapCuentaToAccount(newCuenta)]);
      toast.success("Cuenta creada exitosamente");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al crear cuenta";
      toast.error(errorMessage);
    }
  };

  const updateAccount = async (
    id: number,
    name: string,
    type: AccountType,
    balance?: number
  ) => {
    try {
      const updated = await accountsService.updateAccount(id, {
        nombre: name,
        tipo: type,
        saldo: balance,
      });
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? mapCuentaToAccount(updated) : a))
      );
      toast.success("Cuenta actualizada");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al actualizar cuenta";
      toast.error(errorMessage);
    }
  };

  const deleteAccount = async (id: number) => {
    try {
      // Verificar si requiere confirmación (si tiene saldo)
      const state = await accountsService.getDeleteState(id);
      if (state.requiereConfirmacion && state.saldo > 0) {
        if (
          !window.confirm(
            `Esta cuenta tiene un saldo de $${state.saldo.toLocaleString()}. ¿Estás seguro que deseas eliminarla?`
          )
        ) {
          return false;
        }
      }

      await accountsService.deleteAccount(id);
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      toast.success("Cuenta eliminada");
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar cuenta";
      toast.error(errorMessage);
      return false;
    }
  };

  const refreshAccounts = async () => {
    await loadAccounts();
  };

  return (
    <AccountsContext.Provider
      value={{
        accounts,
        loading,
        createAccount,
        updateAccount,
        deleteAccount,
        refreshAccounts,
      }}
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
