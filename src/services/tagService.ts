import { httpClient } from '../lib/httpClient'
import { queryKeys } from '../lib/queryKeys'
import { Tag, TagDetail, UUID } from '../types'
import { PageResponse } from '../types/pagination'

export interface TagListParams {
  page?: number
  size?: number
}

export interface UpdateTagPayload {
  name: string
  colorHex?: string | null
  description?: string | null
  version?: number | null
}

export interface CreateTagPayload {
  name: string
  colorHex?: string | null
  description?: string | null
}

export const fetchTags = async (params?: TagListParams) => {
  const { data } = await httpClient.get<PageResponse<Tag>>('/v1/tags', { params })
  return data
}

export const fetchTag = async (id: UUID) => {
  const { data } = await httpClient.get<TagDetail>(`/v1/tags/${id}`)
  return data
}

export const updateTag = async (id: UUID, payload: UpdateTagPayload) => {
  const headers =
    payload.version !== undefined && payload.version !== null
      ? { 'If-Match': `"${payload.version}"` }
      : undefined
  const { data } = await httpClient.put<TagDetail>(`/v1/tags/${id}`, payload, {
    headers
  })
  return data
}

export const createTag = async (payload: CreateTagPayload) => {
  const { data } = await httpClient.post<TagDetail>('/v1/tags', payload)
  return data
}

export const deleteTag = async (id: UUID) => {
  await httpClient.delete(`/v1/tags/${id}`)
}

export const tagQueries = {
  list: (params?: TagListParams) => ({
    queryKey: [...queryKeys.tags, params ?? {}],
    queryFn: () => fetchTags(params),
    staleTime: 1000 * 60
  }),
  detail: (id?: UUID) => ({
    queryKey: [...queryKeys.tags, 'detail', id],
    queryFn: () => fetchTag(id!),
    enabled: Boolean(id)
  })
}

