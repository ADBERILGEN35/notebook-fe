import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import '../styles/tags.css'
import { deleteTag, tagQueries, updateTag } from '../services/tagService'
import { queryKeys } from '../lib/queryKeys'
import { TAG_COLORS } from '../constants/tagColors'
import type { TagDetail, Tag } from '../types'

const TagsPage = () => {
  const navigate = useNavigate()
  const tagListQuery = useMemo(() => tagQueries.list(), [])
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    isError
  } = useQuery(tagListQuery)
  const tags = useMemo<Tag[]>(() => data?.content ?? [], [data])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()

  const tagIdParam = searchParams.get('tagId')

  useEffect(() => {
    if (tagIdParam && tagIdParam !== selectedId) {
      const exists = tags.some((tag) => tag.id === tagIdParam)
      if (exists) {
        setSelectedId(tagIdParam)
        return
      }
    }

    if (!selectedId && tags.length > 0) {
      const firstId = tags[0].id
      setSelectedId(firstId)
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev)
        params.set('tagId', firstId)
        return params
      })
    }
  }, [tags, selectedId, tagIdParam, setSearchParams])

  const {
    data: selectedTag,
    isLoading: detailLoading,
    isError: detailError
  } = useQuery(tagQueries.detail(selectedId ?? undefined))

  const [form, setForm] = useState<{
    name: string
    colorHex: string
    description: string
  }>({
    name: '',
    colorHex: TAG_COLORS[0],
    description: ''
  })
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const resetForm = (tag: TagDetail) => {
    setForm({
      name: tag.name,
      colorHex: tag.colorHex ?? TAG_COLORS[0],
      description: tag.description ?? ''
    })
    setFeedback(null)
  }

  useEffect(() => {
    if (selectedTag) {
      resetForm(selectedTag)
    }
  }, [selectedTag])

  const mutation = useMutation({
    mutationFn: async (payload: Partial<TagDetail>) => {
      if (!selectedId || !selectedTag) return
      return updateTag(selectedId, {
        name: payload.name ?? selectedTag.name,
        colorHex: payload.colorHex ?? selectedTag.colorHex,
        description: payload.description ?? selectedTag.description,
        version: selectedTag.version
      })
    },
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Tag updated successfully.' })
      queryClient.invalidateQueries({ queryKey: queryKeys.tags })
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Update failed. Please try again.'
      setFeedback({ type: 'error', message })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedId) return
      await deleteTag(selectedId)
    },
    onSuccess: () => {
      setFeedback({ type: 'success', message: 'Tag deleted successfully.' })
      queryClient.invalidateQueries({ queryKey: queryKeys.tags })
      setSelectedId(null)
      setShowDeleteConfirm(false)
      setTimeout(() => setFeedback(null), 2500)
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to delete tag.'
      setFeedback({ type: 'error', message })
    }
  })

  const handleChange = (field: 'name' | 'colorHex' | 'description', value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    mutation.mutate(form)
  }

  const filteredTags = useMemo(
    () =>
      tags.filter((tag) =>
        tag.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [tags, search]
  )

  return (
    <section className="tags">
      <div className="tags__panel">
        <header>
          <h1>Manage Tags</h1>
          <button type="button" onClick={() => navigate('/tags/new')}>
            <span className="material-symbols-outlined">add</span>
            Add New Tag
          </button>
        </header>

        <label className="tags__search">
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Find a tag..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        {isLoading && <p className="panel__muted">Loading tags…</p>}
        {isError && <p className="panel__muted">Unable to load tags.</p>}

        {!isLoading && !isError && (
          <ul className="tags__list">
            {filteredTags.map((tag) => (
              <li key={tag.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(tag.id)
                    setSearchParams((prev) => {
                      const params = new URLSearchParams(prev)
                      params.set('tagId', tag.id)
                      return params
                    })
                  }}
                  className={
                    tag.id === selectedId ? 'tags__list-item is-active' : 'tags__list-item'
                  }
                >
                  <span
                    className="tags__dot"
                    style={{ backgroundColor: tag.colorHex ?? '#475569' }}
                  />
                  <div>
                    <p>{tag.name}</p>
                    <small>{tag.noteCount ?? 0} notes</small>
                  </div>
                  <span className="material-symbols-outlined tags__edit">edit</span>
                </button>
              </li>
            ))}
            {filteredTags.length === 0 && (
              <li>
                <span className="panel__muted">No tags match your search.</span>
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="tags__detail">
        <header>
          <div>
            <h2>Edit Tag</h2>
            {selectedTag && (
              <p className="tags__detail-meta">
                {selectedTag.noteCount ?? 0} notes • Updated{' '}
                {selectedTag.updatedAt
                  ? new Date(selectedTag.updatedAt).toLocaleDateString()
                  : '—'}
              </p>
            )}
          </div>
        </header>

        {detailLoading && <p className="panel__muted">Loading tag…</p>}
        {detailError && <p className="panel__muted">Unable to load tag details.</p>}

        {!detailLoading && !detailError && selectedTag && (
          <form className="tag-form" onSubmit={handleSubmit}>
            <div className="tags__field">
              <label htmlFor="tagName">Tag Name</label>
              <input
                id="tagName"
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>

            <div className="tags__field">
              <label>Tag Color</label>
              <div className="tags__colors">
                {TAG_COLORS.map((hex) => (
                  <button
                    type="button"
                    key={hex}
                    className={hex === form.colorHex ? 'color-swatch is-selected' : 'color-swatch'}
                    style={{ backgroundColor: hex }}
                    onClick={() => handleChange('colorHex', hex)}
                  >
                    {hex === form.colorHex && (
                      <span className="material-symbols-outlined">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="tags__field">
              <label htmlFor="tagDescription">Description</label>
              <textarea
                id="tagDescription"
                rows={4}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>

            {feedback && (
              <p className={`tag-form__feedback is-${feedback.type}`}>{feedback.message}</p>
            )}

            <div className="tags__actions">
              <button
                type="button"
                className="tags__delete"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteMutation.isPending}
              >
                <span className="material-symbols-outlined">delete</span>
                {deleteMutation.isPending ? 'Deleting…' : 'Delete Tag'}
              </button>
              <div className="tags__actions-right">
                <button
                  type="button"
                  className="tags__cancel"
                  onClick={() => selectedTag && resetForm(selectedTag)}
                >
                  Cancel
                </button>
                <button type="submit" className="tags__save" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        )}

        {!detailLoading && !detailError && !selectedTag && (
          <p className="panel__muted">Select a tag from the list to edit.</p>
        )}

        {showDeleteConfirm && selectedTag && (
          <div className="app-modal-backdrop">
            <div className="app-modal">
              <h3>Delete tag?</h3>
              <p>
                “{selectedTag.name}” etiketi silinecek. Bu etikete bağlı notlar etiketsiz kalacak.
                Devam etmek istediğine emin misin?
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
      </div>
    </section>
  )
}

export default TagsPage

