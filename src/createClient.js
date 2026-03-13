import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ??
  'https://kbsgzwcabgfbdavsijep.supabase.co'
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  'sb_publishable_8gY05SX3XjRh_8LmgeVaHw_qy9whYB-'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
