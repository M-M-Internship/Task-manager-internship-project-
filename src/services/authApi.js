import { supabase } from '../createClient.js'

function getEmailRedirectUrl() {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.location.origin
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw error
  }

  return data.session ?? null
}

export function onAuthStateChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session ?? null)
  })

  return data.subscription
}

export async function signInWithPassword({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signUpWithPassword({ email, password, username = '' }) {
  const emailRedirectTo = getEmailRedirectUrl()
  const normalizedUsername = username.trim()
  const options = {
    ...(emailRedirectTo ? { emailRedirectTo } : {}),
    ...(normalizedUsername
      ? {
          data: {
            username: normalizedUsername,
            full_name: normalizedUsername,
          },
        }
      : {}),
  }
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: Object.keys(options).length > 0 ? options : undefined,
  })

  if (error) {
    throw error
  }

  return data
}

export async function sendEmailOtp(email) {
  const emailRedirectTo = getEmailRedirectUrl()
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: {
      shouldCreateUser: true,
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function verifyEmailOtp({ email, token }) {
  const { data, error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: token.trim(),
    type: 'email',
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function updateUserProfile({ username }) {
  const normalizedUsername = username.trim()
  const { data, error } = await supabase.auth.updateUser({
    data: {
      username: normalizedUsername,
      full_name: normalizedUsername,
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function updateUserPassword(password) {
  const { data, error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    throw error
  }

  return data
}
