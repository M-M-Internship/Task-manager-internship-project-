import { supabase } from '../createClient.js'

const SCHEDULES_TABLE = 'schedules'

function normalizeScheduleEntry(entry) {
  return {
    ...entry,
    notes: entry.notes ?? '',
    start_time: entry.start_time ?? '',
    end_time: entry.end_time ?? '',
    schedule_date: entry.schedule_date ?? '',
  }
}

function serializeScheduleEntry(entry, userId) {
  return {
    ...(userId ? { user_id: userId } : {}),
    title: entry.title.trim(),
    notes: entry.notes?.trim() || null,
    schedule_date: entry.schedule_date,
    start_time: entry.start_time,
    end_time: entry.end_time,
  }
}

export async function fetchScheduleEntries(userId, scheduleDate) {
  let query = supabase
    .from(SCHEDULES_TABLE)
    .select('*')
    .eq('schedule_date', scheduleDate)
    .order('start_time', { ascending: true })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data.map(normalizeScheduleEntry)
}

export async function createScheduleEntry(entry, userId) {
  const { data, error } = await supabase
    .from(SCHEDULES_TABLE)
    .insert(serializeScheduleEntry(entry, userId))
    .select()
    .single()

  if (error) {
    throw error
  }

  return normalizeScheduleEntry(data)
}

export async function updateScheduleEntry(entry, userId) {
  const { id, ...entryFields } = entry

  let query = supabase
    .from(SCHEDULES_TABLE)
    .update(serializeScheduleEntry(entryFields, userId))
    .eq('id', id)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query.select().single()

  if (error) {
    throw error
  }

  return normalizeScheduleEntry(data)
}

export async function deleteScheduleEntry(entryId, userId) {
  let query = supabase.from(SCHEDULES_TABLE).delete().eq('id', entryId)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { error } = await query

  if (error) {
    throw error
  }
}
