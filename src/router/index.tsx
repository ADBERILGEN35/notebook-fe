import { createBrowserRouter } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import Dashboard from '../pages/Dashboard'
import LoginPage from '../pages/LoginPage'
import NotesPage from '../pages/NotesPage'
import NoteDetailPage from '../pages/NoteDetailPage'
import NotebooksPage from '../pages/NotebooksPage'
import NewNotebookPage from '../pages/NewNotebookPage'
import NewNotePage from '../pages/NewNotePage'
import TagsPage from '../pages/TagsPage'
import NewTagPage from '../pages/NewTagPage'
import FavoritesPage from '../pages/FavoritesPage'
import UsersPage from '../pages/UsersPage'

const router = createBrowserRouter([
  {
    path: '/auth/sign-in',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'notes/new', element: <NewNotePage /> },
      { path: 'notes/:id', element: <NoteDetailPage /> },
      { path: 'notebooks', element: <NotebooksPage /> },
      { path: 'notebooks/new', element: <NewNotebookPage /> },
      { path: 'tags', element: <TagsPage /> },
      { path: 'tags/new', element: <NewTagPage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'users', element: <UsersPage /> }
    ]
  }
])

export default router

