import { apiClient } from "./api";

export type PresupuestoResponse = {
  id: number;
  nombre: string;
  monto: number;
  categoriaId: number;
  fechaInicio: string;
  periodo: "MENSUAL" | "TRIMESTRAL" | "ANUAL";
  estado: "BORRADOR" | "ACTIVO";
  activo: boolean;
};

export type PresupuestoRequest = {
  nombre: string;
  monto: number;
  categoriaId: number;
  fechaInicio: string;
  periodo: "MENSUAL" | "TRIMESTRAL" | "ANUAL";
};

export const budgetsService = {
  async listBudgets(): Promise<PresupuestoResponse[]> {
    return apiClient.get<PresupuestoResponse[]>("/presupuestos");
  },

  async createBudget(
    data: PresupuestoRequest
  ): Promise<PresupuestoResponse> {
    return apiClient.post<PresupuestoResponse>("/presupuestos", {
      nombre: data.nombre,
      monto: data.monto,
      categoriaId: data.categoriaId,
      fechaInicio: data.fechaInicio,
      periodo: data.periodo,
    });
  },

  async updateBudget(
    id: number,
    data: PresupuestoRequest
  ): Promise<PresupuestoResponse> {
    return apiClient.put<PresupuestoResponse>(`/presupuestos/${id}`, {
      nombre: data.nombre,
      monto: data.monto,
      categoriaId: data.categoriaId,
      fechaInicio: data.fechaInicio,
      periodo: data.periodo,
    });
  },

  async activateBudget(id: number): Promise<PresupuestoResponse> {
    return apiClient.put<PresupuestoResponse>(`/presupuestos/${id}/activar`, {});
  },

  async getBudgetById(id: number): Promise<PresupuestoResponse> {
    return apiClient.get<PresupuestoResponse>(`/presupuestos/${id}`);
  },
};
