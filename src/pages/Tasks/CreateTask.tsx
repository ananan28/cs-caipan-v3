import { useState } from 'react'
import { detectionItems, getItemsByInputType, getGroups, groupLabels, getChildren } from '../../config/detectionItems'
import { DetectionItem } from '../../config/detectionItems'
import { DetectionService } from "../../services/detection/DetectionService"
import { DetectionService } from '../../services/detection/DetectionService'
import { supabase } from '../../lib/supabase'

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

      // 获取当前用户
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

      // 2. 调用检测API
      const detectionService = new DetectionService(); const detectResults = await detectionService.detectBatch(phoneList, itemsList); const result = { success: true, results: detectResults }

      if (result.success) {
        setResults(result.results)
        // 3. 更新任务状态为已完成
        await supabase
          .from('tasks')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', taskId)
        setTaskCreated(true)
        alert(`✅ 检测完成！共检测 ${result.results.length} 个号码`)
      } else {
        await supabase
          .from('tasks')
          .update({ status: 'failed', error: result.error })
          .eq('id', taskId)
        alert('❌ 检测失败: ' + (result.error || '未知错误'))
      }
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
        <p className="text-gray-300 text-sm mb-2">
          请输入{inputType === 'phone' ? '手机号' : '用户名'}，每行一个：
        </p>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={inputType === 'phone' ? '+14072220001\n+14072220002' : 'john_doe\njane_smith'}
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
                  <th className="px-3 py-2 text-left text-gray-300">虚拟号</th>
                  {selectedItems.has('whatsapp_registered') && (
                    <th className="px-3 py-2 text-left text-gray-300">WhatsApp</th>
                  )}
                  {selectedItems.has('telegram_registered') && (
                    <th className="px-3 py-2 text-left text-gray-300">Telegram</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 10).map((r, idx) => (
                  <tr key={idx} className="border-t border-gray-700/30">
                    <td className="px-3 py-2 text-white text-xs font-mono">{r.phone}</td>
                    <td className="px-3 py-2 text-gray-300 text-xs">{r.operator || '-'}</td>
                    <td className="px-3 py-2 text-gray-300 text-xs">{r.is_virtual ? '是' : '否'}</td>
                    {selectedItems.has('whatsapp_registered') && (
                      <td className="px-3 py-2 text-gray-300 text-xs">
                        {r.whatsapp?.registered ? '✅已注册' : '❌未注册'}
                      </td>
                    )}
                    {selectedItems.has('telegram_registered') && (
                      <td className="px-3 py-2 text-gray-300 text-xs">
                        {r.telegram?.registered ? '✅已注册' : '❌未注册'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length > 10 && (
              <p className="text-xs text-gray-500 mt-2">显示前10条，共 {results.length} 条</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
