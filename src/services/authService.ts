import { httpClient } from '../lib/httpClient'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface RegisterPayload {
  email: string
  password: string
}

export const login = async (payload: LoginPayload) => {
  const { data } = await httpClient.post<LoginResponse>('/auth/login', payload)
  return data
}

export const register = async (payload: RegisterPayload) => {
  const { data } = await httpClient.post('/v1/auth/register', payload)
  return data
}

export const logout = async () => {
  await httpClient.post('/auth/logout')
}

