// 测试 CheckNumber API
const API_KEY = 'cWnzoofrnN4JKtGdPJwanfpbnInYdMrXuBCXBqUMloVp3FntcdhwsZezZjhE'
const BASE_URL = 'https://api.checknumber.ai'

async function testDetect() {
  const phones = ['+14072220001', '+14072220002']
  const taskType = 'ws'
  
  console.log('📤 提交任务...')
  
  // 1. 提交任务
  const formData = new FormData()
  const fileContent = phones.join('\n')
  const file = new Blob([fileContent], { type: 'text/plain' })
  formData.append('file', file, 'numbers.txt')
  formData.append('task_type', taskType)
  
  const submitRes = await fetch(`${BASE_URL}/v1/tasks`, {
    method: 'POST',
    headers: { 'X-API-Key': API_KEY },
    body: formData
  })
  
  const submitData = await submitRes.json()
  const taskId = submitData.task_id
  console.log('✅ 任务已提交:', taskId)
  
  // 2. 轮询结果
  let status = 'pending'
  let resultUrl = null
  
  while (status !== 'exported' && status !== 'failed') {
    await new Promise(r => setTimeout(r, 3000))
    
    const statusRes = await fetch(`${BASE_URL}/v1/gettasks`, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `task_id=${taskId}`
    })
    
    const statusData = await statusRes.json()
    status = statusData.status
    resultUrl = statusData.result_url
    
    console.log(`📊 状态: ${status} (${statusData.processed || 0}/${statusData.total || '?'})`)
  }
  
  if (resultUrl) {
    const resultRes = await fetch(resultUrl)
    const resultText = await resultRes.text()
    console.log('📄 结果:\n', resultText)
  }
}

testDetect().catch(err => console.error('❌ 错误:', err.message))
