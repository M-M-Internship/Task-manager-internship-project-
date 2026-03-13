import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import {
  updateUserPassword,
  updateUserProfile,
} from '../../services/authApi.js'

const initialFeedback = {
  message: '',
  severity: 'success',
}

function getStoredUsername(user) {
  return (
    user?.user_metadata?.username?.trim() ??
    user?.user_metadata?.full_name?.trim() ??
    ''
  )
}

function CredentialsPage({
  user,
  displayName,
  avatarFallback,
  onBack,
  onSignOut,
}) {
  const [username, setUsername] = useState(getStoredUsername(user))
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [feedback, setFeedback] = useState(initialFeedback)

  useEffect(() => {
    setUsername(getStoredUsername(user))
  }, [user])

  const isBusy = isSavingProfile || isSavingPassword || isSigningOut

  const updateFeedback = (message, severity = 'success') => {
    setFeedback({
      message,
      severity,
    })
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()

    if (!username.trim()) {
      updateFeedback('Username cannot be empty.', 'error')
      return
    }

    setIsSavingProfile(true)
    setFeedback(initialFeedback)

    try {
      await updateUserProfile({
        username,
      })
      updateFeedback('Username updated successfully.')
    } catch (error) {
      updateFeedback(
        error.message ?? 'Could not update your username right now.',
        'error',
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()

    if (!password.trim()) {
      updateFeedback('Enter a new password to continue.', 'error')
      return
    }

    if (password.length < 6) {
      updateFeedback('Password must be at least 6 characters long.', 'error')
      return
    }

    if (password !== confirmPassword) {
      updateFeedback('Passwords do not match.', 'error')
      return
    }

    setIsSavingPassword(true)
    setFeedback(initialFeedback)

    try {
      await updateUserPassword(password)
      setPassword('')
      setConfirmPassword('')
      updateFeedback('Password updated successfully.')
    } catch (error) {
      updateFeedback(
        error.message ?? 'Could not update your password right now.',
        'error',
      )
    } finally {
      setIsSavingPassword(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      await onSignOut()
    } catch (error) {
      updateFeedback(error.message ?? 'Could not sign out right now.', 'error')
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <section className="account-card">
      <div className="account-card__topbar">
        <button
          type="button"
          className="account-card__back"
          disabled={isBusy}
          onClick={onBack}
        >
          Back to Tasks
        </button>
      </div>

      <div className="account-card__hero">
        <Avatar
          src={user?.user_metadata?.avatar_url ?? undefined}
          alt={displayName}
          sx={{ width: 64, height: 64, bgcolor: '#ea580c', color: '#fff7ed' }}
        >
          {avatarFallback}
        </Avatar>
        <div>
          <p className="panel-label">Credentials</p>
          <h2>{displayName}</h2>
          <p className="account-card__copy">
            Manage the username and password linked to your account.
          </p>
        </div>
      </div>

      {feedback.message ? (
        <Alert severity={feedback.severity}>{feedback.message}</Alert>
      ) : null}

      <div className="account-card__grid">
        <form className="dialog-form account-form" onSubmit={handleProfileSubmit}>
          <div className="account-form__header">
            <h3>Profile</h3>
            <p>Your name appears in the compact profile button.</p>
          </div>

          <label className="dialog-form__field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              disabled={isBusy}
              autoComplete="username"
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Choose your username"
              maxLength={32}
              required
            />
          </label>

          <label className="dialog-form__field">
            <span>Email</span>
            <input type="email" value={user?.email ?? ''} readOnly />
          </label>

          <div className="dialog-form__actions account-form__actions">
            <button
              type="submit"
              className="dialog-form__button dialog-form__button--primary"
              disabled={isBusy}
            >
              {isSavingProfile ? 'Saving...' : 'Save Username'}
            </button>
          </div>
        </form>

        <form className="dialog-form account-form" onSubmit={handlePasswordSubmit}>
          <div className="account-form__header">
            <h3>Password</h3>
            <p>Use a fresh password with at least 6 characters.</p>
          </div>

          <label className="dialog-form__field">
            <span>New Password</span>
            <input
              type="password"
              value={password}
              disabled={isBusy}
              autoComplete="new-password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter a new password"
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

          <div className="dialog-form__actions account-form__actions">
            <button
              type="submit"
              className="dialog-form__button dialog-form__button--primary"
              disabled={isBusy}
            >
              {isSavingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      <div className="account-card__footer">
        <button
          type="button"
          className="task-list-box__signout"
          disabled={isBusy}
          onClick={() => {
            void handleSignOut()
          }}
        >
          {isSigningOut ? 'Signing Out...' : 'Sign Out'}
        </button>
      </div>
    </section>
  )
}

export default CredentialsPage
