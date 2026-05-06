import React, { useMemo, useState } from "react";
import { useTransactions } from "../context/TransactionsContext";
import { useAccounts } from "../context/AccountsContext";
import { useCategories } from "../context/CategoriesContext";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Filter, 
  Receipt, 
  SearchX, 
  X,
  Calendar,
  Wallet,
  Tags
} from "lucide-react";

export function Transactions() {
  const { transactions } = useTransactions();
  const { accounts } = useAccounts();
  const { categories, getCategoryName } = useCategories();

  // Estados para filtros
  const [filterType, setFilterType] = useState<"ALL" | "INGRESO" | "EGRESO">("ALL");
  const [filterAccountId, setFilterAccountId] = useState<string>("ALL");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("ALL");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        // Filtro por Tipo
        if (filterType !== "ALL" && tx.type !== filterType) return false;
        
        // Filtro por Cuenta
        if (filterAccountId !== "ALL" && tx.accountId !== filterAccountId) return false;
        
        // Filtro por Categoría
        if (filterCategoryId !== "ALL" && tx.categoryId !== filterCategoryId) return false;
        
        // Filtro por Rango de Fechas
        if (filterStartDate && tx.date < filterStartDate) return false;
        if (filterEndDate && tx.date > filterEndDate) return false;

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterAccountId, filterCategoryId, filterStartDate, filterEndDate]);

  const hasActiveFilters = filterType !== "ALL" || filterAccountId !== "ALL" || filterCategoryId !== "ALL" || filterStartDate !== "" || filterEndDate !== "";

  const clearFilters = () => {
    setFilterType("ALL");
    setFilterAccountId("ALL");
    setFilterCategoryId("ALL");
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : "Cuenta eliminada";
  };

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Receipt className="w-8 h-8 mr-3 text-emerald-600" />
          Historial de Transacciones
        </h1>
        <p className="mt-2 text-gray-600">
          Consulta y filtra todos tus movimientos financieros pasados.
        </p>
      </div>

      {/* Sección de Filtros */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-gray-500" />
            Filtros
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Filtro por Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border bg-white"
              >
                <option value="ALL">Todos</option>
                <option value="INGRESO">Ingresos</option>
                <option value="EGRESO">Gastos</option>
              </select>
            </div>
          </div>

          {/* Filtro por Cuenta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Wallet className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={filterAccountId}
                onChange={(e) => setFilterAccountId(e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border bg-white"
              >
                <option value="ALL">Todas las cuentas</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtro por Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tags className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border bg-white"
              >
                <option value="ALL">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filtro Fecha Desde */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border bg-white"
              />
            </div>
          </div>

          {/* Filtro Fecha Hasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm p-2.5 border bg-white"
              />
            </div>
          </div>
        </div>

        {/* Resumen de Filtros Activos (Chips) */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            {filterType !== "ALL" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                Tipo: {filterType === "INGRESO" ? "Ingresos" : "Gastos"}
                <button onClick={() => setFilterType("ALL")} className="ml-1.5 text-emerald-600 hover:text-emerald-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterAccountId !== "ALL" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Cuenta: {getAccountName(filterAccountId)}
                <button onClick={() => setFilterAccountId("ALL")} className="ml-1.5 text-blue-600 hover:text-blue-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterCategoryId !== "ALL" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Categoría: {getCategoryName(filterCategoryId)}
                <button onClick={() => setFilterCategoryId("ALL")} className="ml-1.5 text-purple-600 hover:text-purple-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterStartDate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Desde: {filterStartDate}
                <button onClick={() => setFilterStartDate("")} className="ml-1.5 text-gray-600 hover:text-gray-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filterEndDate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Hasta: {filterEndDate}
                <button onClick={() => setFilterEndDate("")} className="ml-1.5 text-gray-600 hover:text-gray-900">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Lista de Transacciones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {transactions.length === 0 ? (
          // Estado: Historial completamente vacío
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Aún no tienes transacciones registradas</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Tus ingresos y gastos aparecerán aquí una vez que los registres desde el Dashboard.
            </p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          // Estado: Filtros sin coincidencias
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <SearchX className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No se encontraron transacciones con los filtros aplicados</h3>
            <p className="text-gray-500 mb-4">
              Intenta cambiar o limpiar los filtros para ver otros resultados.
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Limpiar todos los filtros
            </button>
          </div>
        ) : (
          // Estado: Historial con transacciones
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transacción
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuenta
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
                          {tx.type === "INGRESO" ? (
                            <ArrowUpCircle className="h-6 w-6 text-emerald-600" />
                          ) : (
                            <ArrowDownCircle className="h-6 w-6 text-red-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {tx.description || (tx.type === "INGRESO" ? "Ingreso" : "Gasto")}
                          </div>
                          <div className="text-sm text-gray-500">
                            {tx.type === "INGRESO" ? "Ingreso" : "Egreso"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {tx.categoryId ? getCategoryName(tx.categoryId) : "Sin categoría"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getAccountName(tx.accountId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {tx.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <span className={tx.type === "INGRESO" ? "text-emerald-600" : "text-red-600"}>
                        {tx.type === "INGRESO" ? "+" : "-"}${tx.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}