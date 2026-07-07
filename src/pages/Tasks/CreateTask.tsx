import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { detectionItems, getItemsByInputType, getGroups, groupLabels, getChildren } from '../../config/detectionItems'
import { DetectionItem } from '../../config/detectionItems'

// 直接调用 Numverify API
const detectPhone = async (phone: string) => {
  const apiKey = 'bab02f58c001a0fa5108b92d17c6fc2b'
  const url = `https://apilayer.net/api/validate?access_key=${apiKey}&number=${phone}&country_code=US&format=1`
  
  const response = await fetch(url)
  const data = await response.json()
  
  return {
    phone,
    valid: data.valid || false,
    carrier: data.carrier || '未知',
    location: data.location || '未知',
    line_type: data.line_type || '未知',
    country: data.country_name || '未知'
  }
}

// 中文映射
const categoryMap: Record<string, string> = {
  'individual portrait': '个人肖像',
  'group photo': '合照',
  'landscape': '风景',
  'cartoon avatar': '动漫头像',
  'pet avatar': '宠物头像',
  'object': '物品',
  'headless': '无头像'
}

const genderMap: Record<string, string> = {
  male: '男',
  female: '女',
  unknown: '未知'
}

const mapResult = (row: any) => {
  return {
    ...row,
    category: categoryMap[row.category] || row.category || '-',
    gender: genderMap[row.gender] || row.gender || '-',
    activated: row.activated === 'yes' ? '已注册' : row.activated === 'no' ? '未注册' : row.activated || '-'
  }
}

