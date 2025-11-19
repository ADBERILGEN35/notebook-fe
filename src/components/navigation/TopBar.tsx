import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import '../../styles/topbar.css'
import useOutsideClick from '../../hooks/useOutsideClick'
import { useNoteSearch } from '../../hooks/useNoteSearch'
import type { NoteSummary, UserProfile } from '../../types'
import { formatRelative } from '../../utils/dates'
import { changePassword, userQueries } from '../../services/userService'

const avatarUrl =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDV7ZsHu4U75QXwF2UZYwQKyB_jbSKvo09HnGXrB4qWYjLiF5JLrux0-8CjP6NsyvD3WicpbZcusoZ_taibNdslfEwnWLCr0IOWL1Vshy17zhkP6ORyngDRhI6X1nP5MPEByRYI1seOtjkz2Qzb8yT0LlFxXZGco52Qd0fqDEZE04J7oxExuXhfGz19otKSx6xkvo8cG7jJn_qxXDqBIt9jDVsECvTqh8sOimAQiRzoRsH6f3oC5KzPyKj_C-9JlsjSYwq1T0JsITE'

const TopBar = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  useOutsideClick(searchContainerRef, () => setIsFocused(false))
  const queryClient = useQueryClient()

  const { query: searchQuery, setSearchParams } = useNoteSearch(query)

  const results = useMemo<NoteSummary[]>(() => searchQuery.data?.content ?? [], [searchQuery.data])

  const { data: profile, isLoading: profileLoading } = useQuery({
    ...userQueries.me(),
    enabled: isProfileOpen
  })

  const [profileForm, setProfileForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (profile) {
      setProfileForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }, [profile])

  const profileMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setProfileFeedback('Password updated successfully.')
      setProfileForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setTimeout(() => setProfileFeedback(null), 2500)
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update password.'
      setProfileFeedback(message)
    }
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setIsFocused(false)
  }

  const handleResultClick = (noteId: string) => {
    navigate(`/notes/${noteId}`)
    setIsFocused(false)
  }

  return (
    <header className="topnav">
      <div className="topnav__brand">
        <span className="material-symbols-outlined topnav__brand-icon">
          description
        </span>
        <p>NotesApp</p>
      </div>

      <div className="topnav__search-wrapper" ref={searchContainerRef}>
        <form className="topnav__search" onSubmit={handleSubmit}>
          <span className="material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search all notes..."
            aria-label="Search notes"
            value={query}
            onFocus={() => setIsFocused(true)}
            onChange={(event) => {
              setQuery(event.target.value)
              setSearchParams((prev) => ({ ...prev, q: event.target.value }))
            }}
          />
          {query && (
            <button
              type="button"
              className="topnav__search-clear"
              onClick={() => {
                setQuery('')
                setSearchParams((prev) => ({ ...prev, q: '' }))
              }}
              aria-label="Clear search"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </form>

        {isFocused && query.trim().length > 0 && (
          <div className="topnav__search-results">
            {searchQuery.isLoading && <p className="topnav__search-state">Searching…</p>}
            {searchQuery.isError && (
              <p className="topnav__search-state error">Could not search notes. Try again.</p>
            )}
            {!searchQuery.isLoading && !searchQuery.isError && results.length === 0 && (
              <p className="topnav__search-state">No matching notes found.</p>
            )}
            {!searchQuery.isLoading && !searchQuery.isError && results.length > 0 && (
              <ul>
                {results.map((note) => (
                  <li key={note.id} onClick={() => handleResultClick(note.id)}>
                    <div>
                      <p className="topnav__result-title">{note.title}</p>
                      <small>{note.notebookName ?? 'No notebook'}</small>
                    </div>
                    <span>{formatRelative(note.updatedAt)}</span>
                  </li>
                ))}
                {searchQuery.data?.totalElements && searchQuery.data.totalElements > results.length && (
                  <li className="topnav__search-more">
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/search?q=${encodeURIComponent(query.trim())}`)
                        setIsFocused(false)
                      }}
                    >
                      View all results
                    </button>
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="topnav__actions">
        <button
          type="button"
          className="topnav__button topnav__button--primary"
          onClick={() => navigate('/notes/new')}
        >
          <span className="material-symbols-outlined">add</span>
          New Note
        </button>
        <button type="button" className="topnav__button topnav__button--ghost" aria-label="Notifications">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button
          type="button"
          className="topnav__avatar"
          style={{ backgroundImage: `url(${avatarUrl})` }}
          onClick={() => setIsProfileOpen(true)}
          aria-label="Open profile settings"
        />
      </div>

      {isProfileOpen && (
        <div className="app-modal-backdrop">
          <div className="app-modal profile-modal">
            <div className="profile-modal__header">
              <div>
                <h3>Profile</h3>
                {profile && (
                  <p>
                    Member since {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="profile-modal__close"
                onClick={() => setIsProfileOpen(false)}
                aria-label="Close profile dialog"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {profileLoading && <p>Loading profile…</p>}
            {!profileLoading && !profile && (
              <p className="profile-modal__error">Profile could not be loaded.</p>
            )}

            {profile && (
              <form
                className="profile-modal__form"
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!profileForm.currentPassword || !profileForm.newPassword) {
                    setProfileFeedback('Please enter your current and new password.')
                    return
                  }
                  if (profileForm.newPassword !== profileForm.confirmPassword) {
                    setProfileFeedback('New passwords do not match.')
                    return
                  }
                  profileMutation.mutate({
                    oldPassword: profileForm.currentPassword,
                    newPassword: profileForm.newPassword
                  })
                }}
              >
                <label className="profile-modal__field">
                  <span>Email</span>
                  <input type="email" value={profile.email} readOnly />
                </label>

                <label className="profile-modal__field">
                  <span>Status</span>
                  <div className="profile-modal__status">
                    <span className={profile.enabled ? 'profile-badge success' : 'profile-badge error'}>
                      {profile.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    <span className={profile.locked ? 'profile-badge error' : 'profile-badge'}>
                      {profile.locked ? 'Locked' : 'Unlocked'}
                    </span>
                  </div>
                </label>

                <label className="profile-modal__field">
                  <span>Current password</span>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                    }
                    placeholder="Enter current password"
                  />
                </label>

                <label className="profile-modal__field">
                  <span>New password</span>
                  <input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, newPassword: event.target.value }))
                    }
                    placeholder="Enter new password"
                  />
                </label>

                <label className="profile-modal__field">
                  <span>Confirm new password</span>
                  <input
                    type="password"
                    value={profileForm.confirmPassword}
                    onChange={(event) =>
                      setProfileForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                    }
                    placeholder="Re-enter new password"
                  />
                </label>

                {profileFeedback && (
                  <p className="profile-modal__feedback">{profileFeedback}</p>
                )}

                <div className="app-modal__actions">
                  <button type="button" className="ghost" onClick={() => setIsProfileOpen(false)}>
                    Close
                  </button>
                  <button type="submit" disabled={profileMutation.isPending}>
                    {profileMutation.isPending ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default TopBar

