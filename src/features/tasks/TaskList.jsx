import { useState } from 'react'
import AddTask from '../../components/AddTask.jsx'
import Desc from '../../components/Desc.jsx'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

const initialTasks = [
  {
    id: 1,
    title: 'Design the dashboard layout',
    description: 'UI planning',
    deadline: '2026-03-14',
    priority: 'High',
    done: true,
  },
  {
    id: 2,
    title: 'Build the add-task form',
    description: 'Component work',
    deadline: '2026-03-16',
    priority: 'Medium',
    done: false,
  },
  {
    id: 3,
    title: 'Connect local task state',
    description: 'React logic',
    deadline: '2026-03-18',
    priority: 'High',
    done: false,
  },
  {
    id: 4,
    title: 'Polish mobile spacing',
    description: 'Responsive pass',
    deadline: '2026-03-19',
    priority: 'Low',
    done: true,
  },
]

function TaskList() {
  const [tasks, setTasks] = useState(initialTasks)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const completedTasks = tasks.filter((task) => task.done).length
  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? null

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

  const handleAddTask = ({ title, description, deadline, priority }) => {
    setTasks((currentTasks) => [
      {
        id: Date.now(),
        title,
        description,
        deadline,
        priority,
        done: false,
      },
      ...currentTasks,
    ])
    setIsDialogOpen(false)
    openSnackbar('Task added successfully!')
  }

  const handleUpdateTask = (updatedTask) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      ),
    )
    openSnackbar('Task updated successfully!')
  }

  const handleDeleteTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    )
    setSelectedTaskId(null)
    openSnackbar('Task deleted successfully!', 'info')
  }

  return (
    <>
      <section className="task-list-box">
        <header className="task-list-box__header">
          <div>
            <h2>Task List</h2>
          </div>
          <span className="task-list-box__badge">
            {completedTasks}/{tasks.length} done
          </span>
        </header>

        <ul className="task-list" aria-label="Task list">
          {tasks.map((task) => (
            <li key={task.id}>
              <button
                type="button"
                className={`task-item${task.done ? ' task-item--done' : ''}`}
                onClick={() => setSelectedTaskId(task.id)}
              >
                <span className="task-item__marker" aria-hidden="true" />
                <div className="task-item__content">
                  <h3>{task.title}</h3>
                </div>
              </button>
            </li>
          ))}
        </ul>

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
      </section>

      <AddTask
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddTask={handleAddTask}
      />

      <Desc
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
        onDeleteTask={handleDeleteTask}
        onUpdateTask={handleUpdateTask}
      />

      <Snackbar
        open={snackbarState.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
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
