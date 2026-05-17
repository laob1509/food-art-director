import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yclvvfapkdwltayiuiivy.supabase.co'

const supabaseKey = 'sb_publishable_TWC_5XNeYcksnMg5i6Grkw_DKqtG_K_'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)