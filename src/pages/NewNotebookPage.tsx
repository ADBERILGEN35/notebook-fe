import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import '../styles/notebook-form.css'
import { createNotebook, type CreateNotebookPayload } from '../services/notebookService'
import { queryKeys } from '../lib/queryKeys'

const NewNotebookPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (payload: CreateNotebookPayload) => createNotebook(payload),
    onSuccess: () => {
      setFeedback('Notebook created successfully.')
      queryClient.invalidateQueries({ queryKey: queryKeys.notebooks })
      setTimeout(() => {
        navigate('/notebooks')
      }, 1000)
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to create notebook. Please try again.'
      setFeedback(message)
    }
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setFeedback(null)
    if (!name.trim()) {
      setFeedback('Notebook name is required.')
      return
    }
    mutation.mutate({
      name: name.trim(),
      description: description.trim() || null
    })
  }

  return (
    <section className="notebook-form">
      <div className="notebook-form__crumbs">
        <span className="material-symbols-outlined">arrow_back</span>
        <Link to="/notebooks">Notebooks</Link>
        <span>/</span>
        <span>New Notebook</span>
      </div>

      <form className="notebook-form__layout" onSubmit={handleSubmit}>
        <div className="notebook-form__main">
          <input
            className="notebook-form__title"
            placeholder="Notebook Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <textarea
            className="notebook-form__description"
            placeholder="Add a description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={10}
          />
        </div>

        <aside className="notebook-form__sidebar">
          <div className="notebook-form__actions">
            <button
              type="button"
              className="ghost"
              onClick={() => {
                setName('')
                setDescription('')
                setFeedback(null)
                navigate('/notebooks')
              }}
            >
              Cancel
            </button>
            <button type="submit" className="primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating…' : 'Create Notebook'}
            </button>
          </div>

          {feedback && (
            <p className={`notebook-form__feedback ${mutation.isError ? 'error' : 'success'}`}>
              {feedback}
            </p>
          )}

          <div className="notebook-form__info">
            <p>Info</p>
            <div>
              <span>Notebooks help you organize your notes into groups.</span>
            </div>
            <div>
              <span>You can add notes to this notebook after creating it.</span>
            </div>
          </div>
        </aside>
      </form>
    </section>
  )
}

export default NewNotebookPage

