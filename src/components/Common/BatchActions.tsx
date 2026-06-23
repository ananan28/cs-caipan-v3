import { useState } from 'react'
import { Button } from './Button'
import { CheckSquare, Square, Trash2, Ban, Check, X, Users } from 'lucide-react'
import toast from 'react-hot-toast'

interface BatchActionsProps {
  selected: string[]
  onSelectAll: () => void
  onClear: () => void
  onDelete: (ids: string[]) => void
  onFreeze: (ids: string[]) => void
  onActivate: (ids: string[]) => void
  total: number
  label?: string
}

export const BatchActions = ({
  selected,
  onSelectAll,
  onClear,
  onDelete,
  onFreeze,
  onActivate,
  total,
  label = '项目',
}: BatchActionsProps) => {
  const allSelected = selected.length === total && total > 0

  const handleDelete = () => {
    if (selected.length === 0) { toast.error('请先选择项目'); return }
    if (confirm(`确定要删除选中的 ${selected.length} 个${label}吗？`)) {
      onDelete(selected)
      toast.success(`✅ 已删除 ${selected.length} 个${label}`)
    }
  }

  const handleFreeze = () => {
    if (selected.length === 0) { toast.error('请先选择项目'); return }
    onFreeze(selected)
    toast.success(`✅ 已冻结 ${selected.length} 个${label}`)
  }

  const handleActivate = () => {
    if (selected.length === 0) { toast.error('请先选择项目'); return }
    onActivate(selected)
    toast.success(`✅ 已激活 ${selected.length} 个${label}`)
  }

  if (selected.length === 0) return null

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue/10 border border-blue/30 flex-wrap">
      <button onClick={onSelectAll} className="text-muted hover:text-white">
        {allSelected ? <CheckSquare size={18} /> : <Square size={18} />}
      </button>
      <span className="text-sm text-white">已选 {selected.length} 项</span>
      <div className="flex-1" />
      <div className="flex gap-1">
        <button onClick={handleActivate} className="p-1.5 rounded-lg hover:bg-green/10 text-green" title="激活">
          <Check size={16} />
        </button>
        <button onClick={handleFreeze} className="p-1.5 rounded-lg hover:bg-orange/10 text-orange" title="冻结">
          <Ban size={16} />
        </button>
        <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-red/10 text-red" title="删除">
          <Trash2 size={16} />
        </button>
        <button onClick={onClear} className="p-1.5 rounded-lg hover:bg-panel/50 text-muted" title="取消选择">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
