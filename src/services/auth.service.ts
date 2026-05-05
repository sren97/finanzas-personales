import { apiClient } from "./api";

export type LoginRequest = {
  correo: string;
  password: string;
};

export type RegisterRequest = {
  nombre: string;
  correo: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  tipo: string;
  usuarioId: number;
  nombre: string;
};

export type MessageResponse = {
  message: string;
};

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/login", {
      correo: email,
      password,
    });
  },

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>("/auth/register", {
      nombre: name,
      correo: email,
      password,
    });
  },

  async logout(): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>("/auth/logout", {});
  },
};
