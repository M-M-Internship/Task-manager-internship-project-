import { useState } from 'react'
import AddTask from '../../components/AddTask.jsx'
import Desc from '../../components/Desc.jsx'
import FilterButton from '../../components/FilterButton.jsx'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

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

const initialTasks = [
  {
    id: 1,
    title: 'Design the dashboard layout',
    description: 'UI planning',
    deadline: '2026-03-14',
    priority: 'High',
    status: 'done',
  },
  {
    id: 2,
    title: 'Build the add-task form',
    description: 'Component work',
    deadline: '2026-03-16',
    priority: 'Medium',
    status: 'active',
  },
  {
    id: 3,
    title: 'Connect local task state',
    description: 'React logic',
    deadline: '2026-03-18',
    priority: 'High',
    status: 'incomplete',
  },
  {
    id: 4,
    title: 'Polish mobile spacing',
    description: 'Responsive pass',
    deadline: '2026-03-19',
    priority: 'Low',
    status: 'done',
  },
]

function TaskList() {
  const [tasks, setTasks] = useState(initialTasks)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const completedTasks = tasks.filter((task) => task.status === 'done').length
  const selectedTask =
    tasks.find((task) => task.id === selectedTaskId) ?? null
  const filterCounts = {
    all: tasks.length,
    done: completedTasks,
    active: tasks.filter((task) => task.status === 'active').length,
    incomplete: tasks.filter((task) => task.status === 'incomplete').length,
  }
  const filteredTasks = tasks.filter(
    (task) => activeFilter === 'all' || task.status === activeFilter,
  )

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

  const handleAddTask = ({
    title,
    description,
    deadline,
    priority,
    status,
  }) => {
    setTasks((currentTasks) => [
      {
        id: Date.now(),
        title,
        description,
        deadline,
        priority,
        status,
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
          <div >
            <h2 >Tasks </h2>
          </div>
          <span className="task-list-box__badge">
            {completedTasks}/{tasks.length} done
          </span>
        </header>

        <FilterButton
          activeFilter={activeFilter}
          counts={filterCounts}
          onFilterChange={setActiveFilter}
        />

        <ul className="task-list" aria-label="Task list">
          {filteredTasks.length === 0 ? (
            <li className="task-list__empty">{emptyStateMessages[activeFilter]}</li>
          ) : (
            filteredTasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  className={`task-item task-item--${task.status}`}
                  onClick={() => setSelectedTaskId(task.id)}
                >
                  <span className="task-item__marker" aria-hidden="true" />
                  <div className="task-item__content">
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
              </li>
            ))
          )}
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
