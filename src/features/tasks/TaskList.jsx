import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import AddTask from '../../components/AddTask.jsx'
import Desc from '../../components/Desc.jsx'
import FilterButton from '../../components/FilterButton.jsx'
import {
  createTask,
  deleteTask,
  fetchTasks,
  updateTask,
} from '../../services/tasksApi.js'

const taskStatusLabels = {
  done: 'Done',
  active: 'Active',
  incomplete: 'Incomplete',
}

const emptyStateMessages = {
  all: 'No tasks yet. Add one to get started.',
  done: 'No completed tasks yet.',
  active: 'No active task right now.',
  incomplete: 'No incomplete tasks at the moment.',
}

function getTaskTimelineValue(task) {
  if (task.deadline) {
    return new Date(`${task.deadline}T00:00:00`).getTime()
  }

  return Number.POSITIVE_INFINITY
}

function sortTasksForTimeline(tasks) {
  return [...tasks].sort((taskA, taskB) => {
    const timelineDifference =
      getTaskTimelineValue(taskA) - getTaskTimelineValue(taskB)

    if (timelineDifference !== 0) {
      return timelineDifference
    }

    const createdAtA = taskA.created_at
      ? new Date(taskA.created_at).getTime()
      : 0
    const createdAtB = taskB.created_at
      ? new Date(taskB.created_at).getTime()
      : 0

    if (createdAtA !== createdAtB) {
      return createdAtB - createdAtA
    }

    return taskA.title.localeCompare(taskB.title)
  })
}

function getTaskErrorMessage(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage
  }

  if (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    error.code === '42703'
  ) {
    return 'Tasks auth schema is missing. Run the updated supabase/tasks.sql in Supabase, then refresh.'
  }

  if (error.code === '42501') {
    return 'Supabase is blocking task access. Run the updated policies in supabase/tasks.sql, then refresh.'
  }

  if (error.code === '23503') {
    return 'Supabase could not link this task to your account. Run the updated supabase/tasks.sql, then try again.'
  }

  return error.message ?? fallbackMessage
}

