import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yclvvfapkdwltayiuiivy.supabase.co'

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljbHZ2ZmFwa2R3bHRheXVpaXZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzExMDMsImV4cCI6MjA5NDU0NzEwM30.O4fuDlL_KGPPO9WHaazrOtbkfO5KVpbVwpND5sVH0IA'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)