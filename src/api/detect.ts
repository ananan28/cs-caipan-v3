import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { phones } = req.body
  if (!phones || !Array.isArray(phones) || phones.length === 0) {
    return res.status(400).json({ error: '请提供号码列表' })
  }

  const results = []
  const apiKey = 'bab02f58c001a0fa5108b92d17c6fc2b'

  for (const phone of phones) {
    try {
      const response = await fetch(
        `https://apilayer.net/api/validate?access_key=${apiKey}&number=${phone}&country_code=US&format=1`
      )
      const data = await response.json()
      results.push({
        phone,
        valid: data.valid,
        carrier: data.carrier || '未知',
        location: data.location || '未知',
        line_type: data.line_type || '未知'
      })
    } catch (error) {
      results.push({ phone, error: '检测失败' })
    }
  }

  return res.status(200).json({ results })
}
