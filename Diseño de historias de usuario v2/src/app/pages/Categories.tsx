import React, { useState } from "react";
import { useCategories, CategoryType, Category } from "../context/CategoriesContext";
import { Plus, Edit2, Trash2, X, Tag, Briefcase, Utensils, Car, LayoutGrid, Home, ShoppingCart, Cpu, Book, Coffee, DollarSign, Activity } from "lucide-react";
import { useForm } from "react-hook-form";

type CategoryFormValues = {
  name: string;
  type: CategoryType;
  icon: string;
};

// Available icons to select
const ICONS = [
  { id: "briefcase", icon: Briefcase, name: "Trabajo" },
  { id: "utensils", icon: Utensils, name: "Comida" },
  { id: "car", icon: Car, name: "Transporte" },
  { id: "home", icon: Home, name: "Hogar" },
  { id: "shopping-cart", icon: ShoppingCart, name: "Compras" },
  { id: "book", icon: Book, name: "Educación" },
  { id: "coffee", icon: Coffee, name: "Ocio" },
  { id: "activity", icon: Activity, name: "Salud" },
  { id: "dollar-sign", icon: DollarSign, name: "Dinero" },
  { id: "layout-grid", icon: LayoutGrid, name: "Varios" },
];

export function Categories() {
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CategoryFormValues>();
  
  const selectedIcon = watch("icon") || "layout-grid";

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      reset({ name: category.name, type: category.type, icon: category.icon });
    } else {
      setEditingCategory(null);
      reset({ name: "", type: "EGRESO", icon: "layout-grid" });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const onSubmit = (data: CategoryFormValues) => {
    let success = false;
    if (editingCategory) {
      success = updateCategory(editingCategory.id, data.name, data.icon);
    } else {
      success = createCategory(data.name, data.type, data.icon);
    }
    if (success) {
      closeModal();
    }
  };

  const handleDelete = (category: Category) => {
    if (window.confirm(`¿Estás seguro que deseas eliminar la categoría "${category.name}"?`)) {
      deleteCategory(category.id);
    }
  };

  const getIconComponent = (iconId: string) => {
    const iconObj = ICONS.find(i => i.id === iconId);
    if (iconObj) {
      const IconComp = iconObj.icon;
      return <IconComp className="w-5 h-5 text-gray-500" />;
    }
    return <Tag className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-2 text-sm text-gray-600">Organiza tus ingresos y egresos por categoría.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                {getIconComponent(category.icon)}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openModal(category)}
                  className="p-1.5 text-gray-400 hover:text-emerald-600 rounded transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {category.origin !== "SISTEMA" && (
                  <button
                    onClick={() => handleDelete(category)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 truncate">{category.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  category.type === "INGRESO" ? "bg-emerald-100 text-emerald-800" :
                  category.type === "EGRESO" ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {category.type}
                </span>
                {category.origin === "SISTEMA" && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600">
                    SISTEMA
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal} />

            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    {editingCategory ? "Editar Categoría" : "Nueva Categoría"}
                  </h3>
                  <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form id="categoryForm" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input
                      type="text"
                      {...register("name", { required: "El nombre es obligatorio" })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Ej: Entretenimiento"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      {...register("type")}
                      disabled={!!editingCategory} // Only allow changing type on creation
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="INGRESO">Ingreso</option>
                      <option value="EGRESO">Egreso</option>
                      <option value="AMBOS">Ambos</option>
                    </select>
                    {editingCategory && <p className="text-xs text-gray-500 mt-1">El tipo de categoría no puede ser modificado.</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                    <div className="grid grid-cols-5 gap-2">
                      {ICONS.map((iconObj) => {
                        const IconComp = iconObj.icon;
                        const isSelected = selectedIcon === iconObj.id;
                        return (
                          <button
                            key={iconObj.id}
                            type="button"
                            onClick={() => setValue("icon", iconObj.id)}
                            className={`p-2 flex items-center justify-center rounded-lg border transition-colors ${
                              isSelected ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                            }`}
                            title={iconObj.name}
                          >
                            <IconComp className="w-5 h-5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </form>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="submit"
                  form="categoryForm"
                  className="inline-flex w-full justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 sm:ml-3 sm:w-auto"
                >
                  {editingCategory ? "Guardar" : "Crear"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
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
