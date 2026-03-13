import { useState } from 'react'
import Alert from '@mui/material/Alert'
import {
  sendEmailOtp,
  signInWithPassword,
  signUpWithPassword,
  verifyEmailOtp,
} from '../../services/authApi.js'

const authModes = [
  { value: 'login', label: 'Log In' },
  { value: 'signup', label: 'Sign Up' },
  { value: 'otp', label: 'OTP' },
]

const initialFeedback = {
  message: '',
  severity: 'info',
}

function getAuthErrorMessage(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage
  }

  const normalizedMessage = error.message?.toLowerCase() ?? ''

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Incorrect email or password.'
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Your email is not confirmed yet. Check your inbox or use the OTP tab.'
  }

  if (normalizedMessage.includes('captcha')) {
    return 'Supabase rejected the request because of CAPTCHA settings. Review your Auth configuration.'
  }

  return error.message ?? fallbackMessage
}

function AuthCard({ bootstrapError = '' }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [hasSentOtp, setHasSentOtp] = useState(false)
  const [feedback, setFeedback] = useState(initialFeedback)

  const isBusy = isSubmitting || isSendingOtp

  const updateFeedback = (message, severity = 'info') => {
    setFeedback({
      message,
      severity,
    })
  }

  const handleModeChange = (nextMode) => {
    if (nextMode === mode || isBusy) {
      return
    }

    setMode(nextMode)
    setPassword('')
    setConfirmPassword('')
    setOtpCode('')
    setHasSentOtp(false)
    setFeedback(initialFeedback)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback(initialFeedback)

    try {
      await signInWithPassword({
        email,
        password,
      })

      updateFeedback('Signed in successfully. Loading your tasks...', 'success')
    } catch (error) {
      updateFeedback(
        getAuthErrorMessage(error, 'Could not sign in right now.'),
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignup = async (event) => {
    event.preventDefault()

    if (!username.trim()) {
      updateFeedback('Enter a username to create your account.', 'error')
      return
    }

    if (password !== confirmPassword) {
      updateFeedback('Passwords do not match.', 'error')
      return
    }

    setIsSubmitting(true)
    setFeedback(initialFeedback)

    try {
      const { session } = await signUpWithPassword({
        email,
        password,
        username,
      })

      updateFeedback(
        session
          ? 'Account created. Loading your workspace...'
          : 'Account created. Check your email if Supabase asks for confirmation, or use the OTP tab.',
        'success',
      )
    } catch (error) {
      updateFeedback(
        getAuthErrorMessage(error, 'Could not create your account right now.'),
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendOtp = async () => {
    if (!email.trim()) {
      updateFeedback('Enter your email first to receive an OTP.', 'error')
      return
    }

    setIsSendingOtp(true)
    setFeedback(initialFeedback)

    try {
      await sendEmailOtp(email)
      setHasSentOtp(true)
      updateFeedback(
        'Check your email for the one-time code or sign-in link.',
        'success',
      )
    } catch (error) {
      updateFeedback(
        getAuthErrorMessage(error, 'Could not send an OTP right now.'),
        'error',
      )
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyOtp = async (event) => {
    event.preventDefault()

    if (!hasSentOtp) {
      await handleSendOtp()
      return
    }

    if (!otpCode.trim()) {
      updateFeedback('Enter the code from your email to continue.', 'error')
      return
    }

    setIsSubmitting(true)
    setFeedback(initialFeedback)

    try {
      await verifyEmailOtp({
        email,
        token: otpCode,
      })

      updateFeedback('Code verified. Loading your tasks...', 'success')
    } catch (error) {
      updateFeedback(
        getAuthErrorMessage(error, 'Could not verify the OTP right now.'),
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-card">
      <div className="auth-card__header">
        <p className="panel-label">Supabase Auth</p>
        <h2>Log in, sign up, or use OTP</h2>
        <p className="auth-card__copy">
          Your credentials stay in Supabase Auth, and each account gets a
          private task list.
        </p>
      </div>

      <div className="auth-tabs" role="group" aria-label="Authentication mode">
        {authModes.map((authMode) => {
          const isActive = mode === authMode.value

          return (
            <button
              key={authMode.value}
              type="button"
              className={`auth-tabs__button${isActive ? ' auth-tabs__button--active' : ''}`}
              disabled={isBusy}
              onClick={() => handleModeChange(authMode.value)}
              aria-pressed={isActive}
            >
              {authMode.label}
            </button>
          )
        })}
      </div>

      {bootstrapError ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {bootstrapError}
        </Alert>
      ) : null}

      {feedback.message ? (
        <Alert severity={feedback.severity} sx={{ mt: 2 }}>
          {feedback.message}
        </Alert>
      ) : null}

      {mode === 'login' ? (
        <form className="dialog-form auth-form" onSubmit={handleLogin}>
          <label className="dialog-form__field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              disabled={isBusy}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="dialog-form__field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              disabled={isBusy}
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          <div className="dialog-form__actions auth-form__actions">
            <button
              type="submit"
              className="dialog-form__button dialog-form__button--primary"
              disabled={isBusy}
            >
              {isSubmitting ? 'Signing In...' : 'Log In'}
            </button>
          </div>
        </form>
      ) : null}

      {mode === 'signup' ? (
        <form className="dialog-form auth-form" onSubmit={handleSignup}>
          <label className="dialog-form__field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              disabled={isBusy}
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="How should we show your name?"
              maxLength={32}
              required
            />
          </label>

          <label className="dialog-form__field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              disabled={isBusy}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="dialog-form__field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              disabled={isBusy}
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Create a strong password"
              minLength={6}
              required
            />
          </label>

          <label className="dialog-form__field">
            <span>Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              disabled={isBusy}
              autoComplete="new-password"
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat the same password"
              minLength={6}
              required
            />
          </label>

          <div className="dialog-form__actions auth-form__actions">
            <button
              type="submit"
              className="dialog-form__button dialog-form__button--primary"
              disabled={isBusy}
            >
              {isSubmitting ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>
      ) : null}

      {mode === 'otp' ? (
        <form className="dialog-form auth-form" onSubmit={handleVerifyOtp}>
          <label className="dialog-form__field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              disabled={isBusy}
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>

          <p className="auth-card__note">
            Send a one-time code to your inbox. If your Supabase email template
            still uses magic links, the email may include a sign-in link too.
          </p>

          <label className="dialog-form__field">
            <span>One-Time Code</span>
            <input
              type="text"
              value={otpCode}
              disabled={isBusy || !hasSentOtp}
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setOtpCode(event.target.value.trim())}
              placeholder="Enter the code from your email"
            />
          </label>

          <div className="dialog-form__actions auth-form__actions">
            <button
              type="button"
              className="dialog-form__button dialog-form__button--ghost"
              disabled={isBusy}
              onClick={() => {
                void handleSendOtp()
              }}
            >
              {isSendingOtp ? 'Sending OTP...' : hasSentOtp ? 'Resend OTP' : 'Send OTP'}
            </button>
            <button
              type="submit"
              className="dialog-form__button dialog-form__button--primary"
              disabled={isBusy}
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  )
}

export default AuthCard
