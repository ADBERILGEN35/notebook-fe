import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import '../styles/dashboard.css'
import { notesQueries } from '../services/noteService'
import type { NoteSummary } from '../types'
import type { CSSProperties } from 'react'

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

const SearchResultsPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const searchPayload = useMemo(
    () => ({
      q: query.trim(),
      size: 50,
      sort: 'updated_at,desc' as const
    }),
    [query]
  )

  const {
    data,
    isLoading,
    isError
  } = useQuery({
    ...notesQueries.search(searchPayload),
    enabled: Boolean(query.trim().length > 0)
  })

  const results = useMemo<NoteSummary[]>(() => data?.content ?? [], [data])
  const totalResults = data?.totalElements ?? 0

  return (
    <section className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1>Search Results</h1>
          {query && (
            <p>
              {isLoading
                ? 'Searching…'
                : isError
                  ? 'Search failed'
                  : totalResults === 0
                    ? 'No results found'
                    : `${totalResults} result${totalResults === 1 ? '' : 's'} for "${query}"`}
            </p>
          )}
        </div>
      </div>

      {!query.trim() && (
        <div className="dashboard__empty">
          <span className="material-symbols-outlined">search_off</span>
          <p>Please enter a search query.</p>
        </div>
      )}

      {query.trim() && isLoading && (
        <p className="dashboard__muted">Searching for "{query}"…</p>
      )}

      {query.trim() && isError && (
        <div className="dashboard__empty">
          <span className="material-symbols-outlined">error_outline</span>
          <p>Could not search notes. Please try again.</p>
        </div>
      )}

      {query.trim() && !isLoading && !isError && totalResults === 0 && (
        <div className="dashboard__empty">
          <span className="material-symbols-outlined">search_off</span>
          <p>No matching notes found for "{query}".</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'rgba(148, 163, 184, 0.7)' }}>
            Try a different search term or check your spelling.
          </p>
        </div>
      )}

      {query.trim() && !isLoading && !isError && results.length > 0 && (
        <div className="dashboard__grid">
          {results.map((note) => (
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
                  {note.pinned && (
                    <span className="material-symbols-outlined" style={{ color: '#facc15', fontSize: '1.2rem' }}>
                      star
                    </span>
                  )}
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

export default SearchResultsPage

