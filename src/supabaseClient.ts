import { createClient } from '@supabase/supabase-js'

// Replace with your actual project URL from your Supabase Dashboard
const supabaseUrl = 'https://sxftnugfaxiotrbzraym.supabase.co' 

// Replace with your actual anon public key from your Supabase Dashboard
const supabaseAnonKey = 'sb_publishable_77mipSE4vAivfyVb51RuMA_riWhTAMc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)