import { apiClient } from "./api";

export type TransaccionResponse = {
  id: number;
  usuarioId: number;
  tipo: "INGRESO" | "EGRESO";
  cuentaId: number;
  categoriaId: number;
  monto: number;
  fecha: string;
  descripcion: string;
  saldoCuenta: number;
  activo?: boolean;
};

export type TransaccionRequest = {
  tipo: "INGRESO" | "EGRESO";
  cuentaId: number;
  categoriaId: number;
  monto: number;
  fecha: string;
  descripcion?: string;
};

function toIsoDateTime(fecha: string): string {
  // Convert YYYY-MM-DD from date inputs to full ISO datetime.
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return `${fecha}T00:00:00.000Z`;
  }
  return fecha;
}

export const transactionsService = {
  async listTransactions(): Promise<TransaccionResponse[]> {
    return apiClient.get<TransaccionResponse[]>("/transacciones");
  },

  async createTransaction(
    data: TransaccionRequest
  ): Promise<TransaccionResponse> {
    return apiClient.post<TransaccionResponse>("/transacciones", {
      tipo: data.tipo,
      cuentaId: data.cuentaId,
      categoriaId: data.categoriaId,
      monto: data.monto,
      fecha: toIsoDateTime(data.fecha),
      descripcion: data.descripcion || "",
    });
  },
};
