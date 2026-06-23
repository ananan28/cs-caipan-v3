import { supabase } from '@/lib/supabase'

// 用户管理
export const users = {
  getAll: () => supabase.from('users').select('*'),
  getById: (id: string) => supabase.from('users').select('*').eq('id', id).single(),
  create: (data: any) => supabase.from('users').insert(data),
  update: (id: string, data: any) => supabase.from('users').update(data).eq('id', id),
  delete: (id: string) => supabase.from('users').delete().eq('id', id),
}

// 钱包
export const wallets = {
  getAll: () => supabase.from('wallets').select('*'),
  getByUser: (userId: string) => supabase.from('wallets').select('*').eq('user_id', userId).single(),
  update: (id: string, data: any) => supabase.from('wallets').update(data).eq('id', id),
}

// 交易记录
export const transactions = {
  getAll: () => supabase.from('transactions').select('*'),
  getByUser: (userId: string) => supabase.from('transactions').select('*').eq('user_id', userId),
  create: (data: any) => supabase.from('transactions').insert(data),
  update: (id: string, data: any) => supabase.from('transactions').update(data).eq('id', id),
}

// 任务
export const tasks = {
  getAll: () => supabase.from('tasks').select('*'),
  getByUser: (userId: string) => supabase.from('tasks').select('*').eq('user_id', userId),
  create: (data: any) => supabase.from('tasks').insert(data),
  update: (id: string, data: any) => supabase.from('tasks').update(data).eq('id', id),
}

// 价格配置
export const priceConfigs = {
  getAll: () => supabase.from('price_configs').select('*'),
  getByCategory: (category: string) => supabase.from('price_configs').select('*').eq('category', category),
  update: (id: string, data: any) => supabase.from('price_configs').update(data).eq('id', id),
}
