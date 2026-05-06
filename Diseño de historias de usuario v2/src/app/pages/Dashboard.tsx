import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAccounts } from "../context/AccountsContext";
import { useCategories } from "../context/CategoriesContext";
import { useTransactions } from "../context/TransactionsContext";
import { useBudgets } from "../context/BudgetsContext";
import { ArrowRight, Wallet, ArrowUpCircle, ArrowDownCircle, X, PieChart } from "lucide-react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";

type TransactionFormValues = {
  type: "INGRESO" | "EGRESO";
  accountId: string;
  categoryId: string;
  amount: number;
  date: string;
  description: string;
};

export function Dashboard() {
  const { user } = useAuth();
  const { accounts } = useAccounts();
  const { categories, getCategoryName } = useCategories();
  const { createIncome, createExpense, transactions } = useTransactions();
  const { activeBudget } = useBudgets();
  
  const [txModal, setTxModal] = useState<{isOpen: boolean, type: "INGRESO" | "EGRESO"}>({
    isOpen: false,
    type: "INGRESO"
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<TransactionFormValues>({
    defaultValues: {
      type: "INGRESO",
      date: new Date().toISOString().split('T')[0]
    }
  });

  const currentTxType = watch("type");

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  // Filter for valid categories based on selected type
  const availableCategories = categories.filter(c => c.type === currentTxType || c.type === "AMBOS");
  const recentTransactions = transactions.slice(0, 5);

  const openTxModal = (type: "INGRESO" | "EGRESO") => {
    setTxModal({ isOpen: true, type });
    reset({ 
      type, 
      date: new Date().toISOString().split('T')[0],
      amount: undefined,
      accountId: "",
      categoryId: "",
      description: ""
    });
  };

  const closeTxModal = () => {
    setTxModal({ ...txModal, isOpen: false });
  };

  const onSubmitTransaction = (data: TransactionFormValues) => {
    let success = false;
    if (data.type === "INGRESO") {
      success = createIncome(
        data.accountId,
        data.categoryId,
        Number(data.amount),
        data.date,
        data.description
      );
    } else {
      success = createExpense(
        data.accountId,
        data.categoryId,
        Number(data.amount),
        data.date,
        data.description
      );
    }

    if (success) {
      closeTxModal();
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hola, {user?.name}</h1>
          <p className="mt-2 text-gray-600">Bienvenido a tu resumen financiero.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => openTxModal("EGRESO")}
            className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowDownCircle className="w-5 h-5 mr-2 text-red-500" />
            Nuevo Gasto
          </button>
          <button
            onClick={() => openTxModal("INGRESO")}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition-colors"
          >
            <ArrowUpCircle className="w-5 h-5 mr-2" />
            Nuevo Ingreso
          </button>
        </div>
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

        {activeBudget && (
          <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-3 rounded-md bg-blue-100 mr-4">
                  <PieChart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Presupuesto Mensual Activo</h2>
                  <p className="text-xl font-semibold text-gray-900">
                    ${activeBudget.globalSpent.toLocaleString()} / ${activeBudget.globalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div 
                className={`h-2.5 rounded-full ${
                  activeBudget.globalSpent > activeBudget.globalAmount ? "bg-red-500" : 
                  activeBudget.globalSpent > activeBudget.globalAmount * 0.8 ? "bg-amber-500" : "bg-blue-600"
                }`} 
                style={{ width: `${Math.min((activeBudget.globalSpent / activeBudget.globalAmount) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 text-right">
              {Math.round((activeBudget.globalSpent / activeBudget.globalAmount) * 100)}% consumido
            </p>
          </div>
        )}
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

      <div className="mt-8 bg-white shadow-sm rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Transacciones Recientes</h2>
        {recentTransactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No tienes transacciones registradas.</p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{tx.categoryId ? getCategoryName(tx.categoryId) : "Desconocido"}</span>
                  <span className="text-xs text-gray-500">{tx.date} • {tx.description || "Sin descripción"}</span>
                </div>
                <span className={`text-sm font-semibold ${tx.type === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {tx.type === 'INGRESO' ? '+' : '-'}${tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Nueva Transacción */}
      {txModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeTxModal} />

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900 flex items-center">
                    {currentTxType === "INGRESO" ? (
                      <ArrowUpCircle className="w-5 h-5 text-emerald-600 mr-2" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    {currentTxType === "INGRESO" ? "Registrar Ingreso" : "Registrar Gasto"}
                  </h3>
                  <button onClick={closeTxModal} className="text-gray-400 hover:text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form id="txForm" onSubmit={handleSubmit(onSubmitTransaction)} className="space-y-4">
                  {/* Tipo Toggle */}
                  <div className="flex rounded-md shadow-sm" role="group">
                    <button
                      type="button"
                      onClick={() => {
                        setValue("type", "INGRESO");
                        setValue("categoryId", ""); // Reset category on type change
                      }}
                      className={`flex-1 px-4 py-2 text-sm font-medium border rounded-l-lg transition-colors ${
                        currentTxType === "INGRESO"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 z-10"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Ingreso
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setValue("type", "EGRESO");
                        setValue("categoryId", ""); // Reset category on type change
                      }}
                      className={`flex-1 px-4 py-2 text-sm font-medium border-t border-b border-r rounded-r-lg transition-colors ${
                        currentTxType === "EGRESO"
                          ? "bg-red-50 text-red-700 border-red-200 z-10"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Gasto
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register("amount", { 
                        required: "El monto es obligatorio",
                        min: { value: 0.01, message: "El monto debe ser mayor a 0" }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-lg font-semibold"
                      placeholder="0.00"
                    />
                    {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
                    <select
                      {...register("accountId", { required: "Selecciona una cuenta" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Selecciona una cuenta</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} (${acc.balance})</option>
                      ))}
                    </select>
                    {errors.accountId && <p className="mt-1 text-xs text-red-600">{errors.accountId.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      {...register("categoryId", { required: "Selecciona una categoría" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">Selecciona una categoría</option>
                      {availableCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                    {availableCategories.length === 0 && (
                      <p className="mt-1 text-xs text-amber-600">No tienes categorías para este tipo de transacción.</p>
                    )}
                    {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      {...register("date", { required: "La fecha es obligatoria" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
                    <input
                      type="text"
                      {...register("description")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder={currentTxType === "INGRESO" ? "Ej: Salario quincenal" : "Ej: Compra de supermercado"}
                    />
                  </div>
                </form>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  form="txForm"
                  className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                    currentTxType === "INGRESO" 
                      ? "bg-emerald-600 hover:bg-emerald-500" 
                      : "bg-red-600 hover:bg-red-500"
                  }`}
                >
                  Guardar {currentTxType === "INGRESO" ? "Ingreso" : "Gasto"}
                </button>
                <button
                  type="button"
                  onClick={closeTxModal}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
