import { supabase } from '../lib/supabase'

export const logAction = async (
  action: string,
  userId: string,
  details: any = {}
) => {
  try {
    await supabase
      .from('logs')
      .insert({
        action,
        user_id: userId,
        details: JSON.stringify(details),
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('日志写入失败:', error)
  }
}

export const logError = async (error: Error, context: string) => {
  try {
    await supabase
      .from('logs')
      .insert({
        action: 'error',
        details: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context
        }),
        created_at: new Date().toISOString()
      })
  } catch (e) {
    console.error('错误日志写入失败:', e)
  }
}
