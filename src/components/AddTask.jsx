import { useEffect, useEffectEvent, useRef, useState } from 'react'

const priorityOptions = ['Low', 'Medium', 'High']
const statusOptions = [
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
]

function AddTask({ isOpen, onClose, onAddTask }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [status, setStatus] = useState('incomplete')
  const titleInputRef = useRef(null)

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setDeadline('')
    setPriority('Medium')
    setStatus('incomplete')
  }

  const handleClose = () => {
    resetForm()
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

  const handleSubmit = (event) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle) {
      titleInputRef.current?.focus()
      return
    }

    onAddTask({
      title: trimmedTitle,
      description: trimmedDescription,
      deadline,
      priority,
      status,
    })
    resetForm()
  }

  return (
    <div className="dialog-backdrop" onClick={handleClose}>
      <div
        className="dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-card__header">
          <div>
            <p className="dialog-card__eyebrow">New Task</p>
            <h3 id="add-task-title">Add task details</h3>
          </div>
          <button
            type="button"
            className="dialog-card__close"
            onClick={handleClose}
            aria-label="Close add task dialog"
          >
            x
          </button>
        </div>

        <form className="dialog-form" onSubmit={handleSubmit}>
          <label className="dialog-form__field">
            <span>Task name</span>
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Finish homepage design"
              required
            />
          </label>

          <label className="dialog-form__field">
            <span>Description (optional)</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add any extra notes for this task"
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

            <label className="dialog-form__field">
              <span>Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="dialog-form__actions">
            <button
              type="button"
              className="dialog-form__button dialog-form__button--ghost"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="dialog-form__button dialog-form__button--primary"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTask
