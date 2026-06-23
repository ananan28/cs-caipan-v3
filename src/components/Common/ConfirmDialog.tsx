import { useState } from 'react'
import { Button } from './Button'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!isOpen) return null

  const colors = {
    danger: 'bg-red text-white hover:bg-red/80',
    warning: 'bg-orange text-white hover:bg-orange/80',
    info: 'bg-blue text-white hover:bg-blue/80',
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-panel border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className={variant === 'danger' ? 'text-red' : variant === 'warning' ? 'text-orange' : 'text-blue'} />
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button onClick={onCancel} className="text-muted hover:text-white"><X size={20} /></button>
        </div>
        <p className="text-muted mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onCancel}>{cancelText}</Button>
          <Button className={`flex-1 ${colors[variant]}`} onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  )
}
