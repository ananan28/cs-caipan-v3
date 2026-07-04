export const detectPhone = async (phone: string) => {
  const apiKey = 'bab02f58c001a0fa5108b92d17c6fc2b'
  
  try {
    const response = await fetch(
      `https://apilayer.net/api/validate?access_key=${apiKey}&number=${phone}&country_code=US&format=1`
    )
    
    if (!response.ok) {
      throw new Error('API 请求失败')
    }
    
    const data = await response.json()
    
    return {
      phone,
      valid: data.valid,
      carrier: data.carrier || '未知',
      location: data.location || '未知',
      line_type: data.line_type || '未知',
      country: data.country_name || '未知'
    }
  } catch (error) {
    console.error('检测失败:', error)
    return {
      phone,
      error: '检测失败'
    }
  }
}

// 批量检测
export const detectBatch = async (phones: string[]) => {
  const results = []
  for (const phone of phones) {
    const result = await detectPhone(phone)
    results.push(result)
  }
  return results
}
