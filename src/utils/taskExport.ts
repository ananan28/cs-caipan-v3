import { supabase } from '../lib/supabase'
import { exportToCSV } from './export'

export const exportTaskResults = async (taskId: string) => {
  const { data, error } = await supabase
    .from('task_results')
    .select('*')
    .eq('task_id', taskId)

  if (error) {
    console.error('导出失败:', error)
    return
  }

  if (data && data.length > 0) {
    exportToCSV(data, `task_${taskId}_results`, ['phone', 'status', 'result', 'checked_at'])
  }
}