export const CreateTask = () => {
  const [inputType, setInputType] = useState<'phone' | 'username'>('phone')
  const [inputText, setInputText] = useState('')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['whatsapp', 'telegram']))
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [taskCreated, setTaskCreated] = useState(false)

  const toggleGroup = (group: string) => {
    const newSet = new Set(expandedGroups)
    if (newSet.has(group)) {
      newSet.delete(group)
    } else {
      newSet.add(group)
    }
    setExpandedGroups(newSet)
  }

  const toggleItem = (id: string) => {
    const newSet = new Set(selectedItems)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedItems(newSet)
  }

  const toggleAllInGroup = (group: string, items: DetectionItem[]) => {
    const allSelected = items.every(item => selectedItems.has(item.id))
    const newSet = new Set(selectedItems)
    items.forEach(item => {
      if (allSelected) {
        newSet.delete(item.id)
      } else {
        newSet.add(item.id)
      }
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

  const getItemsForGroup = (group: string) => {
    return filteredItems.filter(item => item.group === group)
  }

  const getMainItems = (group: string) => {
    return getItemsForGroup(group).filter(item => !item.parent)
  }

  const getChildItems = (group: string, parent: string) => {
    return getItemsForGroup(group).filter(item => item.parent === parent)
  }

  const numbers = inputText.split('\n').filter(line => line.trim()).length

  const handleCreateTask = async () => {
    console.log("handleCreateTask 被调用, selectedItems:", Array.from(selectedItems))
    if (numbers === 0) {
      alert('请先输入号码')
      return
    }

    if (selectedItems.size === 0) {
      alert('请至少选择一个检测项目')
      return
    }

    setLoading(true)
    setTaskCreated(false)

    try {
      const phoneList = inputText.split('\n').filter(line => line.trim())
      const itemsList = Array.from(selectedItems)

      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id

      // 1. 创建任务记录
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

      if (taskError) {
        alert('创建任务失败: ' + taskError.message)
        setLoading(false)
        return
      }

      const taskId = taskData.id
      let detectResults = []

      // 2. 检查是否需要头像检测
      const needAvatar = itemsList.some(id => 
        id === 'whatsapp_avatar' || id === 'whatsapp_avatar_analysis'
      )

      if (needAvatar) {
        // 使用 CheckNumber 进行头像检测
        const checknumberKey = 'x1HKsVAfzYU7esiTNpVaiEjifBHhQNOMynMG2R9qCDbrF5c9mqPLnskXQDbe'
        const fileContent = phoneList.join('\n')
        const file = new Blob([fileContent], { type: 'text/plain' })
        const formData = new FormData()
        formData.append('file', file, 'numbers.txt')
        formData.append('task_type', 'ws_avatar')

        const submitRes = await fetch('https://api.checknumber.ai/v1/tasks', {
          method: 'POST',
          headers: { 'X-API-Key': checknumberKey },
          body: formData
        })
        const submitData = await submitRes.json()
        const cnTaskId = submitData.task_id

        // 轮询结果
        let status = 'pending'
        let resultUrl = null
        while (status !== 'exported' && status !== 'failed') {
          await new Promise(r => setTimeout(r, 3000))
          const statusRes = await fetch('https://api.checknumber.ai/v1/gettasks', {
            method: 'POST',
            headers: {
              'X-API-Key': checknumberKey,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `task_id=${cnTaskId}`
          })
          const statusData = await statusRes.json()
          status = statusData.status
          resultUrl = statusData.result_url
        }

        if (resultUrl) {
          const resultRes = await fetch(resultUrl)
          const resultText = await resultRes.text()
          const lines = resultText.split('\n').filter(line => line.trim())
          const headers = lines[0].split(',').map(h => h.trim())
          detectResults = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim())
            const obj: any = {}
            headers.forEach((h, i) => { obj[h] = values[i] || '' })
            return mapResult(obj)
          })
        }
      } else {
        // 使用 Numverify 做运营商检测
        for (const phone of phoneList) {
          const result = await detectPhone(phone)
          detectResults.push(result)
        }
      }

      // 3. 更新任务状态
      await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          results: detectResults
        })
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
            <input
              type="radio"
              name="inputType"
              checked={inputType === 'phone'}
              onChange={() => setInputType('phone')}
              className="w-4 h-4 accent-yellow-400"
            />
            手机号检测
          </label>
          <label className="flex items-center gap-2 text-white cursor-pointer">
            <input
              type="radio"
              name="inputType"
              checked={inputType === 'username'}
              onChange={() => setInputType('username')}
              className="w-4 h-4 accent-yellow-400"
            />
            用户名检测
          </label>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700/50">
        <p className="text-gray-300 text-sm mb-2">请输入号码，每行一个：</p>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="+14072220001&#10;+14072220002"
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
                <button
                  onClick={() => toggleGroup(group)}
                  className="text-white font-medium hover:text-yellow-400 transition flex items-center gap-2"
                >
                  <span>{isExpanded ? '▼' : '▶'}</span>
                  <span>{groupLabels[group] || group}</span>
                </button>
                {items.length > 1 && (
                  <button
                    onClick={() => toggleAllInGroup(group, items)}
                    className="text-xs text-gray-400 hover:text-yellow-400 transition"
                  >
                    {allSelected ? '取消全选' : '全选'}
                  </button>
                )}
              </div>

              {isExpanded && (
                <div className="ml-6 space-y-1.5">
                  {hasParent ? (
                    <>
                      {mainItems.map(main => {
                        const children = getChildItems(group, main.id)
                        const allChildrenSelected = children.every(c => selectedItems.has(c.id))
                        return (
                          <div key={main.id} className="ml-4">
                            <div className="flex items-center gap-4 text-sm">
                              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={allChildrenSelected}
                                  onChange={() => {
                                    const newSet = new Set(selectedItems)
                                    children.forEach(c => {
                                      if (allChildrenSelected) {
                                        newSet.delete(c.id)
                                      } else {
                                        newSet.add(c.id)
                                      }
                                    })
                                    setSelectedItems(newSet)
                                  }}
                                  className="w-3.5 h-3.5 accent-yellow-400"
                                />
                                <span className="font-medium text-white">{main.label}</span>
                              </label>
                              <span className="text-xs text-gray-500">${main.price}/号码</span>
                            </div>
                            <div className="ml-6 mt-1 space-y-1">
                              {children.map(child => (
                                <label key={child.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.has(child.id)}
                                    onChange={() => toggleItem(child.id)}
                                    className="w-3.5 h-3.5 accent-yellow-400"
                                  />
                                  <span>{child.label}</span>
                                  <span className="text-xs text-gray-500">${child.price}/号码</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  ) : (
                    items.map(item => (
                      <label key={item.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer ml-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={() => toggleItem(item.id)}
                          className="w-3.5 h-3.5 accent-yellow-400"
                        />
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
            <div>
              <p className="text-xs text-gray-500">号码数量</p>
              <p className="text-lg font-bold text-white">{numbers}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">已选检测项</p>
              <p className="text-lg font-bold text-white">{selectedItems.size}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">总费用</p>
              <p className="text-lg font-bold text-yellow-400">${(calculateTotal() * numbers).toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={handleCreateTask}
            disabled={loading || numbers === 0 || selectedItems.size === 0}
            className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
                  <th className="px-3 py-2 text-left text-gray-300">运营商</th>
                  <th className="px-3 py-2 text-left text-gray-300">头像</th>
                  <th className="px-3 py-2 text-left text-gray-300">性别</th>
                  <th className="px-3 py-2 text-left text-gray-300">年龄</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 20).map((r, idx) => (
                  <tr key={idx} className="border-t border-gray-700/30">
                    <td className="px-3 py-2 text-white text-xs font-mono">{r.phone}</td>
                    <td className="px-3 py-2 text-gray-300 text-xs">{r.carrier || r.activated || '-'}</td>
                    <td className="px-3 py-2 text-gray-300 text-xs">{r.category || (r.has_avatar ? '有' : '无') || '-'}</td>
                    <td className="px-3 py-2 text-gray-300 text-xs">{r.gender || '-'}</td>
                    <td className="px-3 py-2 text-gray-300 text-xs">{r.age || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length > 20 && (
              <p className="text-xs text-gray-500 mt-2">显示前20条，共 {results.length} 条</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
