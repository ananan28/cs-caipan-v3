import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { detectionItems, getItemsByInputType, getGroups, groupLabels, getChildren } from '../../config/detectionItems'
import { DetectionItem } from '../../config/detectionItems'

const CHECKNUMBER_KEY = 'x1HKsVAfzYU7esiTNpVaiEjifBHhQNOMynMG2R9qCDbrF5c9mqPLnskXQDbe'

// 通过代理调用 CheckNumber API
const callCheckNumber = async (path: string, options: any = {}) => {
  const response = await fetch('/api/checknumber', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path,
      method: options.method || 'POST',
      data: options.data,
      headers: options.headers || {}
    })
  })
  return response.json()
}

// 中文映射
const categoryMap: Record<string, string> = {
  'individual portrait': '个人肖像',
  'group photo': '合照',
  'landscape': '风景',
  'cartoon avatar': '动漫头像',
  'pet avatar': '宠物头像',
  'object': '物品',
}

const genderMap: Record<string, string> = {
  male: '男',
  female: '女',
  unknown: '未知'
}

const mapResult = (row: any) => ({
  ...row,
  category: categoryMap[row.category] || row.category || '-',
  gender: genderMap[row.gender] || row.gender || '-',
  activated: row.activated === 'yes' ? '已注册' : row.activated === 'no' ? '未注册' : row.activated || '-'
})