function TaskList({ user }) {
  const [tasks, setTasks] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [isSavingTask, setIsSavingTask] = useState(false)
  const [isDeletingTask, setIsDeletingTask] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  useEffect(() => {
    let ignore = false

    if (!user?.id) {
      setTasks([])
      setLoadError('')
      setIsLoading(false)
      return undefined
    }

    const loadTasks = async () => {
      setIsLoading(true)
      setLoadError('')

      try {
        const storedTasks = await fetchTasks(user.id)

        if (ignore) {
          return
        }

        setTasks(storedTasks)
      } catch (error) {
        if (ignore) {
          return
        }

        const message = getTaskErrorMessage(
          error,
          'Could not load tasks right now.',
        )

        setLoadError(message)
        setSnackbarState({
          open: true,
          message,
          severity: 'error',
        })
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadTasks()

    return () => {
      ignore = true
    }
  }, [user?.id])

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setSnackbarState((currentState) => ({
      ...currentState,
      open: false,
    }))
  }

  const openSnackbar = (message, severity = 'success') => {
    setSnackbarState({
      open: true,
      message,
      severity,
    })
  }

  const completedTasks = tasks.filter((task) => task.status === 'done').length
  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? null
  const filterCounts = {
    all: tasks.length,
    done: completedTasks,
    active: tasks.filter((task) => task.status === 'active').length,
    incomplete: tasks.filter((task) => task.status === 'incomplete').length,
  }
  const filteredTasks = sortTasksForTimeline(
    tasks.filter((task) => activeFilter === 'all' || task.status === activeFilter),
  )

  const handleAddTask = async ({
    title,
    description,
    deadline,
    priority,
    status,
  }) => {
    setIsAddingTask(true)

    try {
      const createdTask = await createTask(
        {
          title,
          description,
          deadline,
          priority,
          status,
        },
        user.id,
      )

      setTasks((currentTasks) => [createdTask, ...currentTasks])
      setLoadError('')
      setIsDialogOpen(false)
      openSnackbar('Task added successfully!')
      return true
    } catch (error) {
      openSnackbar(
        getTaskErrorMessage(error, 'Could not add the task right now.'),
        'error',
      )
      return false
    } finally {
      setIsAddingTask(false)
    }
  }

  const persistTaskUpdate = async (updatedTask, successMessage) => {
    setIsSavingTask(true)

    try {
      const savedTask = await updateTask(updatedTask, user.id)

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === savedTask.id ? savedTask : task)),
      )
      setLoadError('')
      openSnackbar(successMessage)
      return true
    } catch (error) {
      openSnackbar(
        getTaskErrorMessage(error, 'Could not update the task right now.'),
        'error',
      )
      return false
    } finally {
      setIsSavingTask(false)
    }
  }

  const handleUpdateTask = async (updatedTask) =>
    persistTaskUpdate(updatedTask, 'Task updated successfully!')

  const handleToggleTaskDone = async (task, isDone) =>
    persistTaskUpdate(
      {
        ...task,
        status: isDone ? 'done' : 'incomplete',
      },
      isDone ? 'Task marked as done!' : 'Task marked as incomplete!',
    )

  const handleDeleteTask = async (taskId) => {
    setIsDeletingTask(true)

    try {
      await deleteTask(taskId, user.id)

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      )
      setSelectedTaskId(null)
      setLoadError('')
      openSnackbar('Task deleted successfully!', 'info')
      return true
    } catch (error) {
      openSnackbar(
        getTaskErrorMessage(error, 'Could not delete the task right now.'),
        'error',
      )
      return false
    } finally {
      setIsDeletingTask(false)
    }
  }

  return (
    <>
      <section className="task-list-box">
        <header className="task-list-box__header">
          <div>
            <p className="task-list-box__eyebrow">Task board</p>
            <h2>Tasks</h2>
            <p className="task-list-box__subtext">
              Keep everything organized in your private workspace.
            </p>
          </div>
          <div className="task-list-box__header-actions">
            <span className="task-list-box__badge">
              {completedTasks}/{tasks.length} done
            </span>
            <button
              type="button"
              className="task-list-box__button"
              onClick={() => setIsDialogOpen(true)}
            >
              <span className="task-list-box__button-icon" aria-hidden="true">
                +
              </span>
              Add Task
            </button>
          </div>
        </header>

        <FilterButton
          activeFilter={activeFilter}
          counts={filterCounts}
          onFilterChange={setActiveFilter}
        />

        <div className="task-list-box__scroll">
          <ul className="task-list" aria-label="Task list">
            {isLoading ? (
              <li className="task-list__empty">Loading tasks...</li>
            ) : filteredTasks.length === 0 ? (
              <li className="task-list__empty">
                {loadError || emptyStateMessages[activeFilter]}
              </li>
            ) : (
              filteredTasks.map((task) => (
                <li key={task.id} className="task-list__item">
                  <div className="task-item-shell">
                    <input
                      type="checkbox"
                      className="task-item__checkbox"
                      checked={task.status === 'done'}
                      disabled={isSavingTask || isDeletingTask}
                      onChange={(event) => {
                        void handleToggleTaskDone(task, event.target.checked)
                      }}
                      aria-label={
                        task.status === 'done'
                          ? `Mark ${task.title} as not done`
                          : `Mark ${task.title} as done`
                      }
                    />

                    <button
                      type="button"
                      className={`task-item task-item--${task.status}`}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <span className="task-item__marker" aria-hidden="true" />
                      <div
                        className={`task-item__content${task.status === 'done' ? ' task-item__content--done' : ''}`}
                      >
                        <h3>{task.title}</h3>
                        <p>{task.description || 'No description added yet.'}</p>
                      </div>
                      <section
                        className={`task-item__status task-item__status--${task.status}`}
                        aria-label={`Task status ${taskStatusLabels[task.status]}`}
                      >
                        <span>Status</span>
                        <strong>{taskStatusLabels[task.status]}</strong>
                      </section>
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>

      <AddTask
        isOpen={isDialogOpen}
        isSubmitting={isAddingTask}
        onClose={() => setIsDialogOpen(false)}
        onAddTask={handleAddTask}
      />

      <Desc
        task={selectedTask}
        isSaving={isSavingTask}
        isDeleting={isDeletingTask}
        onClose={() => setSelectedTaskId(null)}
        onDeleteTask={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
      />

      <Snackbar
        open={snackbarState.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarState.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default TaskList
