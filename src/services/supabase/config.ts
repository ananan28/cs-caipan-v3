import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fuqhvyqxibepmbauohmh.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_u9QnRIiwzP0R6KhlHWfTlw_tujryeF6'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const TABLES = {
  USERS: 'users',
  WALLET_TRANSACTIONS: 'wallet_transactions',
  TRANSFERS: 'transfers',
  TASKS: 'tasks',
  TICKETS: 'tickets',
  ANNOUNCEMENTS: 'announcements',
  INVITES: 'invites',
  SETTINGS: 'settings',
  LOGS: 'logs',
  FEATURES: 'features',
  API_PROVIDERS: 'api_providers',
  PACKAGES: 'packages',
  ORDERS: 'orders',
}

export default supabase
