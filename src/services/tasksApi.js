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

function serializeTask(task, userId) {
  return {
    ...(userId ? { user_id: userId } : {}),
    title: task.title.trim(),
    description: task.description?.trim() || null,
    deadline: task.deadline || null,
    priority: task.priority ?? DEFAULT_PRIORITY,
    status: task.status ?? DEFAULT_STATUS,
  }
}

export async function fetchTasks(userId) {
  let query = supabase
    .from(TASKS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data.map(normalizeTask)
}

export async function createTask(task, userId) {
  const { data, error } = await supabase
    .from(TASKS_TABLE)
    .insert(serializeTask(task, userId))
    .select()
    .single()

  if (error) {
    throw error
  }

  return normalizeTask(data)
}

export async function updateTask(task, userId) {
  const { id, ...taskFields } = task

  let query = supabase
    .from(TASKS_TABLE)
    .update(serializeTask(taskFields, userId))
    .eq('id', id)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query.select().single()

  if (error) {
    throw error
  }

  return normalizeTask(data)
}

export async function deleteTask(taskId, userId) {
  let query = supabase.from(TASKS_TABLE).delete().eq('id', taskId)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { error } = await query

  if (error) {
    throw error
  }
}
