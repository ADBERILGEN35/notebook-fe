import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import '../styles/note-detail.css'
import { deleteNote, notesQueries, updateNote, type UpdateNotePayload } from '../services/noteService'
import { notebookQueries } from '../services/notebookService'
import { tagQueries } from '../services/tagService'
import { queryKeys } from '../lib/queryKeys'

const NoteDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedNotebook, setSelectedNotebook] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const {
    data: note,
    isLoading: noteLoading,
    isError: noteError
  } = useQuery(notesQueries.detail(id))

  const { data: notebookData } = useQuery(notebookQueries.list())
  const { data: tagData } = useQuery(tagQueries.list())

  const notebooks = useMemo(() => notebookData?.content ?? [], [notebookData])
  const tags = useMemo(() => tagData?.content ?? [], [tagData])

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setSelectedNotebook(note.notebookId || '')
      setSelectedTags(note.tags.map((t) => t.id))
    }
  }, [note])

  const mutation = useMutation({
    mutationFn: (payload: UpdateNotePayload) => {
      if (!id) throw new Error('Note ID is required')
      return updateNote(id, payload)
    },
    onSuccess: async (updatedNote) => {
      setFeedback('Note updated successfully.')
      
      // 1. Detail cache'i güncelle
      queryClient.setQueryData(notesQueries.detail(id).queryKey, updatedNote)
      
      // 2. Invalidate + Refetch (hem aktif hem inaktif)
      await queryClient.invalidateQueries({ queryKey: ['notes'] })
      await queryClient.refetchQueries({ queryKey: ['notes'], type: 'all' })
      await queryClient.invalidateQueries({ queryKey: queryKeys.tags })
      
      setIsEditing(false)
      setTimeout(() => setFeedback(null), 2000)
    },
    onError: (error: any) => {
      console.error('Update note error:', error)
      let message = 'Failed to update note. Please try again.'
      
      if (error.response) {
        message =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status} ${error.response.statusText}`
      } else if (error.request) {
        message = 'Network error: Could not reach the server. Please check your connection.'
      } else {
        message = error.message || message
      }
      
      setFeedback(message)
    }
  })

  const handleSave = () => {
    if (!note) return
    setFeedback(null)
    mutation.mutate({
      title: title.trim(),
      content: content.trim(),
      notebookId: selectedNotebook || null,
      tagIds: selectedTags,
      pinned: note.pinned,
      archived: note.archived,
      version: note.version
    })
  }

  const handleCancel = () => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
      setSelectedNotebook(note.notebookId || '')
      setSelectedTags(note.tags.map((t) => t.id))
    }
    setIsEditing(false)
    setFeedback(null)
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Note ID is required')
      await deleteNote(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notes })
      queryClient.invalidateQueries({ queryKey: queryKeys.tags })
      setShowDeleteConfirm(false)
      navigate('/')
    },
    onError: (error: any) => {
      console.error('Delete note error:', error)
      setFeedback(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'Failed to delete note.'
      )
    }
  })

  if (noteLoading) {
    return (
      <section className="note-detail">
        <p className="note-detail__muted">Loading note…</p>
      </section>
    )
  }

  if (noteError || !note) {
    return (
      <section className="note-detail">
        <p className="note-detail__muted error">Note not found or could not be loaded.</p>
        <Link to="/" className="note-detail__back-link">
          ← Back to Notes
        </Link>
      </section>
    )
  }

  return (
    <section className="note-detail">
      <div className="note-detail__crumbs">
        <span className="material-symbols-outlined">arrow_back</span>
        <Link to="/">All Notes</Link>
        <span>/</span>
        <span>{note.title}</span>
      </div>

      <div className="note-detail__header">
        <div className="note-detail__header-left">
          {isEditing ? (
            <input
              className="note-detail__title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note Title"
            />
          ) : (
            <h1 className="note-detail__title">{note.title}</h1>
          )}
          <div className="note-detail__meta">
            <span>Notebook: {note.notebookName ?? 'No notebook'}</span>
            <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="note-detail__actions">
          <button
            type="button"
            className="note-detail__button danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleteMutation.isPending}
          >
            <span className="material-symbols-outlined">delete</span>
            Delete
          </button>
          {isEditing ? (
            <>
              <button type="button" className="note-detail__button ghost" onClick={handleCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="note-detail__button primary"
                onClick={handleSave}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="note-detail__button icon"
              onClick={() => setIsEditing(true)}
              aria-label="Edit note"
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className={`note-detail__feedback ${mutation.isError ? 'error' : 'success'}`}>
          {feedback}
        </div>
      )}

      <div className="note-detail__layout">
        <div className="note-detail__main">
          {isEditing ? (
            <textarea
              className="note-detail__content-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note here..."
            />
          ) : (
            <div className="note-detail__content">
              {note.content || <em>No content</em>}
            </div>
          )}
        </div>

        {isEditing && (
          <aside className="note-detail__sidebar">
            <div className="note-detail__field">
              <label htmlFor="notebook">Notebook</label>
              <div className="note-detail__select">
                <select
                  id="notebook"
                  value={selectedNotebook}
                  onChange={(e) => setSelectedNotebook(e.target.value)}
                >
                  <option value="">No notebook</option>
                  {notebooks.map((nb) => (
                    <option key={nb.id} value={nb.id}>
                      {nb.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>

            <div className="note-detail__field">
              <label>Tags</label>
              <div className="note-detail__tags">
                {tags.map((tag) => (
                  <button
                    type="button"
                    key={tag.id}
                    className={
                      selectedTags.includes(tag.id) ? 'note-detail__tag is-active' : 'note-detail__tag'
                    }
                    onClick={() => toggleTag(tag.id)}
                  >
                    #{tag.name}
                  </button>
                ))}
                {tags.length === 0 && (
                  <span className="note-detail__muted">No tags available.</span>
                )}
              </div>
            </div>
          </aside>
        )}

        {!isEditing && (
          <aside className="note-detail__sidebar">
            <div className="note-detail__info">
              <p>Details</p>
              <div>
                <span>Created:</span>
                <strong>{new Date(note.createdAt).toLocaleDateString()}</strong>
              </div>
              <div>
                <span>Updated:</span>
                <strong>{new Date(note.updatedAt).toLocaleDateString()}</strong>
              </div>
              <div>
                <span>Tags:</span>
                <div className="note-detail__tags-display">
                  {note.tags.length > 0 ? (
                    note.tags.map((tag) => (
                      <span key={tag.id} className="note-detail__tag-display">
                        #{tag.name}
                      </span>
                    ))
                  ) : (
                    <span>No tags</span>
                  )}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
      {showDeleteConfirm && (
        <div className="app-modal-backdrop">
          <div className="app-modal">
            <h3>Delete note?</h3>
            <p>This action cannot be undone. The note “{note.title}” will be permanently removed.</p>
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

export default NoteDetailPage