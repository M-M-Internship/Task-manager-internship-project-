import { supabase } from '../createClient.js'

const TASKS_TABLE = 'tasks'
const DEFAULT_PRIORITY = 'Medium'
const DEFAULT_STATUS = 'incomplete'

function normalizeTask(task) {
  return {
    ...task,
    description: task.description ?? '',
    deadline: task.deadline ?? '',
    priority: task.priority ?? DEFAULT_PRIORITY,
    status: task.status ?? DEFAULT_STATUS,
  }
}

function serializeTask(task) {
  return {
    title: task.title.trim(),
    description: task.description?.trim() || null,
    deadline: task.deadline || null,
    priority: task.priority ?? DEFAULT_PRIORITY,
    status: task.status ?? DEFAULT_STATUS,
  }
}

export async function fetchTasks() {
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data.map(normalizeTask)
}

export async function createTask(task) {
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .insert(serializeTask(task))
    .select()
    .single()

  if (error) {
    throw error
  }

  return normalizeTask(data)
}

export async function updateTask(task) {
  const { id, ...taskFields } = task

  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .update(serializeTask(taskFields))
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return normalizeTask(data)
}

export async function deleteTask(taskId) {
  const { error } = await supabase.from(TASKS_TABLE).delete().eq('id', taskId)

  if (error) {
    throw error
  }
}
