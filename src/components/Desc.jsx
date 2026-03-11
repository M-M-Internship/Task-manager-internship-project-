import { useEffect, useRef, useState } from 'react'

const priorityOptions = ['Low', 'Medium', 'High']

function formatDeadline(deadline) {
  if (!deadline) {
    return 'No deadline set'
  }

  return new Date(`${deadline}T00:00:00`).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function Desc({ task, onClose, onDeleteTask, onUpdateTask }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState('Medium')
  const titleInputRef = useRef(null)

  const syncForm = (sourceTask) => {
    setTitle(sourceTask?.title ?? '')
    setDescription(sourceTask?.description ?? '')
    setDeadline(sourceTask?.deadline ?? '')
    setPriority(sourceTask?.priority ?? 'Medium')
  }

  useEffect(() => {
    if (!task) {
      setIsEditing(false)
      return
    }

    syncForm(task)
    setIsEditing(false)
  }, [task])

  useEffect(() => {
    if (!task) {
      return undefined
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [task, onClose])

  useEffect(() => {
    if (isEditing) {
      requestAnimationFrame(() => {
        titleInputRef.current?.focus()
      })
    }
  }, [isEditing])

  if (!task) {
    return null
  }

  const handleUpdate = (event) => {
    event.preventDefault()

    const trimmedTitle = title.trim()

    if (!trimmedTitle) {
      titleInputRef.current?.focus()
      return
    }

    onUpdateTask({
      ...task,
      title: trimmedTitle,
      description: description.trim(),
      deadline,
      priority,
    })
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    syncForm(task)
    setIsEditing(false)
  }

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog-card dialog-card--detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-card__header">
          <div>
            <p className="dialog-card__eyebrow">Task Details</p>
            <h3 id="task-detail-title">{task.title}</h3>
          </div>
          <button
            type="button"
            className="dialog-card__close"
            onClick={onClose}
            aria-label="Close task details dialog"
          >
            x
          </button>
        </div>

        {isEditing ? (
          <form className="dialog-form" onSubmit={handleUpdate}>
            <label className="dialog-form__field">
              <span>Task name</span>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>

            <label className="dialog-form__field">
              <span>Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows="4"
              />
            </label>

            <div className="dialog-form__row">
              <label className="dialog-form__field">
                <span>Deadline</span>
                <input
                  type="date"
                  value={deadline}
                  onChange={(event) => setDeadline(event.target.value)}
                />
              </label>

              <label className="dialog-form__field">
                <span>Priority</span>
                <select
                  value={priority}
                  onChange={(event) => setPriority(event.target.value)}
                >
                  {priorityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="dialog-form__actions">
              <button
                type="button"
                className="dialog-form__button dialog-form__button--danger"
                onClick={() => onDeleteTask(task.id)}
              >
                Delete Task
              </button>
              <button
                type="button"
                className="dialog-form__button dialog-form__button--ghost"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="dialog-form__button dialog-form__button--primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="task-detail">
            <section className="task-detail__section">
              <span className="task-detail__label">Description</span>
              <p>{task.description || 'No description added yet.'}</p>
            </section>

            <div className="task-detail__meta">
              <section className="task-detail__chip">
                <span>Deadline</span>
                <strong>{formatDeadline(task.deadline)}</strong>
              </section>

              <section
                className={`task-detail__chip task-detail__chip--${task.priority.toLowerCase()}`}
              >
                <span>Priority</span>
                <strong>{task.priority}</strong>
              </section>
            </div>

            <div className="task-detail__actions">
              <button
                type="button"
                className="dialog-form__button dialog-form__button--danger"
                onClick={() => onDeleteTask(task.id)}
              >
                Delete Task
              </button>
              <button
                type="button"
                className="dialog-form__button dialog-form__button--primary"
                onClick={() => setIsEditing(true)}
              >
                Update Task
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Desc
