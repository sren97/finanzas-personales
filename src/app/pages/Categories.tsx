import React, { useState } from "react";
import { useCategories } from "../context/CategoriesContext";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Icon } from '@iconify/react';

function getIconifyName(name: string) {
  const map: Record<string, string> = {
    tag: 'material-symbols:shoppingmode-outline',
    shopping: 'material-symbols:shopping-bag-outline',
    utensils: 'material-symbols:restaurant-rounded',
    home: 'material-symbols:home-outline',
    car: 'material-symbols:directions-car-outline',
    briefcase: 'material-symbols:work-outline-sharp',
    heart: 'material-symbols:health-and-safety-outline',
    book: 'material-symbols:book-2-outline',
    music: 'material-symbols:music-note',
    gift: 'material-symbols:featured-seasonal-and-gifts',
  };
  return map[name] || 'material-symbols:shoppingmode-outline';
}

type CategoryFormValues = {
  name: string;
  type: "INGRESO" | "EGRESO" | "AMBOS";
  icon: string;
};

export function Categories() {
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
      type: "AMBOS",
      icon: "tag"
    }
  });

  const openModal = (category?: typeof categories[0]) => {
    if (category) {
      setEditingId(category.id);
      reset({
        name: category.name,
        type: category.type,
        icon: category.icon
      });
    } else {
      setEditingId(null);
      reset({
        name: "",
        type: "AMBOS",
        icon: "tag"
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const onSubmit = async (data: CategoryFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateCategory(editingId, data.name, data.type, data.icon);
      } else {
        await createCategory(data.name, data.type, data.icon);
      }
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await deleteCategory(id);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-2 text-gray-600">Gestiona las categorías de tus transacciones</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">No tienes categorías. Crea una para empezar.</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {category.type}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(category)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={isDeleting === category.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting === category.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon icon={getIconifyName(category.icon)} width={24} height={24} aria-hidden />
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
                  {editingId ? "Editar Categoría" : "Nueva Categoría"}
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      {...register("name", { required: "El nombre es obligatorio" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ej: Comida, Transporte, etc."
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      {...register("type")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="INGRESO">Ingreso</option>
                      <option value="EGRESO">Gasto</option>
                      <option value="AMBOS">Ambos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                    <select
                      {...register("icon")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="tag">Etiqueta</option>
                      <option value="shopping">Compras</option>
                      <option value="utensils">Comida</option>
                      <option value="home">Casa</option>
                      <option value="car">Auto</option>
                      <option value="briefcase">Trabajo</option>
                      <option value="heart">Salud</option>
                      <option value="book">Educación</option>
                      <option value="music">Entretenimiento</option>
                      <option value="gift">Regalos</option>
                    </select>
                    <div className="mt-2 flex items-center gap-2">
                      <Icon icon={getIconifyName((watch && watch('icon')) || 'tag')} width={24} height={24} aria-hidden />
                    </div>
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
