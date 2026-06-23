import React from 'react'
import { CheckSquare, XSquare, Trash2, Edit } from 'lucide-react'

interface BatchActionsProps {
  selectedCount: number
  onSelectAll: () => void
  onClearAll: () => void
  onDelete: () => void
  onEdit: () => void
}

export const BatchActions: React.FC<BatchActionsProps> = ({
  selectedCount,
  onSelectAll,
  onClearAll,
  onDelete,
  onEdit
}) => {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#12182b] border border-gray-700 rounded-xl px-4 py-3 shadow-2xl flex items-center gap-4 z-50">
      <span className="text-white text-sm font-medium">{selectedCount} 项已选</span>
      <button onClick={onSelectAll} className="text-blue-400 hover:text-blue-300 text-sm">全选</button>
      <button onClick={onClearAll} className="text-gray-400 hover:text-white text-sm">清空</button>
      <div className="w-px h-6 bg-gray-700"></div>
      <button onClick={onEdit} className="text-yellow-400 hover:text-yellow-300 p-1">
        <Edit size={18} />
      </button>
      <button onClick={onDelete} className="text-red-400 hover:text-red-300 p-1">
        <Trash2 size={18} />
      </button>
    </div>
  )
}
