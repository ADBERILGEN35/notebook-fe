import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import '../styles/notebooks.css'
import {
  deleteNotebook,
  notebookQueries,
  updateNotebook,
  type UpdateNotebookPayload
} from '../services/notebookService'
import { notesQueries } from '../services/noteService'
import { queryKeys } from '../lib/queryKeys'
import type { NotebookSummary, NoteSummary } from '../types'

const NotebooksPage = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const {
    data,
    isLoading,
    isError
  } = useQuery(notebookQueries.list())
  const notebooks = useMemo<NotebookSummary[]>(() => data?.content ?? [], [data])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const notebookIdParam = searchParams.get('notebookId')

  useEffect(() => {
    if (notebookIdParam && notebookIdParam !== selectedId) {
      const exists = notebooks.some((notebook) => notebook.id === notebookIdParam)
      if (exists) {
        setSelectedId(notebookIdParam)
        return
      }
    }

    if (!selectedId && notebooks.length > 0) {
      const firstId = notebooks[0].id
      setSelectedId(firstId)
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        params.set('notebookId', firstId)
        return params
      })
    }
  }, [notebooks, selectedId, notebookIdParam, setSearchParams])

  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailError
  } = useQuery(notebookQueries.detail(selectedId ?? undefined))

  const {
    data: recentNotesData,
    isLoading: recentNotesLoading,
    isError: recentNotesError
  } = useQuery(notesQueries.active({ size: 5 }))

  const recentNotes = useMemo<NoteSummary[]>(
    () => recentNotesData?.content ?? [],
    [recentNotesData]
  )

  const [isEditing, setIsEditing] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [descriptionInput, setDescriptionInput] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (detail) {
      setNameInput(detail.name)
      setDescriptionInput(detail.description ?? '')
    } else {
      setIsEditing(false)
    }
  }, [detail])

  const mutation = useMutation({
    mutationFn: async (payload: UpdateNotebookPayload) => {
      if (!selectedId) throw new Error('Notebook ID is required')
      return updateNotebook(selectedId, payload)
    },
    onSuccess: async () => {
      setFeedback({ type: 'success', message: 'Notebook updated successfully.' })
      setIsEditing(false)
      await queryClient.invalidateQueries({ queryKey: queryKeys.notebooks })
      if (selectedId) {
        await queryClient.invalidateQueries({
          queryKey: notebookQueries.detail(selectedId).queryKey
        })
      }
      setTimeout(() => setFeedback(null), 2500)
    },
    onError: (error: any) => {
      console.error('Update notebook error:', error)
      let message = 'Failed to update notebook. Please try again.'
      if (error.response) {
        message =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`
      } else if (error.request) {
        message = 'Network error: Could not reach the server.'
      } else if (error.message) {
        message = error.message
      }
      setFeedback({ type: 'error', message })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) return
      await deleteNotebook(selectedId)
    },
    onSuccess: async () => {
      setFeedback({ type: 'success', message: 'Notebook deleted.' })
      setShowDeleteConfirm(false)
      setSelectedId(null)
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        params.delete('notebookId')
        return params
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.notebooks })
    },
    onError: (error: any) => {
      console.error('Delete notebook error:', error)
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete notebook.'
      setFeedback({ type: 'error', message })
    }
  })

  const handleEditToggle = () => {
    if (!detail) return
    setIsEditing((prev) => !prev)
    setFeedback(null)
  }

  const handleDetailSave = (event: React.FormEvent) => {
    event.preventDefault()
    if (!detail || !nameInput.trim()) {
      setFeedback({ type: 'error', message: 'Name is required.' })
      return
    }

    mutation.mutate({
      name: nameInput.trim(),
      description: descriptionInput.trim() || null,
      version: detail.version
    })
  }

  const handleDetailCancel = () => {
    if (!detail) return
    setNameInput(detail.name)
    setDescriptionInput(detail.description ?? '')
    setIsEditing(false)
    setFeedback(null)
  }

  return (
    <section className="notebooks-layout">
      <div className="notebooks-layout__panel">
        <header className="panel__header">
          <h1>Notebooks</h1>
          <button type="button" onClick={() => navigate('/notebooks/new')}>
            <span className="material-symbols-outlined">add</span>
            New Notebook
          </button>
        </header>

        <label className="panel__search">
          <span className="material-symbols-outlined">search</span>
          <input type="text" placeholder="Filter notebooks..." disabled />
        </label>

        {isLoading && <p className="panel__muted">Loading notebooks…</p>}
        {isError && <p className="panel__muted">Unable to load notebooks.</p>}

        {!isLoading && !isError && (
          <ul className="notebook-list">
            {notebooks.map((notebook) => (
              <li key={notebook.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(notebook.id)
                    setSearchParams((prev) => {
                      const params = new URLSearchParams(prev)
                      params.set('notebookId', notebook.id)
                      return params
                    })
                  }}
                  className={
                    notebook.id === selectedId
                      ? 'notebook-list__item is-active'
                      : 'notebook-list__item'
                  }
                >
                  <div>
                    <span className="material-symbols-outlined">menu_book</span>
                    <div>
                      <p>{notebook.name}</p>
                      {notebook.description && (
                        <small>{notebook.description.slice(0, 60)}</small>
                      )}
                    </div>
                  </div>
                  <span>{notebook.noteCount ?? 0}</span>
                </button>
              </li>
            ))}
            {notebooks.length === 0 && (
              <li>
                <span className="panel__muted">No notebooks yet.</span>
              </li>
            )}
          </ul>
        )}
      </div>

      {detail ? (
        <div className="notebooks-layout__detail-grid">
          <div className="notebooks-card">
            <header className="detail__header">
              <div>
                <h2>{detail.name}</h2>
                <p className="detail__meta">
                  Last updated {detail.updatedAt ? new Date(detail.updatedAt).toLocaleString() : '—'}
                </p>
              </div>
              <div className="detail__actions">
                {feedback && (
                  <span className={`detail__feedback is-${feedback.type}`}>{feedback.message}</span>
                )}
                <button
                  type="button"
                  className="icon-button danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  title="Delete notebook"
                  disabled={deleteMutation.isPending}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={handleEditToggle}
                  title={isEditing ? 'Close editor' : 'Edit notebook'}
                  disabled={mutation.isPending}
                >
                  <span className="material-symbols-outlined">
                    {isEditing ? 'close' : 'edit'}
                  </span>
                </button>
              </div>
            </header>

            <div className="detail__body">
              {isEditing ? (
                <form className="detail__form" onSubmit={handleDetailSave}>
                  <label>
                    <span>Name</span>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(event) => setNameInput(event.target.value)}
                      disabled={mutation.isPending}
                    />
                  </label>
                  <label>
                    <span>Description</span>
                    <textarea
                      value={descriptionInput}
                      onChange={(event) => setDescriptionInput(event.target.value)}
                      rows={4}
                      disabled={mutation.isPending}
                    />
                  </label>
                  <div className="detail__form-actions">
                    <button type="button" className="ghost" onClick={handleDetailCancel} disabled={mutation.isPending}>
                      Cancel
                    </button>
                    <button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="detail__description">
                  {detail.description?.trim() || 'No description provided.'}
                </p>
              )}
              <div className="detail__stats">
                <div>
                  <span className="detail__stat-label">Notes</span>
                  <strong>{detail.notes?.length ?? detail.noteCount ?? 0}</strong>
                </div>
                <div>
                  <span className="detail__stat-label">Updated</span>
                  <strong>{new Date(detail.updatedAt).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="notebooks-card notebooks-card--recent">
            <h3>Recent notes</h3>
            {recentNotesLoading && <p className="panel__muted">Loading notes…</p>}
            {recentNotesError && (
              <p className="panel__muted">Unable to load recent notes.</p>
            )}
            {!recentNotesLoading && !recentNotesError && recentNotes.length === 0 && (
              <p className="panel__muted">No notes in this notebook yet.</p>
            )}
            {!recentNotesLoading && !recentNotesError && recentNotes.length > 0 && (
              <ul className="detail__notes-list">
                {recentNotes.map((note) => (
                  <li
                    key={note.id}
                    className="detail__notes-item"
                    onClick={() => navigate(`/notes/${note.id}`)}
                  >
                    <div>
                      <p className="detail__notes-title">{note.title}</p>
                      <small>{note.notebookName ?? '—'}</small>
                    </div>
                    <span>
                      {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        !detailLoading &&
        !detailError && (
          <div className="detail__empty">
            <div className="detail__icon">
              <span className="material-symbols-outlined">edit_note</span>
            </div>
            <h3>No notebook selected</h3>
            <p>Please pick a notebook from the left to view its content.</p>
          </div>
        )
      )}
      {showDeleteConfirm && detail && (
        <div className="app-modal-backdrop">
          <div className="app-modal">
            <h3>Delete notebook?</h3>
            <p>
              “{detail.name}” notebook’u silinecek. İçindeki notlar silinmez ancak bu notebook ile
              bağlantıları kaldırılır.
            </p>
            <div className="app-modal__actions">
              <button
                type="button"
                className="ghost"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default NotebooksPage
