import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import '../styles/tag-form.css'
import { createTag, type CreateTagPayload } from '../services/tagService'
import { TAG_COLORS } from '../constants/tagColors'
import { queryKeys } from '../lib/queryKeys'

const NewTagPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(TAG_COLORS[0])
  const [description, setDescription] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: CreateTagPayload) => createTag(payload),
    onSuccess: () => {
      setFeedback('Tag created successfully.')
      queryClient.invalidateQueries({ queryKey: queryKeys.tags })
      setTimeout(() => navigate('/tags'), 1000)
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create tag. Please try again.'
      setFeedback(message)
    }
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setFeedback(null)

    if (!name.trim()) {
      setFeedback('Tag name is required.')
      return
    }

    mutation.mutate({
      name: name.trim(),
      colorHex: color,
      description: description.trim() || null
    })
  }

  return (
    <section className="tag-form-page">
      <div className="tag-form-page__crumbs">
        <span className="material-symbols-outlined">arrow_back</span>
        <Link to="/tags">Tags</Link>
        <span>/</span>
        <span>New Tag</span>
      </div>

      <form className="tag-form-page__card" onSubmit={handleSubmit}>
        <div className="tag-form-page__header">
          <div>
            <h1>Create Tag</h1>
            <p>Tags let you categorize and filter notes easily.</p>
          </div>
          <div className="tag-form-page__actions">
            <button
              type="button"
              className="ghost"
              onClick={() => navigate('/tags')}
              disabled={mutation.isPending}
            >
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating…' : 'Create Tag'}
            </button>
          </div>
        </div>

        <div className="tag-form-page__grid">
          <div className="tag-form-page__main">
            <label>
              <span>Tag Name</span>
              <input
                type="text"
                placeholder="Enter a tag name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>

            <label>
              <span>Description</span>
              <textarea
                rows={6}
                placeholder="Add a short description (optional)…"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
          </div>

          <aside className="tag-form-page__sidebar">
            <p className="tag-form-page__sidebar-label">Choose a color</p>
            <div className="tag-form-page__colors">
              {TAG_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  className={hex === color ? 'swatch is-selected' : 'swatch'}
                  style={{ backgroundColor: hex }}
                  onClick={() => setColor(hex)}
                  disabled={mutation.isPending}
                >
                  {hex === color && <span className="material-symbols-outlined">check</span>}
                </button>
              ))}
            </div>

            <p className="tag-form-page__tip">
              Color coding makes it easier to scan your notes and spot important topics.
            </p>
          </aside>
        </div>

        {feedback && (
          <p className={`tag-form-page__feedback ${mutation.isError ? 'error' : 'success'}`}>
            {feedback}
          </p>
        )}
      </form>
    </section>
  )
}

export default NewTagPage


