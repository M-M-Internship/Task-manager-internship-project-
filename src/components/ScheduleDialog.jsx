import { useEffect, useEffectEvent, useRef, useState } from 'react'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'

function ScheduleDialog({
  isOpen,
  entry = null,
  initialDate = '',
  isSaving = false,
  isDeleting = false,
  onClose,
  onSave,
  onDelete,
}) {
  const isEditing = Boolean(entry?.id)
  const isBusy = isSaving || isDeleting
  const [scheduleDate, setScheduleDate] = useState(
    entry?.schedule_date ?? initialDate,
  )
  const [title, setTitle] = useState(entry?.title ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')
  const [startTime, setStartTime] = useState(
    entry?.start_time?.slice(0, 5) ?? '09:00',
  )
  const [endTime, setEndTime] = useState(
    entry?.end_time?.slice(0, 5) ?? '10:00',
  )
  const titleInputRef = useRef(null)

  const handleClose = () => {
    if (isBusy) {
      return
    }

    onClose()
  }

  const handleEscape = useEffectEvent((event) => {
    if (event.key === 'Escape') {
      handleClose()
    }
  })

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    requestAnimationFrame(() => {
      titleInputRef.current?.focus()
    })

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      titleInputRef.current?.focus()
      return
    }

    await onSave({
      ...(entry?.id ? { id: entry.id } : {}),
      schedule_date: scheduleDate,
      title: trimmedTitle,
      notes: notes.trim(),
      start_time: startTime,
      end_time: endTime,
    })
  }

  return (
    <div className="dialog-backdrop" onClick={handleClose}>
      <div
        className="dialog-card dialog-card--detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-card__header">
          <div>
            <p className="dialog-card__eyebrow">
              {isEditing ? 'Update Schedule' : 'Add Meeting'}
            </p>
            <h3 id="schedule-dialog-title">
              {isEditing ? 'Edit timeline entry' : 'Create a schedule item'}
            </h3>
          </div>
          <button
            type="button"
            className="dialog-card__close"
            disabled={isBusy}
            onClick={handleClose}
            aria-label="Close schedule dialog"
          >
            x
          </button>
        </div>

        <form className="dialog-form" onSubmit={handleSubmit} aria-busy={isBusy}>
          <div className="dialog-form__row">
            <label className="dialog-form__field">
              <span>Date</span>
              <input
                type="date"
                value={scheduleDate}
                disabled={isBusy}
                onChange={(event) => setScheduleDate(event.target.value)}
                required
              />
            </label>

            <label className="dialog-form__field">
              <span>Start Time</span>
              <input
                type="time"
                value={startTime}
                disabled={isBusy}
                onChange={(event) => setStartTime(event.target.value)}
                required
              />
            </label>

            <label className="dialog-form__field">
              <span>End Time</span>
              <input
                type="time"
                value={endTime}
                disabled={isBusy}
                onChange={(event) => setEndTime(event.target.value)}
                required
              />
            </label>
          </div>

          <label className="dialog-form__field">
            <span>Title</span>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              disabled={isBusy}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Client review, design session, stand-up..."
              maxLength={80}
              required
            />
          </label>

          <label className="dialog-form__field">
            <span>Notes</span>
            <textarea
              value={notes}
              disabled={isBusy}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional details for this schedule item"
              rows="4"
            />
          </label>

          <div className="dialog-form__actions">
            {isEditing ? (
              <button
                type="button"
                className="dialog-form__button dialog-form__button--danger dialog-form__button--with-icon"
                disabled={isBusy}
                onClick={() => {
                  void onDelete(entry.id)
                }}
              >
                <DeleteOutlineRoundedIcon
                  className="dialog-form__button-icon"
                  fontSize="small"
                  aria-hidden="true"
                />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            ) : null}
            <button
              type="button"
              className="dialog-form__button dialog-form__button--ghost"
              disabled={isBusy}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dialog-form__button dialog-form__button--primary"
              disabled={isBusy}
            >
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleDialog
