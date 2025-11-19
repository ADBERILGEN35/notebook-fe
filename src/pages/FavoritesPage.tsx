import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import '../styles/dashboard.css'
import { notesQueries } from '../services/noteService'
import type { NoteSummary } from '../types'
import { formatRelative } from '../utils/dates'

const FavoritesPage = () => {
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useQuery(notesQueries.pinned({ size: 50 }))

  const notes = useMemo<NoteSummary[]>(() => data?.content ?? [], [data])

  return (
    <section className="dashboard">
      <div className="dashboard__header">
        <div>
          <h1>Favorites</h1>
          <p>{notes.length} pinned notes</p>
        </div>
        <button type="button" className="dashboard__refresh" onClick={() => refetch()}>
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </button>
      </div>

      {isLoading && <p className="dashboard__muted">Loading pinned notes…</p>}
      {isError && (
        <p className="dashboard__muted error">
          Favorites could not be loaded. Please try again later.
        </p>
      )}

      {!isLoading && !isError && notes.length === 0 && (
        <div className="dashboard__empty">
          <span className="material-symbols-outlined">star</span>
          <p>You haven’t pinned any notes yet.</p>
        </div>
      )}

      {!isLoading && !isError && notes.length > 0 && (
        <div className="dashboard__grid">
          {notes.map((note) => (
            <article
              className="note-card"
              key={note.id}
              onClick={() => navigate(`/notes/${note.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className="note-card__head">
                <p className="note-card__notebook">{note.notebookName ?? 'No notebook'}</p>
                <span>{formatRelative(note.updatedAt)}</span>
              </div>
              <h3>{note.title}</h3>
              <p>{note.contentPreview ?? 'No preview available.'}</p>
              <div className="note-card__meta">
                <span>Updated: {formatRelative(note.updatedAt)}</span>
                <div className="note-card__tags">
                  {note.tags.map((tag) => (
                    <span className="note-card__tag" key={tag.id}>
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

export default FavoritesPage


