import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import ScheduleDialog from '../../components/ScheduleDialog.jsx'
import {
  createScheduleEntry,
  deleteScheduleEntry,
  fetchScheduleEntries,
  updateScheduleEntry,
} from '../../services/scheduleApi.js'

const initialFeedback = {
  message: '',
  severity: 'success',
}

function getTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

function sortEntries(entries) {
  return [...entries].sort((entryA, entryB) =>
    entryA.start_time.localeCompare(entryB.start_time),
  )
}

function formatScheduleDate(dateString) {
  if (!dateString) {
    return 'Selected Day'
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`))
}

function formatScheduleTime(timeString) {
  if (!timeString) {
    return ''
  }

  const [hours = '00', minutes = '00'] = timeString.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function getScheduleErrorMessage(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage
  }

  if (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    error.code === '42703'
  ) {
    return 'Schedule schema is missing. Run the updated supabase/tasks.sql in Supabase, then refresh.'
  }

  if (error.code === '42501') {
    return 'Supabase is blocking schedule access. Run the updated policies in supabase/tasks.sql, then refresh.'
  }

  return error.message ?? fallbackMessage
}

function SchedulePanel({ user }) {
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [entries, setEntries] = useState([])
  const [selectedEntryId, setSelectedEntryId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [feedback, setFeedback] = useState(initialFeedback)

  useEffect(() => {
    let ignore = false

    if (!user?.id) {
      setEntries([])
      setLoadError('')
      setIsLoading(false)
      return undefined
    }

    const loadEntries = async () => {
      setIsLoading(true)
      setLoadError('')

      try {
        const storedEntries = await fetchScheduleEntries(user.id, selectedDate)

        if (ignore) {
          return
        }

        setEntries(sortEntries(storedEntries))
      } catch (error) {
        if (ignore) {
          return
        }

        setLoadError(
          getScheduleErrorMessage(error, 'Could not load your schedule right now.'),
        )
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadEntries()

    return () => {
      ignore = true
    }
  }, [selectedDate, user?.id])

  const selectedEntry =
    entries.find((entry) => entry.id === selectedEntryId) ?? null

  const updateFeedback = (message, severity = 'success') => {
    setFeedback({
      message,
      severity,
    })
  }

  const closeDialog = () => {
    if (isSaving || isDeleting) {
      return
    }

    setIsDialogOpen(false)
    setSelectedEntryId(null)
  }

  const reloadEntries = async () => {
    if (!user?.id) {
      return
    }

    const storedEntries = await fetchScheduleEntries(user.id, selectedDate)
    setEntries(sortEntries(storedEntries))
  }

  const handleSaveEntry = async (entryPayload) => {
    if (entryPayload.end_time <= entryPayload.start_time) {
      updateFeedback('End time should be later than start time.', 'error')
      return
    }

    setIsSaving(true)
    setFeedback(initialFeedback)

    try {
      if (entryPayload.id) {
        await updateScheduleEntry(entryPayload, user.id)
        updateFeedback('Schedule updated successfully.')
      } else {
        await createScheduleEntry(entryPayload, user.id)
        updateFeedback('Meeting added to your timeline.')
      }

      if (entryPayload.schedule_date === selectedDate) {
        await reloadEntries()
      } else {
        setSelectedDate(entryPayload.schedule_date)
      }
      setLoadError('')
      setIsDialogOpen(false)
      setSelectedEntryId(null)
    } catch (error) {
      updateFeedback(
        getScheduleErrorMessage(
          error,
          entryPayload.id
            ? 'Could not update this schedule right now.'
            : 'Could not add this meeting right now.',
        ),
        'error',
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEntry = async (entryId) => {
    setIsDeleting(true)
    setFeedback(initialFeedback)

    try {
      await deleteScheduleEntry(entryId, user.id)
      await reloadEntries()
      setLoadError('')
      updateFeedback('Schedule item removed.', 'info')
      setIsDialogOpen(false)
      setSelectedEntryId(null)
    } catch (error) {
      updateFeedback(
        getScheduleErrorMessage(
          error,
          'Could not remove this schedule item right now.',
        ),
        'error',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <section className="schedule-panel">
        <header className="schedule-panel__header">
          <div>
            <p className="panel-label">Daily Planner</p>
            <h2>Schedule</h2>
            <p className="schedule-panel__copy">
              Keep your meetings and time blocks visible beside your tasks.
            </p>
          </div>

          <div className="schedule-panel__actions">
            <label className="dialog-form__field schedule-panel__date-field">
              <span>Date</span>
              <input
                type="date"
                value={selectedDate}
                disabled={isSaving || isDeleting}
                onChange={(event) => setSelectedDate(event.target.value)}
                required
              />
            </label>

            <button
              type="button"
              className="task-list-box__button"
              onClick={() => {
                setSelectedEntryId(null)
                setIsDialogOpen(true)
              }}
            >
              <span className="task-list-box__button-icon" aria-hidden="true">
                +
              </span>
              Add Meeting
            </button>
          </div>
        </header>

        {feedback.message ? (
          <Alert severity={feedback.severity}>{feedback.message}</Alert>
        ) : null}

        <div className="schedule-timeline__header">
          <div>
            <p className="schedule-timeline__eyebrow">Timeline</p>
            <h3>{formatScheduleDate(selectedDate)}</h3>
          </div>
          <span className="schedule-timeline__count">{entries.length} items</span>
        </div>

        <div className="schedule-panel__scroll">
          <ul
            className={`schedule-timeline${isLoading || entries.length === 0 ? ' schedule-timeline--empty' : ''}`}
            aria-label="Schedule timeline"
          >
            {isLoading ? (
              <li className="task-list__empty">Loading schedule...</li>
            ) : entries.length === 0 ? (
              <li className="task-list__empty">
                {loadError || 'No schedule items for this day yet.'}
              </li>
            ) : (
              entries.map((entry) => (
                <li key={entry.id} className="schedule-timeline__item">
                  <span className="schedule-timeline__dot" aria-hidden="true" />

                  <button
                    type="button"
                    className="schedule-entry__button"
                    onClick={() => {
                      setSelectedEntryId(entry.id)
                      setIsDialogOpen(true)
                    }}
                  >
                    <article className="schedule-entry">
                      <div className="schedule-entry__meta">
                        <span className="schedule-entry__time">
                          {formatScheduleTime(entry.start_time)} -{' '}
                          {formatScheduleTime(entry.end_time)}
                        </span>
                        <span className="schedule-entry__edit-pill">
                          Update
                        </span>
                      </div>
                      <h4>{entry.title}</h4>
                      {entry.notes ? <p>{entry.notes}</p> : null}
                    </article>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      {isDialogOpen ? (
        <ScheduleDialog
          isOpen={isDialogOpen}
          entry={selectedEntry}
          initialDate={selectedDate}
          isSaving={isSaving}
          isDeleting={isDeleting}
          onClose={closeDialog}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
        />
      ) : null}
    </>
  )
}

export default SchedulePanel
