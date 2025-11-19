import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/auth.css'
import { login, register } from '../services/authService'

const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBiWyVYIxkDw4wl1sf6z0Rrc_R-HOBK4vdRLQtEH8AUX2BckrYUCvo2d66fwIjXYBtdvoQUUVj7kPeLaaBfelhvLG0JS1jLtERv97IAunB2vXhfTT8v4mwMbWP_QMqqNQTt-My7ofBEF53Y0oHnSPpcRgrWwVkW9IxJlsx5te616P6CYQTqK3UUpNMm6ggJa2JVZ1-gyNECsu5CnFrWV73YGDF1YZygIlGdLqiI9-4X0Hj3xeWmcZrOZYFpLNbF_JuuuqGx6ppm20s'

const LoginPage = () => {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isSignIn = mode === 'signin'

  const resetMessages = () => {
    setMessage(null)
    setError(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    resetMessages()

    if (!isSignIn && password !== passwordConfirm) {
      setError('Passwords do not match')
      return
    }

    try {
      setSubmitting(true)
      if (isSignIn) {
        const data = await login({ email, password })
        localStorage.setItem('accessToken', data.accessToken)
        setMessage('Signed in successfully.')
        navigate('/', { replace: true })
      } else {
        await register({ email, password })
        setMessage('Account created. You can sign in now.')
        setMode('signin')
      }
    } catch (err: unknown) {
      let detail = 'Operation failed. Please try again.'
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const maybeResponse = (err as any).response
        detail =
          maybeResponse?.data?.message ||
          maybeResponse?.data?.error ||
          maybeResponse?.statusText ||
          detail
      }
      setError(detail)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__split">
          <section className="auth__panel auth__panel--visual">
            <div className="auth-visual">
              <div
                className="auth-visual__image"
                style={{ backgroundImage: `url(${heroImage})` }}
                role="img"
                aria-label="Abstract illustration representing organized ideas"
              />
              <h1>Your Digital Brain</h1>
              <p>
                A simple and powerful tool to organize your thoughts and boost your
                productivity.
              </p>
            </div>
          </section>

          <section className="auth__panel">
            <div className="auth-card">
              <div className="auth-logo">
                <div className="auth-logo__mark">✎</div>
                <span className="auth-title">NotesApp</span>
              </div>

              <div>
                <h2 className="auth-title">
                  {isSignIn ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="auth-subtitle">
                  {isSignIn
                    ? 'Sign in to continue to your notes.'
                    : 'Join now to save and organize your ideas.'}
                </p>
              </div>

              <div className="auth-toggle">
                <button
                  type="button"
                  className={isSignIn ? 'is-active' : ''}
                  onClick={() => setMode('signin')}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={!isSignIn ? 'is-active' : ''}
                  onClick={() => setMode('signup')}
                >
                  Sign Up
                </button>
              </div>

              {(message || error) && (
                <div className={error ? 'auth-alert error' : 'auth-alert success'}>
                  {error ?? message}
                </div>
              )}

              <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="auth-field auth-field--password">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete={isSignIn ? 'current-password' : 'new-password'}
                    minLength={8}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="auth-field__toggle"
                    aria-label="Show or hide password"
                  >
                    👁️
                  </button>
                </div>

                {!isSignIn && (
                  <div className="auth-field auth-field--password">
                    <label htmlFor="password-confirm">Confirm Password</label>
                    <input
                      id="password-confirm"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                    />
                  </div>
                )}

                {isSignIn && (
                  <div className="auth-meta">
                    <a href="#">Forgot Password?</a>
                  </div>
                )}

                <button type="submit" className="auth-submit" disabled={submitting}>
                  {submitting ? 'Please wait…' : isSignIn ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div className="auth-divider">OR</div>

              <div className="auth-social">
                <button type="button">
                  <GoogleIcon />
                  Continue with Google
                </button>
                <button type="button">
                  <AppleIcon />
                  Continue with Apple
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <g clipPath="url(#clip0)">
      <path
        d="M47.532 24.553c0-1.632-.132-3.272-.414-4.877H24.252v9.054h13.161c-.561 2.992-2.139 5.511-4.454 7.151v6.014h7.226c4.604-4.18 7.347-10.134 7.347-17.342Z"
        fill="#4285F4"
      />
      <path
        d="M24.252 48c6.683 0 12.193-2.286 15.932-6.105l-7.226-6.014c-2.196 1.521-5.197 2.449-8.706 2.449-6.322 0-11.803-4.207-13.651-10.001H3.142v6.16C6.828 42.429 14.881 48 24.252 48Z"
        fill="#34A853"
      />
      <path
        d="M10.601 28.328a14.33 14.33 0 0 1-.754-4.585c0-1.601.252-3.145.713-4.585L3.142 12.998C1.133 17.062 0 21.259 0 25.743s1.133 8.681 3.142 12.745l7.459-10.16Z"
        fill="#FBBC04"
      />
      <path
        d="M24.252 9.156c3.813 0 7.076 1.276 9.741 3.672l6.409-6.408C36.436 2.76 30.935 0 24.252 0 14.881 0 6.829 5.571 3.143 13.512l7.416 5.646C12.449 13.363 17.93 9.156 24.252 9.156Z"
        fill="#EA4335"
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="48" height="48" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.032 17.84c-1.393 0-2.835-.443-4.117-1.375-.15-.107-.123-.203.023-.263.875-.356 1.83-.54 2.798-.54.95 0 1.916.184 2.798.54.146.06.173.156.023.263-1.282.932-2.724 1.375-4.125 1.375m3.11-6.173c-.714 0-1.34-.53-1.85-1.25-.494-.7-1.133-1.894-2.126-1.894-.992 0-1.632 1.192-2.125 1.892-.51.72-1.136 1.25-1.85 1.25-.783 0-1.42-.58-1.85-1.34-.486-.85-.88-2.11-.88-3.328 0-2.324 1.54-3.84 3.654-3.84.97 0 1.765.55 2.45 1.353.642-.832 1.59-1.353 2.65-1.353 2.05 0 3.55 1.54 3.55 3.84 0 1.21-.39 2.47-.87 3.32-.43.76-.99 1.34-1.78 1.34M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0" />
  </svg>
)

export default LoginPage

