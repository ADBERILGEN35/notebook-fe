import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { NavLink, useNavigate } from 'react-router-dom'
import '../../styles/sidebar.css'
import { notebookQueries } from '../../services/notebookService'
import { tagQueries } from '../../services/tagService'
import { logout } from '../../services/authService'

const Sidebar = () => {
  const [notebookOpen, setNotebookOpen] = useState(true)
  const [tagsOpen, setTagsOpen] = useState(true)
  const navigate = useNavigate()

  const {
    data: notebookPage,
    isLoading: notebooksLoading,
    isError: notebooksError
  } = useQuery(notebookQueries.list())

  const {
    data: tagPage,
    isLoading: tagsLoading,
    isError: tagsError
  } = useQuery(tagQueries.list())

  const notebookOptions = useMemo(() => notebookPage?.content ?? [], [notebookPage])
  const tagOptions = useMemo(() => tagPage?.content ?? [], [tagPage])

  const handleLogout = async () => {
    try {
      await logout()
    } finally {
      localStorage.removeItem('accessToken')
      navigate('/auth/sign-in')
    }
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar__menu">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? 'sidebar__link is-active' : 'sidebar__link'
          }
        >
          <span className="sidebar__icon material-symbols-outlined">
            description
          </span>
          Notes
        </NavLink>
        <NavLink
          to="/tags"
          className={({ isActive }) =>
            isActive ? 'sidebar__link is-active' : 'sidebar__link'
          }
        >
          <span className="sidebar__icon material-symbols-outlined">label</span>
          Tags
        </NavLink>
        <NavLink
          to="/notebooks"
          className={({ isActive }) =>
            isActive ? 'sidebar__link is-active' : 'sidebar__link'
          }
        >
          <span className="sidebar__icon material-symbols-outlined">book</span>
          Notebooks
        </NavLink>
        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            isActive ? 'sidebar__link is-active' : 'sidebar__link'
          }
        >
          <span className="sidebar__icon material-symbols-outlined">star</span>
          Favorites
        </NavLink>
        </div>

        <div className="sidebar__accordion">
        <button
          type="button"
          className="sidebar__accordion-head"
          onClick={() => setNotebookOpen((prev) => !prev)}
        >
          <span>Notebooks</span>
          <span
            className={`sidebar__chevron material-symbols-outlined ${
              notebookOpen ? 'is-open' : ''
            }`}
          >
            expand_more
          </span>
        </button>
        {notebookOpen && (
          <div>
            {notebooksLoading && <p className="sidebar__muted">Loading…</p>}
            {notebooksError && (
              <p className="sidebar__muted">Unable to load notebooks.</p>
            )}
            {!notebooksLoading && !notebooksError && (
              <ul>
                {notebookOptions.map((notebook) => (
                  <li key={notebook.id}>
                    <button
                      type="button"
                      className="sidebar__pill"
                      onClick={() => navigate(`/notebooks?notebookId=${notebook.id}`)}
                    >
                      {notebook.name}
                    </button>
                  </li>
                ))}
                {notebookOptions.length === 0 && (
                  <li>
                    <span className="sidebar__muted">No notebooks yet.</span>
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
        </div>

        <div className="sidebar__accordion">
        <button
          type="button"
          className="sidebar__accordion-head"
          onClick={() => setTagsOpen((prev) => !prev)}
        >
          <span>Tags</span>
          <span
            className={`sidebar__chevron material-symbols-outlined ${
              tagsOpen ? 'is-open' : ''
            }`}
          >
            expand_more
          </span>
        </button>
        {tagsOpen && (
          <div>
            {tagsLoading && <p className="sidebar__muted">Loading…</p>}
            {tagsError && <p className="sidebar__muted">Unable to load tags.</p>}
            {!tagsLoading && !tagsError && (
              <ul>
                {tagOptions.map((tag) => (
                  <li key={tag.id}>
                    <button
                      type="button"
                      className="sidebar__pill"
                      onClick={() => navigate(`/tags?tagId=${tag.id}`)}
                    >
                      #{tag.name}
                    </button>
                  </li>
                ))}
                {tagOptions.length === 0 && (
                  <li>
                    <span className="sidebar__muted">No tags yet.</span>
                  </li>
                )}
              </ul>
            )}
          </div>
        )}
        </div>
      </div>

      <div className="sidebar__footer">
        <button type="button" className="sidebar__link">
          <span className="sidebar__icon material-symbols-outlined">
            settings
          </span>
          Settings
        </button>
        <button type="button" className="sidebar__link" onClick={handleLogout}>
          <span className="sidebar__icon material-symbols-outlined">
            logout
          </span>
          Logout
        </button>
      </div>
    </aside>
  )
}

export default Sidebar

