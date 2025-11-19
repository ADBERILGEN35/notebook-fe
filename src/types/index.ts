export type UUID = string

export interface NoteSummary {
  id: UUID
  title: string
  content?: string | null
  contentPreview?: string | null
  pinned: boolean
  archived: boolean
  notebookId: UUID | null
  notebookName: string | null
  tags: Array<{ id: UUID; name: string; colorHex?: string | null }>
  createdAt?: string
  updatedAt: string
  version: number
}

export interface NoteDetail extends Omit<NoteSummary, 'content'> {
  content: string
  createdAt: string
}

export interface NotebookSummary {
  id: UUID
  name: string
  description?: string | null
  noteCount?: number
  updatedAt: string
  version: number
}

export interface NotebookDetail extends NotebookSummary {
  createdAt?: string
  notes?: NoteSummary[]
}

export interface Tag {
  id: UUID
  name: string
  colorHex?: string | null
  description?: string | null
  noteCount?: number
  updatedAt: string
  version: number
}

export interface TagDetail extends Tag {
  createdAt?: string
}

export interface UserSummary {
  id: UUID
  email: string
  roles: string[]
  enabled: boolean
  locked: boolean
  updatedAt: string
  version: number
}

export interface UserProfile extends UserSummary {
  accountNonExpired: boolean
  credentialsNonExpired: boolean
  createdAt: string
}

