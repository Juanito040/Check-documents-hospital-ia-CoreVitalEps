export interface ApiResponse<T> {
  data?: T;
  message?: string;
  detail?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface SystemStats {
  total_usuarios: number;
  total_documentos: number;
  total_consultas: number;
  modelos_disponibles: string[];
}
