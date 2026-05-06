import { apiClient } from "./api";

export type CategoriaResponse = {
  id: number;
  nombre: string;
  tipo: "INGRESO" | "EGRESO" | "AMBOS";
  icono: string;
  activo: boolean;
};

export type CategoriaRequest = {
  nombre: string;
  tipo: "INGRESO" | "EGRESO" | "AMBOS";
  icono?: string;
};

export const categoriesService = {
  async listCategories(): Promise<CategoriaResponse[]> {
    return apiClient.get<CategoriaResponse[]>("/categorias");
  },

  async createCategory(data: CategoriaRequest): Promise<CategoriaResponse> {
    return apiClient.post<CategoriaResponse>("/categorias", {
      nombre: data.nombre,
      tipo: data.tipo,
      icono: data.icono || "tag",
    });
  },

  async updateCategory(
    id: number,
    data: CategoriaRequest
  ): Promise<CategoriaResponse> {
    return apiClient.put<CategoriaResponse>(`/categorias/${id}`, {
      nombre: data.nombre,
      tipo: data.tipo,
      icono: data.icono,
    });
  },

  async deleteCategory(id: number): Promise<void> {
    await apiClient.delete<void>(`/categorias/${id}`);
  },
};
