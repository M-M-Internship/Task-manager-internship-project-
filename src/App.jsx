import './App.css'
import TaskList from './features/tasks/TaskList.jsx'

function App() {
  return (
    <main className="layout">

      <section className="layout-panel layout-panel--center">
        <TaskList />
      </section>


    </main>
  )
}

export default App
