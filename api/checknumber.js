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
    
    // 解析请求体（支持 FormData）
    const contentType = req.headers['content-type'] || ''
    let path, method, data
    
    if (contentType.includes('multipart/form-data')) {
      // 使用 formidable 或直接透传
      // 简化处理：只处理 JSON
      return res.status(400).json({ error: 'Please use JSON format' })
    }
    
    const body = req.body
    path = body.path
    method = body.method || 'POST'
    data = body.data
    
    const url = `${BASE_URL}${path}`
    
    const fetchOptions = {
      method: method,
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
    
    try {
      const jsonData = JSON.parse(responseData)
      res.status(response.status).json(jsonData)
    } catch {
      res.status(response.status).send(responseData)
    }
  } catch (error) {
    res.status(500).json({ error: '代理请求失败', details: String(error) })
  }
}
