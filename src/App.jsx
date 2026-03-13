import { useEffect, useState } from 'react'
import Avatar from '@mui/material/Avatar'
import './App.css'
import AuthCard from './features/auth/AuthCard.jsx'
import CredentialsPage from './features/account/CredentialsPage.jsx'
import SchedulePanel from './features/schedule/SchedulePanel.jsx'
import TaskList from './features/tasks/TaskList.jsx'
import {
  getSession,
  onAuthStateChange,
  signOut,
} from './services/authApi.js'

function getDisplayName(user) {
  const metadataUsername = user?.user_metadata?.username?.trim()

  if (metadataUsername) {
    return metadataUsername
  }

  const metadataName = user?.user_metadata?.full_name?.trim()

  if (metadataName) {
    return metadataName
  }

  if (user?.email) {
    return user.email.split('@')[0]
  }

  return 'User'
}

function getAvatarFallback(displayName) {
  const cleanedName = displayName.trim()

  if (!cleanedName) {
    return 'U'
  }

  const initials = cleanedName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return initials || cleanedName[0].toUpperCase()
}

function App() {
  const [session, setSession] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [authBootstrapError, setAuthBootstrapError] = useState('')
  const [activeView, setActiveView] = useState('tasks')

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      try {
        const currentSession = await getSession()

        if (!isMounted) {
          return
        }

        setSession(currentSession)
        setAuthBootstrapError('')
      } catch (error) {
        if (!isMounted) {
          return
        }

        setAuthBootstrapError(
          error.message ?? 'Could not connect to Supabase Auth.',
        )
      } finally {
        if (isMounted) {
          setIsAuthLoading(false)
        }
      }
    }

    void restoreSession()

    const subscription = onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return
      }

      setSession(nextSession)
      setAuthBootstrapError('')
      setIsAuthLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const currentUser = session?.user ?? null
  const displayName = getDisplayName(currentUser)
  const avatarFallback = getAvatarFallback(displayName)

  useEffect(() => {
    if (!currentUser?.id) {
      setActiveView('tasks')
    }
  }, [currentUser?.id])

  if (isAuthLoading) {
    return (
      <main className="layout">
        <section className="layout-panel layout-panel--center app-panel app-panel--status">
          <p className="panel-label">Checking Session</p>
          <h1>Loading your workspace</h1>
          <p className="panel-copy">
            Connecting to Supabase and restoring your sign-in.
          </p>
        </section>
      </main>
    )
  }

  if (!currentUser) {
    return (
      <main className="layout layout--auth">
        <section className="layout-panel layout-panel--center layout-panel--auth-card">
          <AuthCard bootstrapError={authBootstrapError} />
        </section>
      </main>
    )
  }

  return (
    <main className="layout layout--workspace">
      <section className="workspace-shell">
        <header className="workspace-topbar">
          <button
            type="button"
            className={`workspace-profile${activeView === 'credentials' ? ' workspace-profile--active' : ''}`}
            onClick={() => setActiveView('credentials')}
            aria-label="Open credentials page"
          >
            <Avatar
              src={currentUser.user_metadata?.avatar_url ?? undefined}
              alt={displayName}
              sx={{ width: 40, height: 40, bgcolor: '#ea580c', color: '#fff7ed' }}
            >
              {avatarFallback}
            </Avatar>
            <span className="workspace-profile__content">
              <strong>{displayName}</strong>
              <span>{currentUser.email}</span>
            </span>
          </button>
        </header>

        {activeView === 'credentials' ? (
          <CredentialsPage
            user={currentUser}
            displayName={displayName}
            avatarFallback={avatarFallback}
            onBack={() => setActiveView('tasks')}
            onSignOut={signOut}
          />
        ) : (
          <div className="workspace-dashboard">
            <SchedulePanel user={currentUser} />
            <TaskList user={currentUser} />
          </div>
        )}
      </section>
    </main>
  )
}

export default App
