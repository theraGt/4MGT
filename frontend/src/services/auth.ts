import { apiRequest } from './api'

export interface AuthUser {
  id: number
  email: string
  tipo_usuario: string
  activo: boolean
  verificado: boolean
}

export interface LoginResponse {
  message: string
  requires2FA: boolean
  token?: string
  user?: AuthUser
  userId?: number
  tipoUsuario?: string
}

export interface VerifyLoginResponse {
  message: string
  token: string
  user: AuthUser
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  verifyLogin: (id_usuario: number, token: string) =>
    apiRequest<VerifyLoginResponse>('/auth/verify-login', {
      method: 'POST',
      body: JSON.stringify({ id_usuario, token }),
    }),

  me: (token: string) =>
    apiRequest<{ success: boolean; user: AuthUser }>('/auth/me', {}, token),

  register: (data: { nombre: string; apellido: string; email: string; password: string; rol?: string; telefono?: string }) =>
    apiRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
}