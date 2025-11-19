import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import '../styles/dashboard.css'
import { notesQueries, togglePinNote } from '../services/noteService'
import { notebookQueries } from '../services/notebookService'
import { tagQueries } from '../services/tagService'
import type { NoteSummary } from '../types'
import type { CSSProperties } from 'react'
import { queryKeys } from '../lib/queryKeys'

const formatDate = (value?: string) => {
  if (!value) return 'Unknown date'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value))
}

const PREVIEW_MAX_CHARS = 140

const getNotePreview = (note: NoteSummary) => {
  const source = (note.contentPreview ?? note.content ?? '').trim()
  if (!source) {
    return 'No preview available.'
  }
  if (source.length <= PREVIEW_MAX_CHARS) {
    return source
  }
  return `${source.slice(0, PREVIEW_MAX_CHARS).trimEnd()}…`
}

const getTagStyle = (colorHex?: string | null): CSSProperties | undefined => {
  if (!colorHex) return undefined
  const normalized = colorHex.startsWith('#') ? colorHex.slice(1) : colorHex
  if (![3, 6].includes(normalized.length)) return undefined
  const hex =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized

  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  const textColor = luminance > 0.65 ? '#0f172a' : '#f8fafc'

  return {
    backgroundColor: colorHex,
    color: textColor
  }
}

const Dashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [sortBy, setSortBy] = useState<'updated_at,desc' | 'updated_at,asc'>('updated_at,desc')
  const [selectedNotebook, setSelectedNotebook] = useState<string | 'all'>('all')
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all')

  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery(notesQueries.list())

  const { data: notebookData } = useQuery(notebookQueries.list())
  const { data: tagData } = useQuery(tagQueries.list())
  const notebookOptions = useMemo(() => notebookData?.content ?? [], [notebookData])
  const tagOptions = useMemo(() => tagData?.content ?? [], [tagData])

  const notes = useMemo<NoteSummary[]>(() => data?.content ?? [], [data])

  const filteredNotes = useMemo(() => {
    let list = [...notes]

    if (selectedNotebook !== 'all') {
      list = list.filter((note) => note.notebookId === selectedNotebook)
    }

    if (selectedTag !== 'all') {
      list = list.filter((note) => note.tags.some((tag) => tag.id === selectedTag))
    }

    list.sort((a, b) => {
      const aTime = new Date(a.updatedAt).getTime()
      const bTime = new Date(b.updatedAt).getTime()
      return sortBy === 'updated_at,desc' ? bTime - aTime : aTime - bTime
    })

    return list
  }, [notes, selectedNotebook, selectedTag, sortBy])

  const pinMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) => togglePinNote(id, pinned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes })
    },
    onError: (error) => {
      console.error('Failed to toggle pin', error)
    }
  })

  const handleTogglePinned = (event: React.MouseEvent, note: NoteSummary) => {
    event.stopPropagation()
    pinMutation.mutate({ id: note.id, pinned: !note.pinned })
  }

  // Dashboard'a dönüldüğünde notes listesini refetch et
  useEffect(() => {
    const handleFocus = () => {
      refetch()
    }
    
    // Sayfa focus olduğunda refetch et
    window.addEventListener('focus', handleFocus)
    
    // Dashboard'a dönüldüğünde refetch et
    if (location.pathname === '/') {
      refetch()
    }
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [location.pathname, refetch])

  return (
    <section className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1>All Notes</h1>
          <p>{filteredNotes.length} notes</p>
        </div>
        <button type="button" className="dashboard__refresh" onClick={() => refetch()}>
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </button>
      </div>

      <div className="dashboard__filters">
        <div className="dashboard__chip" role="group" aria-label="Sort notes">
          <button
            type="button"
            className={sortBy === 'updated_at,desc' ? 'chip-option is-active' : 'chip-option'}
            onClick={() => setSortBy('updated_at,desc')}
          >
            <span className="material-symbols-outlined">swap_vert</span>
            Last Updated
          </button>
          <button
            type="button"
            className={sortBy === 'updated_at,asc' ? 'chip-option is-active' : 'chip-option'}
            onClick={() => setSortBy('updated_at,asc')}
          >
            Oldest
          </button>
        </div>

        <label className="dashboard__chip select">
          <span>Notebook</span>
          <select
            value={selectedNotebook}
            onChange={(event) => setSelectedNotebook(event.target.value as 'all' | string)}
          >
            <option value="all">All notebooks</option>
            {notebookOptions.map((nb) => (
              <option key={nb.id} value={nb.id}>
                {nb.name}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined">expand_more</span>
        </label>

        <label className="dashboard__chip select">
          <span>Tag</span>
          <select
            value={selectedTag}
            onChange={(event) => setSelectedTag(event.target.value as 'all' | string)}
          >
            <option value="all">All tags</option>
            {tagOptions.map((tag) => (
              <option key={tag.id} value={tag.id}>
                #{tag.name}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined">expand_more</span>
        </label>
      </div>

      {isLoading && <p className="dashboard__muted">Loading your notes…</p>}
      {isError && (
        <p className="dashboard__muted error">Notes could not be loaded. Try again.</p>
      )}

      {!isLoading && !isError && (
        <div className="dashboard__grid">
          {filteredNotes.length === 0 && !isLoading && !isError && (
            <div className="dashboard__empty">
              <span className="material-symbols-outlined">hourglass_empty</span>
              <p>No notes yet. Create your first note to get started.</p>
            </div>
          )}
          {filteredNotes.map((note) => (
            <article
              className="note-card"
              key={note.id}
              onClick={() => navigate(`/notes/${note.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="note-card__head">
                <p className="note-card__notebook">{note.notebookName ?? 'No notebook'}</p>
                <div className="note-card__head-actions">
                  <span>{formatDate(note.updatedAt)}</span>
                  <button
                    type="button"
                    className={
                      note.pinned ? 'note-card__pin is-active' : 'note-card__pin'
                    }
                    aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                    onClick={(event) => handleTogglePinned(event, note)}
                  >
                    <span className="material-symbols-outlined">star</span>
                  </button>
                </div>
              </div>
              <h3>{note.title}</h3>
              <p>{getNotePreview(note)}</p>
              <div className="note-card__meta">
                <span>Updated: {formatDate(note.updatedAt)}</span>
                <div className="note-card__tags">
                  {note.tags.map((tag) => (
                    <span className="note-card__tag" key={tag.id} style={getTagStyle(tag.colorHex)}>
                      #{tag.name}
                    </span>
                  ))}
                  {note.tags.length === 0 && (
                    <span className="note-card__tag muted">No tags</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default Dashboard

