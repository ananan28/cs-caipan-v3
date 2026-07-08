export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { path, method = 'POST', data, headers = {} } = req.body
    const API_KEY = 'x1HKsVAfzYU7esiTNpVaiEjifBHhQNOMynMG2R9qCDbrF5c9mqPLnskXQDbe'
    const BASE_URL = 'https://api.checknumber.ai'
    
    const url = `${BASE_URL}${path}`
    
    const fetchOptions = {
      method: method,
      headers: {
        'X-API-Key': API_KEY,
        ...headers
      }
    }
    
    if (data instanceof FormData) {
      fetchOptions.body = data
      delete fetchOptions.headers['Content-Type']
    } else {
      fetchOptions.headers['Content-Type'] = 'application/json'
      fetchOptions.body = JSON.stringify(data)
    }
    
    const response = await fetch(url, fetchOptions)
    const responseData = await response.text()
    
    res.status(response.status).json(JSON.parse(responseData))
  } catch (error) {
    res.status(500).json({ error: '代理请求失败', details: String(error) })
  }
}
