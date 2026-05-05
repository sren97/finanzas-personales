import { apiClient } from "./api";

export type AccountType = "EFECTIVO" | "BANCO" | "AHORRO" | "OTRO";

export type CuentaResponse = {
  id: number;
  nombre: string;
  tipo: AccountType;
  saldo: number;
  activo: boolean;
};

export type CuentaRequest = {
  nombre: string;
  tipo: AccountType;
  saldo?: number;
};

export type EstadoEliminacionCuentaResponse = {
  requiereConfirmacion: boolean;
  saldo: number;
};

export const accountsService = {
  async listAccounts(): Promise<CuentaResponse[]> {
    return apiClient.get<CuentaResponse[]>("/cuentas");
  },

  async createAccount(data: CuentaRequest): Promise<CuentaResponse> {
    return apiClient.post<CuentaResponse>("/cuentas", {
      nombre: data.nombre,
      tipo: data.tipo,
      saldo: data.saldo || 0,
    });
  },

  async updateAccount(
    id: number,
    data: CuentaRequest
  ): Promise<CuentaResponse> {
    return apiClient.put<CuentaResponse>(`/cuentas/${id}`, {
      nombre: data.nombre,
      tipo: data.tipo,
      saldo: data.saldo,
    });
  },

  async deleteAccount(id: number): Promise<void> {
    await apiClient.delete<void>(`/cuentas/${id}`);
  },

  async getDeleteState(id: number): Promise<EstadoEliminacionCuentaResponse> {
    return apiClient.get<EstadoEliminacionCuentaResponse>(
      `/cuentas/${id}/estado-eliminacion`
    );
  },
};
