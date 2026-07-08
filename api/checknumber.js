export default async function handler(req, res) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const API_KEY = 'x1HKsVAfzYU7esiTNpVaiEjifBHhQNOMynMG2R9qCDbrF5c9mqPLnskXQDbe'
    const BASE_URL = 'https://api.checknumber.ai'
    
    const { path, method, data } = req.body
    
    const url = `${BASE_URL}${path}`
    
    // 如果是提交任务，需要特殊处理
    if (path === '/v1/tasks' && data?.file) {
      // 使用 FormData 发送文件
      const formData = new FormData()
      const fileContent = data.file
      const file = new Blob([fileContent], { type: 'text/plain' })
      formData.append('file', file, 'numbers.txt')
      formData.append('task_type', data.task_type || 'ws_avatar')
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'X-API-Key': API_KEY },
        body: formData
      })
      const responseData = await response.text()
      return res.status(response.status).send(responseData)
    }
    
    // 其他请求（如查询状态）
    const fetchOptions = {
      method: method || 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json'
      }
    }
    
    if (data) {
      fetchOptions.body = JSON.stringify(data)
    }
    
    const response = await fetch(url, fetchOptions)
    const responseData = await response.text()
    
    res.status(response.status).send(responseData)
  } catch (error) {
    res.status(500).json({ error: '代理请求失败', details: String(error) })
  }
}
