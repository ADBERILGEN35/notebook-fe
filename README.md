# 📝 NotesApp - Modern Note Management Frontend

<div align="center">

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4.8-646CFF?logo=vite&logoColor=white)
![React Query](https://img.shields.io/badge/React%20Query-5.56.2-FF4154?logo=react-query&logoColor=white)

**A modern, feature-rich note-taking application built with React, TypeScript, and Vite**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [API Integration](#-api-integration)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Authentication & Security](#-authentication--security)
- [Development](#-development)
- [Building for Production](#-building-for-production)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

NotesApp is a modern, full-featured note management application that provides users with an intuitive interface for creating, organizing, and managing their notes. Built with cutting-edge web technologies, it offers a seamless user experience with real-time updates, advanced search capabilities, and comprehensive organization features.

### Key Highlights

- 🚀 **Fast & Responsive**: Built with Vite for lightning-fast development and optimized production builds
- 🔒 **Secure**: JWT-based authentication with automatic token management and protected routes
- 🎨 **Modern UI**: Dark-themed, intuitive interface with Material Icons
- 🔍 **Advanced Search**: Real-time search with debouncing and minimum character requirements
- 📱 **Responsive Design**: Works seamlessly across desktop and mobile devices
- ⚡ **Optimized Performance**: React Query for efficient data fetching and caching

## ✨ Features

### Core Functionality

- **📝 Note Management**
    - Create, edit, and delete notes
    - Rich text content support
    - Pin/unpin important notes
    - Archive notes for better organization
    - Version control with optimistic locking (ETag support)

- **📚 Notebook Organization**
    - Create and manage notebooks
    - Organize notes into notebooks
    - View notebook statistics (note count)
    - Filter notes by notebook

- **🏷️ Tag System**
    - Create custom tags with colors
    - Assign multiple tags to notes
    - Filter notes by tags
    - Visual tag indicators with color coding

- **⭐ Favorites**
    - Mark notes as favorites
    - Quick access to favorite notes

- **🔍 Advanced Search**
    - Real-time search with debouncing (300ms)
    - Minimum 3 characters required
    - Search across note titles and content
    - Search results page with pagination

### User Experience

- **🔐 Authentication**
    - Secure login and registration
    - JWT token-based authentication
    - Automatic token refresh handling
    - Protected routes with redirects
    - Password visibility toggle
    - Password change functionality

- **🎨 User Interface**
    - Dark theme optimized for eye comfort
    - Responsive sidebar navigation
    - Top bar with search functionality
    - Modal dialogs for forms
    - Loading states and error handling
    - Toast notifications for user feedback

- **📊 Dashboard**
    - Overview of all notes
    - Filter by notebook and tags
    - Sort by update date (ascending/descending)
    - Quick actions (pin, archive, delete)
    - Real-time updates

- **👥 User Management** (Admin)
    - View user list
    - User status indicators (enabled/disabled, locked/unlocked)
    - User profile management

## 🛠️ Tech Stack

### Core Technologies

- **React 18.3.1** - Modern UI library with hooks
- **TypeScript 5.6.2** - Type-safe JavaScript
- **Vite 5.4.8** - Next-generation frontend tooling
- **React Router DOM 6.27.0** - Client-side routing

### State Management & Data Fetching

- **TanStack Query (React Query) 5.56.2** - Powerful data synchronization
- **Zustand 4.5.4** - Lightweight state management (if needed)

### HTTP Client

- **Axios 1.7.7** - Promise-based HTTP client with interceptors

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting rules

### Styling

- **CSS Modules** - Component-scoped styling
- **Material Symbols** - Icon library
- **Custom CSS** - Dark theme with modern design

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (or yarn/pnpm)
- **Backend API** running on `http://localhost:8080/api` (or configure via environment variables)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables** (optional)

   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   ```

   If not specified, the default API base URL is `http://localhost:8080/api`.

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:5173` (or the port shown in the terminal)

### First Steps

1. **Register a new account** or **sign in** with existing credentials
2. **Create your first note** using the "New Note" button
3. **Organize notes** by creating notebooks and tags
4. **Explore the dashboard** to see all your notes

## 📁 Project Structure

```
frontend/
├── src/
│   ├── assets/              # Static assets (images, fonts, etc.)
│   ├── components/          # Reusable React components
│   │   ├── auth/           # Authentication components
│   │   │   └── ProtectedRoute.tsx
│   │   ├── common/         # Common/shared components
│   │   │   └── Logo.tsx
│   │   ├── layout/         # Layout components
│   │   │   └── AppLayout.tsx
│   │   └── navigation/     # Navigation components
│   │       ├── Sidebar.tsx
│   │       └── TopBar.tsx
│   ├── constants/          # Application constants
│   │   └── tagColors.ts
│   ├── hooks/              # Custom React hooks
│   │   ├── useDebounce.ts
│   │   ├── useNoteSearch.ts
│   │   └── useOutsideClick.ts
│   ├── lib/                # Core libraries and utilities
│   │   ├── httpClient.ts   # Axios configuration with interceptors
│   │   └── queryKeys.ts    # React Query key factories
│   ├── pages/              # Page components (routes)
│   │   ├── Dashboard.tsx
│   │   ├── LoginPage.tsx
│   │   ├── NotesPage.tsx
│   │   ├── NoteDetailPage.tsx
│   │   ├── NewNotePage.tsx
│   │   ├── NotebooksPage.tsx
│   │   ├── NewNotebookPage.tsx
│   │   ├── TagsPage.tsx
│   │   ├── NewTagPage.tsx
│   │   ├── FavoritesPage.tsx
│   │   ├── UsersPage.tsx
│   │   └── SearchResultsPage.tsx
│   ├── router/             # Routing configuration
│   │   └── index.tsx
│   ├── sections/           # Page sections/components
│   │   └── NotesPreviewTable.tsx
│   ├── services/           # API service layers
│   │   ├── authService.ts
│   │   ├── noteService.ts
│   │   ├── notebookService.ts
│   │   ├── tagService.ts
│   │   └── userService.ts
│   ├── styles/            # CSS stylesheets
│   │   ├── index.css      # Global styles
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   ├── layout.css
│   │   ├── note-detail.css
│   │   ├── note-form.css
│   │   ├── notebooks.css
│   │   ├── sidebar.css
│   │   ├── topbar.css
│   │   └── ...
│   ├── types/             # TypeScript type definitions
│   │   ├── index.ts
│   │   └── pagination.ts
│   ├── utils/             # Utility functions
│   │   └── dates.ts
│   ├── main.tsx           # Application entry point
│   └── env.d.ts           # Environment variable types
├── public/                # Public static files
├── .env                   # Environment variables (create this)
├── index.html             # HTML template
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## 🔌 API Integration

### Base Configuration

The application communicates with a RESTful backend API. The base URL is configurable via environment variables:

```typescript
// Default: http://localhost:8080/api
VITE_API_BASE_URL=http://localhost:8080/api
```

### Authentication

- **Login**: `POST /auth/login`
- **Register**: `POST /v1/auth/register`
- **Logout**: `POST /auth/logout`
- **Change Password**: `PUT /v1/users/me/password`

### Notes API

- **List Notes**: `GET /v1/notes`
- **Get Note**: `GET /v1/notes/:id`
- **Create Note**: `POST /v1/notes`
- **Update Note**: `PUT /v1/notes/:id` (with `If-Match` header for version control)
- **Delete Note**: `DELETE /v1/notes/:id`
- **Search Notes**: `POST /v1/notes/search`

### Notebooks API

- **List Notebooks**: `GET /v1/notebooks`
- **Get Notebook**: `GET /v1/notebooks/:id`
- **Create Notebook**: `POST /v1/notebooks`
- **Update Notebook**: `PUT /v1/notebooks/:id`
- **Delete Notebook**: `DELETE /v1/notebooks/:id`

### Tags API

- **List Tags**: `GET /v1/tags`
- **Get Tag**: `GET /v1/tags/:id`
- **Create Tag**: `POST /v1/tags`
- **Update Tag**: `PUT /v1/tags/:id`
- **Delete Tag**: `DELETE /v1/tags/:id`

### Users API

- **Get Current User**: `GET /v1/users/me`
- **List Users**: `GET /v1/users`
- **Search Users**: `GET /v1/users/search`

## 🔐 Authentication & Security

### JWT Token Management

- Tokens are stored in `localStorage` as `accessToken`
- Automatic token injection via Axios request interceptors
- Token exclusion for authentication endpoints

### Protected Routes

- All routes except `/auth/sign-in` are protected
- Unauthenticated users are automatically redirected to login
- Authenticated users accessing login page are redirected to dashboard

### Error Handling

- **401 Unauthorized**: Automatic token removal and redirect to login
- **Network Errors**: User-friendly error messages
- **Validation Errors**: Form-level error feedback

### Password Security

- Password visibility toggle for better UX
- Minimum password length enforcement (8 characters)
- Secure password change flow with automatic logout

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

### Development Server

The development server runs on `http://localhost:5173` by default. The server is configured to:
- Accept connections from any host (`0.0.0.0`)
- Enable hot module replacement (HMR)
- Provide fast refresh for React components

### Code Style

- **ESLint**: Configured with TypeScript and React rules
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict type checking enabled

### Best Practices

1. **Component Structure**: Use functional components with hooks
2. **Type Safety**: Leverage TypeScript for all components and functions
3. **State Management**: Use React Query for server state, local state for UI
4. **Error Handling**: Always handle errors gracefully with user feedback
5. **Performance**: Use `useMemo` and `useCallback` for expensive operations

## 🏗️ Building for Production

### Build Process

```bash
npm run build
```

This command:
1. Type-checks the codebase (`tsc -b`)
2. Bundles the application with Vite
3. Optimizes assets and code splitting
4. Generates production-ready files in `dist/`

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

### Deployment

The `dist/` folder contains all static files ready for deployment to:
- **Static hosting** (Vercel, Netlify, GitHub Pages)
- **CDN** (Cloudflare, AWS CloudFront)
- **Web servers** (Nginx, Apache)

### Environment Variables

For production, set the `VITE_API_BASE_URL` environment variable to point to your production API:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

