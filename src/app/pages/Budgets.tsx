import React, { useState } from "react";
import { useBudgets } from "../context/BudgetsContext";
import { useCategories } from "../context/CategoriesContext";
import { Plus, Edit2, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";

type BudgetFormValues = {
  name: string;
  amount: string;
  categoryId: string;
  startDate: string;
  period: "MENSUAL" | "TRIMESTRAL" | "ANUAL";
};

export function Budgets() {
  const { budgets, createBudget, updateBudget, activateBudget, deleteBudget } = useBudgets();
  const { categories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isActivating, setIsActivating] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BudgetFormValues>({
    defaultValues: {
      name: "",
      amount: "",
      categoryId: "",
      startDate: new Date().toISOString().split('T')[0],
      period: "MENSUAL"
    }
  });

  const openModal = (budget?: typeof budgets[0]) => {
    if (budget) {
      setEditingId(budget.id);
      reset({
        name: budget.name,
        amount: budget.amount.toString(),
        categoryId: budget.categoryId.toString(),
        startDate: budget.startDate,
        period: budget.period
      });
    } else {
      setEditingId(null);
      reset({
        name: "",
        amount: "",
        categoryId: "",
        startDate: new Date().toISOString().split('T')[0],
        period: "MENSUAL"
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const onSubmit = async (data: BudgetFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateBudget(editingId, data.name, Number(data.amount), Number(data.categoryId), data.startDate, data.period);
      } else {
        await createBudget(data.name, Number(data.amount), Number(data.categoryId), data.startDate, data.period);
      }
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await deleteBudget(id);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleActivate = async (id: number) => {
    setIsActivating(id);
    try {
      await activateBudget(id);
    } finally {
      setIsActivating(null);
    }
  };

  const getCategoryName = (id: number) => {
    return categories.find(c => c.id === id)?.name || "Desconocida";
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Presupuestos</h1>
          <p className="mt-2 text-gray-600">Planifica y controla tus gastos</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Presupuesto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">No tienes presupuestos. Crea uno para empezar.</p>
          </div>
        ) : (
          budgets.map((budget) => (
            <div key={budget.id} className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow ${
              budget.status === 'ACTIVO' 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-white border-gray-100'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                    {budget.status === 'ACTIVO' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Activo
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{getCategoryName(budget.categoryId)}</p>
                </div>
                <div className="flex gap-2">
                  {budget.status === 'BORRADOR' && (
                    <button
                      onClick={() => handleActivate(budget.id)}
                      disabled={isActivating === budget.id}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Activar presupuesto"
                    >
                      {isActivating === budget.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => openModal(budget)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    disabled={isDeleting === budget.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting === budget.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">Límite</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ${(budget.amount || 0).toLocaleString()}
                    </span>
                                    <p className="text-xs text-gray-500">{budget.period}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  {editingId ? "Editar Presupuesto" : "Nuevo Presupuesto"}
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      {...register("name", { required: "El nombre es obligatorio" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ej: Presupuesto mensual"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      {...register("categoryId", { required: "Selecciona una categoría" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="">-- Selecciona categoría --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto Límite</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                    <input
                      type="date"
                      {...register("startDate", { required: "La fecha es obligatoria" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                    <select
                      {...register("period", { required: "Selecciona un período" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="MENSUAL">Mensual</option>
                      <option value="TRIMESTRAL">Trimestral</option>
                      <option value="ANUAL">Anual</option>
                    </select>
                    {errors.period && <p className="mt-1 text-xs text-red-600">{errors.period.message}</p>}
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
