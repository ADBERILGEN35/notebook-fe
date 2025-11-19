import { httpClient } from '../lib/httpClient'
import { queryKeys } from '../lib/queryKeys'
import { UserProfile, UserSummary } from '../types'
import { PageResponse } from '../types/pagination'

export const fetchUsers = async (params?: {
  page?: number
  size?: number
  q?: string
}) => {
  const { data } = await httpClient.post<PageResponse<UserSummary>>(
    '/v1/users/search',
    params ?? {}
  )
  return data
}

export const fetchCurrentUser = async () => {
  const { data } = await httpClient.get<UserProfile>('/v1/users/me')
  return data
}

export interface UpdateCurrentUserPayload {
  password?: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export const changePassword = async (payload: ChangePasswordPayload) => {
  await httpClient.post('/v1/users/me/change-password', payload)
}

export const userQueries = {
  list: (params?: { page?: number; size?: number; q?: string }) => ({
    queryKey: queryKeys.users,
    queryFn: () => fetchUsers(params)
  }),
  me: () => ({
    queryKey: [...queryKeys.users, 'me'],
    queryFn: fetchCurrentUser
  })
}