export const CreateTask = () => {
  const [inputType] = useState<'phone' | 'username'>('phone')
  const [inputText, setInputText] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['whatsapp']))
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [taskCreated, setTaskCreated] = useState(false)

  const toggleGroup = (group: string) => {
    const newSet = new Set(expandedGroups)
    if (newSet.has(group)) newSet.delete(group)
    else newSet.add(group)
    setExpandedGroups(newSet)
  }

  const toggleItem = (id: string) => {
    const newSet = new Set(selectedItems)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedItems(newSet)
  }

  const toggleAllInGroup = (group: string, items: DetectionItem[]) => {
    const allSelected = items.every(item => selectedItems.has(item.id))
    const newSet = new Set(selectedItems)
    items.forEach(item => {
      if (allSelected) newSet.delete(item.id)
      else newSet.add(item.id)
    })
    setSelectedItems(newSet)
  }

  const groups = getGroups(inputType)
  const filteredItems = getItemsByInputType(inputType)

  const calculateTotal = () => {
    let total = 0
    selectedItems.forEach(id => {
      const item = detectionItems.find(i => i.id === id)
      if (item) total += item.price
    })
    return total
  }

  const getItemsForGroup = (group: string) => filteredItems.filter(item => item.group === group)
  const getMainItems = (group: string) => getItemsForGroup(group).filter(item => !item.parent)
  const getChildItems = (group: string, parent: string) => getItemsForGroup(group).filter(item => item.parent === parent)

  const numbers = inputText.split('\n').filter(line => line.trim()).length

  // ========== 核心检测逻辑（通过代理） ==========
  const runDetection = async (phoneList: string[]) => {
    console.log('🚀 开始检测，号码数量:', phoneList.length)
    
    const fileContent = phoneList.join('\n')
    const file = new Blob([fileContent], { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', file, 'numbers.txt')
    formData.append('task_type', 'ws_avatar')

    // 通过代理提交任务
    const submitRes = await fetch('/api/checknumber', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: '/v1/tasks',
        method: 'POST',
        data: formData
      })
    })
    const submitData = await submitRes.json()
    console.log('📤 提交响应:', submitData)
    
    const taskId = submitData.task_id
    if (!taskId) throw new Error('提交任务失败: ' + JSON.stringify(submitData))

    // 轮询结果
    let status = 'pending'
    let resultUrl = null
    let attempts = 0
    while (status !== 'exported' && status !== 'failed' && attempts < 60) {
      await new Promise(r => setTimeout(r, 3000))
      attempts++
      const statusRes = await callCheckNumber('/v1/gettasks', {
        method: 'POST',
        data: { task_id: taskId }
      })
      status = statusRes.status
      resultUrl = statusRes.result_url
      console.log(`📊 状态: ${status} (${attempts * 3}s)`)

      if (status === 'exported' && resultUrl) {
        const resultRes = await fetch(resultUrl)
        const text = await resultRes.text()
        const lines = text.split('\n').filter((l: string) => l.trim())
        if (lines.length < 2) return []
        const headers = lines[0].split(',').map((h: string) => h.trim())
        return lines.slice(1).map((line: string) => {
          const values = line.split(',').map((v: string) => v.trim())
          const obj: any = {}
          headers.forEach((h: string, i: number) => { obj[h] = values[i] || '' })
          return mapResult(obj)
        })
      }
    }
    throw new Error('检测超时或失败')
  }

  const handleCreateTask = async () => {
    if (numbers === 0) { alert('请先输入号码'); return }
    if (selectedItems.size === 0) { alert('请至少选择一个检测项目'); return }

    setLoading(true)
    setTaskCreated(false)

    try {
      const phoneList = inputText.split('\n').filter(line => line.trim())
      const itemsList = Array.from(selectedItems)

      console.log('📋 选中的检测项:', itemsList)

      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id

      // 创建任务记录
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          user_id: userId,
          phone_numbers: phoneList,
          platform: 'multi',
          items: itemsList,
          total_price: calculateTotal() * phoneList.length,
          status: 'processing',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (taskError) { alert('创建任务失败: ' + taskError.message); setLoading(false); return }

      const taskId = taskData.id

      // 执行检测
      let detectResults = []
      if (itemsList.includes('whatsapp_avatar') || itemsList.includes('whatsapp_avatar_analysis')) {
        detectResults = await runDetection(phoneList)
      } else {
        // 简单运营商检测
        const apiKey = 'bab02f58c001a0fa5108b92d17c6fc2b'
        for (const phone of phoneList) {
          const res = await fetch(`https://apilayer.net/api/validate?access_key=${apiKey}&number=${phone}&country_code=US&format=1`)
          const data = await res.json()
          detectResults.push({ phone, carrier: data.carrier || '未知', location: data.location || '未知' })
        }
      }

      // 更新任务状态
      await supabase
        .from('tasks')
        .update({ status: 'completed', completed_at: new Date().toISOString(), results: detectResults })
        .eq('id', taskId)

      setResults(detectResults)
      setTaskCreated(true)
      alert(`✅ 检测完成！共检测 ${detectResults.length} 个号码`)

    } catch (error: any) {
      alert('❌ 检测失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto text-yellow-400">
      <h1 className="text-2xl font-bold text-white mb-6">📋 创建检测任务</h1>

      <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700/50">
        <p className="text-gray-300 text-sm mb-3">检测方式：</p>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input type="radio" name="inputType" checked={inputType === 'phone'} readOnly className="w-4 h-4 accent-yellow-400" />
            手机号检测
          </label>
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input type="radio" name="inputType" disabled className="w-4 h-4 accent-yellow-400" />
            用户名检测
          </label>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700/50">
        <p className="text-gray-300 text-sm mb-2">请输入号码，每行一个：</p>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="13053450262&#10;13053450263"
          className="w-full h-32 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-400"
        />
        <p className="text-xs text-gray-500 mt-1">共 {numbers} 个号码</p>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white font-medium">📋 检测项目</p>
          <span className="text-xs text-gray-500">已选 {selectedItems.size} 项</span>
        </div>
        {groups.map(group => {
          const items = getItemsForGroup(group)
          const mainItems = items.filter(item => !item.parent)
          const allSelected = items.every(item => selectedItems.has(item.id))
          const hasParent = items.some(item => item.parent)
          const isExpanded = expandedGroups.has(group)
          return (
            <div key={group} className="mb-4 border-b border-gray-700/50 pb-4 last:border-0">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => toggleGroup(group)} className="text-white font-medium hover:text-yellow-400 transition flex items-center gap-2">
                  <span>{isExpanded ? '▼' : '▶'}</span>
                  <span>{groupLabels[group] || group}</span>
                </button>
                {items.length > 1 && (
                  <button onClick={() => toggleAllInGroup(group, items)} className="text-xs text-gray-400 hover:text-yellow-400 transition">
                    {allSelected ? '取消全选' : '全选'}
                  </button>
                )}
              </div>
              {isExpanded && (
                <div className="ml-6 space-y-1.5">
                  {hasParent ? (
                    mainItems.map(main => {
                      const children = getChildItems(group, main.id)
                      const allChildrenSelected = children.every(c => selectedItems.has(c.id))
                      return (
                        <div key={main.id} className="ml-4">
                          <div className="flex items-center gap-4 text-sm">
                            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                              <input type="checkbox" checked={allChildrenSelected} onChange={() => {
                                const newSet = new Set(selectedItems)
                                children.forEach(c => { if (allChildrenSelected) newSet.delete(c.id); else newSet.add(c.id) })
                                setSelectedItems(newSet)
                              }} className="w-3.5 h-3.5 accent-yellow-400" />
                              <span className="font-medium text-white">{main.label}</span>
                            </label>
                            <span className="text-xs text-gray-500">${main.price}/号码</span>
                          </div>
                          <div className="ml-6 mt-1 space-y-1">
                            {children.map(child => (
                              <label key={child.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                <input type="checkbox" checked={selectedItems.has(child.id)} onChange={() => toggleItem(child.id)} className="w-3.5 h-3.5 accent-yellow-400" />
                                <span>{child.label}</span>
                                <span className="text-xs text-gray-500">${child.price}/号码</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    items.map(item => (
                      <label key={item.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer ml-4">
                        <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => toggleItem(item.id)} className="w-3.5 h-3.5 accent-yellow-400" />
                        <span>{item.label}</span>
                        <span className="text-xs text-gray-500">${item.price}/号码</span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-6">
            <div><p className="text-xs text-gray-500">号码数量</p><p className="text-lg font-bold text-white">{numbers}</p></div>
            <div><p className="text-xs text-gray-500">已选检测项</p><p className="text-lg font-bold text-white">{selectedItems.size}</p></div>
            <div><p className="text-xs text-gray-500">总费用</p><p className="text-lg font-bold text-yellow-400">${(calculateTotal() * numbers).toFixed(2)}</p></div>
          </div>
          <button onClick={handleCreateTask} disabled={loading || numbers === 0 || selectedItems.size === 0} className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition disabled:opacity-50">
            {loading ? '检测中...' : '创建任务'}
          </button>
        </div>
      </div>

      {taskCreated && results.length > 0 && (
        <div className="bg-gray-800/50 rounded-lg p-4 mt-6 border border-green-500/50">
          <h3 className="text-white font-medium mb-3">✅ 检测结果</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-300">号码</th>
                  <th className="px-3 py-2 text-left text-gray-300">注册状态</th>
                  <th className="px-3 py-2 text-left text-gray-300">头像类型</th>
                  <th className="px-3 py-2 text-left text-gray-300">性别</th>
                  <th className="px-3 py-2 text-left text-gray-300">年龄</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 20).map((r, idx) => (
                  <tr key={idx} className="border-t border-gray-700/30">
                    <td className="px-3 py-2 text-white text-xs font-mono">{r.phone}</td>
                    <td className="px-3 py-2 text-gray-300 text-xs">{r.activated || '-'}</td>
                    <td className="px-3 py-2 text-gray-300 text-xs">{r.category || '-'}</td>
                    <td className="px-3 py-2 text-gray-300 text-xs">{r.gender || '-'}</td>
                    <td className="px-3 py-2 text-gray-300 text-xs">{r.age || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
