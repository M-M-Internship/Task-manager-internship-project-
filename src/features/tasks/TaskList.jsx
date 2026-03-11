import { useState } from 'react'
import AddTask from '../../components/AddTask.jsx'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

const initialTasks = [
  {
    id: 1,
    title: 'Design the dashboard layout',
    description: 'UI planning',
    done: true,
  },
  {
    id: 2,
    title: 'Build the add-task form',
    description: 'Component work',
    done: false,
  },
  {
    id: 3,
    title: 'Connect local task state',
    description: 'React logic',
    done: false,
  },
  {
    id: 4,
    title: 'Polish mobile spacing',
    description: 'Responsive pass',
    done: true,
  },
]

function TaskList() {
  const [tasks, setTasks] = useState(initialTasks)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false)
  const completedTasks = tasks.filter((task) => task.done).length

  const handleSnackbarClose = (_, reason) => {
    if (reason === 'clickaway') {
      return
    }

    setIsSnackbarOpen(false)
  }

  const handleAddTask = ({ title, description }) => {
    setTasks((currentTasks) => [
      {
        id: Date.now(),
        title,
        description,
        done: false,
      },
      ...currentTasks,
    ])
    setIsDialogOpen(false)
    setIsSnackbarOpen(true)
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
            <li
              key={task.id}
              className={`task-item${task.done ? ' task-item--done' : ''}`}
            >
              <span className="task-item__marker" aria-hidden="true" />
              <div className="task-item__content">
                <h3>{task.title}</h3>
                {task.description ? <p>{task.description}</p> : null}
              </div>
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

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Task added successfully!
        </Alert>
      </Snackbar>
    </>
  )
}

export default TaskList
