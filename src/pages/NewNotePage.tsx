import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import '../styles/note-form.css'
import { notebookQueries } from '../services/notebookService'
import { tagQueries } from '../services/tagService'
import { createNote } from '../services/noteService'
import { queryKeys } from '../lib/queryKeys'

const NewNotePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedNotebook, setSelectedNotebook] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [feedback, setFeedback] = useState<string | null>(null)

  const { data: notebookData, isLoading: notebooksLoading } = useQuery(
    notebookQueries.list()
  )
  const { data: tagData, isLoading: tagsLoading } = useQuery(
    tagQueries.list()
  )

  const notebooks = useMemo(() => notebookData?.content ?? [], [notebookData])
  const tags = useMemo(() => tagData?.content ?? [], [tagData])

  useEffect(() => {
    if (!selectedNotebook && notebooks.length > 0) {
      setSelectedNotebook(notebooks[0].id)
    }
  }, [notebooks, selectedNotebook])

  const mutation = useMutation({
    mutationFn: () =>
      createNote({
        title,
        content,
        notebookId: selectedNotebook || null,
        tagIds: selectedTags
      }),
    onSuccess: async () => {
      setFeedback('Note saved successfully.')
      queryClient.invalidateQueries({ queryKey: queryKeys.notes })
      queryClient.invalidateQueries({ queryKey: queryKeys.tags })
      setTitle('')
      setContent('')
      setSelectedTags([])
      navigate('/')
    },
    onError: () => {
      setFeedback('Failed to save note. Try again.')
    }
  })

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setFeedback(null)
    mutation.mutate()
  }

  return (
    <section className="note-editor">
      <div className="note-editor__crumbs">
        <span className="material-symbols-outlined">arrow_back</span>
        <Link to="/">All Notes</Link>
        <span>/</span>
        <span>New Note</span>
      </div>

      <form className="note-editor__layout" onSubmit={handleSubmit}>
        <div className="note-editor__main">
          <input
            className="note-editor__title"
            placeholder="Untitled note"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Start writing your note here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <aside className="note-editor__sidebar">
          <div className="note-editor__actions">
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setTitle('')
                setContent('')
                setSelectedTags([])
                setFeedback(null)
              }}
            >
              Clear
            </button>
            <button type="submit" className="primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>

          <div className="note-editor__field">
            <label htmlFor="notebook">Notebook</label>
            <div className="note-editor__select">
              <select
                id="notebook"
                value={selectedNotebook}
                onChange={(e) => setSelectedNotebook(e.target.value)}
                disabled={notebooksLoading}
              >
                {notebooks.map((notebook) => (
                  <option key={notebook.id} value={notebook.id}>
                    {notebook.name}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined">expand_more</span>
            </div>
          </div>

          <div className="note-editor__field">
            <label>Tags</label>
            <div className="note-editor__tags">
              {tagsLoading && <span className="note-editor__muted">Loading tags…</span>}
              {!tagsLoading &&
                tags.map((tag) => (
                  <button
                    type="button"
                    key={tag.id}
                    className={selectedTags.includes(tag.id) ? 'tag-chip is-active' : 'tag-chip'}
                    onClick={() => toggleTag(tag.id)}
                  >
                    #{tag.name}
                  </button>
                ))}
              {!tagsLoading && tags.length === 0 && (
                <span className="note-editor__muted">No tags available.</span>
              )}
            </div>
          </div>

          {feedback && <p className="note-editor__feedback">{feedback}</p>}
        </aside>
      </form>
    </section>
  )
}

export default NewNotePage

