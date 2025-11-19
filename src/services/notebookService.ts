import { httpClient } from '../lib/httpClient'
import { queryKeys } from '../lib/queryKeys'
import { NotebookDetail, NotebookSummary, UUID } from '../types'
import { PageResponse } from '../types/pagination'

export interface NotebookListParams {
  page?: number
  size?: number
}

export const fetchNotebooks = async (params?: NotebookListParams) => {
  const { data } = await httpClient.get<PageResponse<NotebookSummary>>(
    '/v1/notebooks',
    { params }
  )
  return data
}

export const fetchNotebook = async (id: UUID) => {
  const { data } = await httpClient.get<NotebookDetail>(`/v1/notebooks/${id}`)
  return data
}

export interface CreateNotebookPayload {
  name: string
  description?: string | null
}

export const createNotebook = async (payload: CreateNotebookPayload) => {
  const { data } = await httpClient.post<NotebookDetail>('/v1/notebooks', payload)
  return data
}

export const deleteNotebook = async (id: UUID) => {
  await httpClient.delete(`/v1/notebooks/${id}`)
}

export interface UpdateNotebookPayload {
  name: string
  description?: string | null
  version?: number
}

export const updateNotebook = async (id: UUID, payload: UpdateNotebookPayload) => {
  const { version, ...body } = payload

  const config: { headers?: Record<string, string> } = {}

  if (version !== undefined && version !== null) {
    config.headers = {
      ...(config.headers ?? {}),
      'If-Match': `"${version}"`
    }
  }

  const { data } = await httpClient.put<NotebookDetail>(`/v1/notebooks/${id}`, body, config)
  return data
}

export const notebookQueries = {
  list: (params?: NotebookListParams) => ({
    queryKey: [...queryKeys.notebooks, params ?? {}],
    queryFn: () => fetchNotebooks(params),
    staleTime: 1000 * 60
  }),
  detail: (id?: UUID) => ({
    queryKey: [...queryKeys.notebooks, 'detail', id],
    queryFn: () => fetchNotebook(id!),
    enabled: Boolean(id)
  })
}

