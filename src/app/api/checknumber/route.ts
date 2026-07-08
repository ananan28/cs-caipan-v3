import { NextRequest, NextResponse } from 'next/server'

const API_KEY = 'x1HKsVAfzYU7esiTNpVaiEjifBHhQNOMynMG2R9qCDbrF5c9mqPLnskXQDbe'
const BASE_URL = 'https://api.checknumber.ai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, method = 'POST', data, headers = {} } = body
    
    const url = `${BASE_URL}${path}`
    
    // 如果是 FormData，需要特殊处理
    let fetchOptions: any = {
      method: method,
      headers: {
        'X-API-Key': API_KEY,
        ...headers
      }
    }
    
    // 如果 data 是 FormData，直接使用
    if (data instanceof FormData) {
      fetchOptions.body = data
      // 删除 Content-Type，让浏览器自动设置 boundary
      delete fetchOptions.headers['Content-Type']
    } else {
      fetchOptions.headers['Content-Type'] = 'application/json'
      fetchOptions.body = JSON.stringify(data)
    }
    
    const response = await fetch(url, fetchOptions)
    
    // 获取响应数据
    const responseData = await response.text()
    
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
      }
    })
  } catch (error) {
    console.error('代理错误:', error)
    return NextResponse.json(
      { error: '代理请求失败', details: String(error) },
      { status: 500 }
    )
  }
}

// 处理 OPTIONS 请求（预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
    }
  })
}
