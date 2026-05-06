import React, { useState } from "react";
import { useTransactions } from "../context/TransactionsContext";
import { useAccounts } from "../context/AccountsContext";
import { useCategories } from "../context/CategoriesContext";
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type TransactionFormValues = {
  type: "INGRESO" | "EGRESO";
  accountId: string;
  categoryId: string;
  amount: string;
  date: string;
  description: string;
};

export function Transactions() {
  const { transactions, createIncome, createExpense } = useTransactions();
  const { accounts } = useAccounts();
  const { categories, getCategoryName } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<TransactionFormValues>({
    defaultValues: {
      type: "EGRESO",
      date: new Date().toISOString().split('T')[0],
      accountId: "",
      categoryId: "",
      amount: "",
      description: ""
    }
  });

  const currentType = watch("type");
  const availableCategories = categories.filter(c => c.type === currentType || c.type === "AMBOS");

  const openModal = () => {
    reset({
      type: "EGRESO",
      date: new Date().toISOString().split('T')[0],
      accountId: "",
      categoryId: "",
      amount: "",
      description: ""
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onSubmit = async (data: TransactionFormValues) => {
    setIsSubmitting(true);
    try {
      let success = false;
      if (data.type === "INGRESO") {
        success = await createIncome(
          Number(data.accountId),
          Number(data.categoryId),
          Number(data.amount),
          data.date,
          data.description
        );
      } else {
        success = await createExpense(
          Number(data.accountId),
          Number(data.categoryId),
          Number(data.amount),
          data.date,
          data.description
        );
      }

      if (success) {
        closeModal();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transacciones</h1>
          <p className="mt-2 text-gray-600">Gestiona tus ingresos y gastos</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Transacción
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fecha</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Categoría</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cuenta</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Descripción</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Monto</th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No tienes transacciones registradas
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">{tx.date}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{getCategoryName(tx.categoryId)}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {accounts.find(a => a.id === tx.accountId)?.name || "Desconocida"}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{tx.description || "-"}</td>
                    <td className="px-6 py-3 text-sm font-semibold text-right text-gray-900">
                      ${tx.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-center">
                      {tx.type === 'INGRESO' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <ArrowUpCircle className="w-3 h-3 mr-1" />
                          Ingreso
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <ArrowDownCircle className="w-3 h-3 mr-1" />
                          Gasto
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">Nueva Transacción</h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="INGRESO"
                          {...register("type")}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Ingreso</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="EGRESO"
                          {...register("type")}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Gasto</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
                    <select
                      {...register("accountId", { required: "Selecciona una cuenta" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">-- Selecciona cuenta --</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name}
                        </option>
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
                      <option value="">-- Selecciona categoría --</option>
                      {availableCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      {...register("amount", { required: "El monto es obligatorio", pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Ingresa un monto válido" } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="0.00"
                    />
                    {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input
                      type="date"
                      {...register("date", { required: "La fecha es obligatoria" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                    <input
                      type="text"
                      {...register("description")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </form>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={handleSubmit(onSubmit)}
                  className="inline-flex w-full justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
                </button>
                <button
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:mt-0 sm:w-auto"
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
