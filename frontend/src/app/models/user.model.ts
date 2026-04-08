export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'medico' | 'enfermero';
  activo: boolean;
}

export interface CreateUserRequest {
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'medico' | 'enfermero';
}

export interface UpdateUserRequest {
  nombre?: string;
  email?: string;
  rol?: 'admin' | 'medico' | 'enfermero';
  activo?: boolean;
  password?: string;
}
