import React from "react";
import { useAuth } from "../context/AuthContext";
import { useAccounts } from "../context/AccountsContext";
import { ArrowRight, Wallet } from "lucide-react";
import { Link } from "react-router";

export function Dashboard() {
  const { user } = useAuth();
  const { accounts } = useAccounts();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Hola, {user?.name}</h1>
        <p className="mt-2 text-gray-600">Bienvenido a tu resumen financiero.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-md bg-emerald-100">
              <Wallet className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500 truncate">Balance Total</h2>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                ${totalBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Tus Cuentas</h2>
          <Link to="/accounts" className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center">
            Gestionar <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        {accounts.length === 0 ? (
          <p className="text-gray-500 text-sm">No tienes cuentas activas.</p>
        ) : (
          <div className="space-y-3">
            {accounts.slice(0, 3).map((account) => (
              <div key={account.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{account.name}</span>
                  <span className="text-xs text-gray-500">{account.type}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">${account.balance.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
