import { config } from 'dotenv'
config()

import { supabase } from './lib/supabase'

async function testConnection() {
  console.log('URL:', import.meta.env?.VITE_SUPABASE_URL || '未加载')
  const { data, error } = await supabase.from('users').select('*').limit(1)
  if (error) {
    console.error('❌ 连接失败:', error.message)
  } else {
    console.log('✅ 连接成功! 数据:', data)
  }
}

testConnection()
