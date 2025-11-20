import { httpClient } from '../lib/httpClient'
import { queryKeys } from '../lib/queryKeys'
import { NoteDetail, NoteSummary, UUID } from '../types'
import { PageResponse } from '../types/pagination'

export interface NoteListParams {
  page?: number
  size?: number
  notebookId?: UUID
  pinned?: boolean
  archived?: boolean
  tagIds?: UUID[]
  query?: string
  sort?: string
  updatedFrom?: string
  updatedTo?: string
}

export interface CreateNotePayload {
  title: string
  content: string
  notebookId?: UUID | null
  tagIds?: UUID[]
  pinned?: boolean
  archived?: boolean
}

export const fetchNotes = async (params?: NoteListParams) => {
  const { data } = await httpClient.get<PageResponse<NoteSummary>>('/v1/notes', {
    params
  })
  return data
}

export interface SearchNotesPayload {
  q?: string
  notebookId?: UUID
  pinned?: boolean
  archived?: boolean
  tagIds?: UUID[]
  updatedFrom?: string
  updatedTo?: string
  page?: number
  size?: number
  sort?: 'updated_at,asc' | 'updated_at,desc'
}

export const searchNotes = async (payload: SearchNotesPayload) => {
  const { data } = await httpClient.post<PageResponse<NoteSummary>>('/v1/notes/search', payload)
  return data
}

export const fetchActiveNotes = async (params?: Pick<NoteListParams, 'page' | 'size'>) => {
  const { data } = await httpClient.get<PageResponse<NoteSummary>>('/v1/notes/active', {
    params
  })
  return data
}

export const fetchPinnedNotes = async (params?: Pick<NoteListParams, 'page' | 'size'>) => {
  const { data } = await httpClient.get<PageResponse<NoteSummary>>('/v1/notes/pinned', {
    params
  })
  return data
}

export const fetchNote = async (id: UUID) => {
  const { data } = await httpClient.get<NoteDetail>(`/v1/notes/${id}`)
  return data
}

export const createNote = async (payload: CreateNotePayload) => {
  const { data } = await httpClient.post<NoteDetail>('/v1/notes', payload)
  return data
}

export interface UpdateNotePayload {
  title: string
  content: string
  notebookId?: UUID | null
  tagIds?: UUID[]
  pinned?: boolean
  archived?: boolean
  version?: number
}

export const updateNote = async (id: UUID, payload: UpdateNotePayload) => {
  const { version, ...body } = payload
  
  const config: { headers?: Record<string, string> } = {
    headers: {}
  }
  
  if (version !== undefined && version !== null) {
    config.headers!['If-Match'] = `"${version}"`
  }
  
  console.log('Updating note:', { 
    id, 
    url: `/v1/notes/${id}`,
    body, 
    headers: config.headers 
  })
  
  try {
    const { data } = await httpClient.put<NoteDetail>(`/v1/notes/${id}`, body, config)
    console.log('Note updated successfully:', data)
    return data
  } catch (error: any) {
    console.error('Update note request failed:', {
      url: `/v1/notes/${id}`,
      body,
      headers: config.headers,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      errorMessage: error.message,
      hasResponse: !!error.response,
      hasRequest: !!error.request
    })
    throw error
  }
}

export const togglePinNote = async (id: UUID, pinned: boolean) => {
  const detail = await fetchNote(id)
  return updateNote(id, {
    title: detail.title,
    content: detail.content,
    notebookId: detail.notebookId,
    tagIds: detail.tags.map((tag) => tag.id),
    pinned,
    archived: detail.archived,
    version: detail.version
  })
}

export const deleteNote = async (id: UUID) => {
  await httpClient.delete(`/v1/notes/${id}`)
}

export const notesQueries = {
  list: (params?: NoteListParams) => ({
    queryKey: [...queryKeys.notes, params ?? {}],
    queryFn: () => fetchNotes(params)
  }),
  active: (params?: Pick<NoteListParams, 'page' | 'size'>) => ({
    queryKey: [...queryKeys.notes, 'active', params ?? {}],
    queryFn: () => fetchActiveNotes(params)
  }),
  pinned: (params?: Pick<NoteListParams, 'page' | 'size'>) => ({
    queryKey: [...queryKeys.notes, 'pinned', params ?? {}],
    queryFn: () => fetchPinnedNotes(params)
  }),
  detail: (id?: UUID) => ({
    queryKey: [...queryKeys.notes, 'detail', id],
    queryFn: () => fetchNote(id!),
    enabled: Boolean(id)
  }),
  search: (payload?: SearchNotesPayload) => ({
    queryKey: [...queryKeys.notes, 'search', payload ?? {}],
    queryFn: () => searchNotes(payload ?? {}),
    enabled: Boolean(payload?.q && payload.q.trim().length >= 3)
  })
}

