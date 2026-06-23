import { ReactNode, ButtonHTMLAttributes } from 'react'

export const Button = ({ children, variant = 'primary', className = '', onClick, disabled, type = 'button' }: { children: ReactNode; variant?: 'primary' | 'green' | 'red' | 'orange' | 'ghost'; className?: string; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit' }) => {
  const colors = {
    primary: 'bg-gradient-to-r from-blue to-sky text-white hover:opacity-90',
    green: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:opacity-90',
    red: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:opacity-90',
    orange: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:opacity-90',
    ghost: 'bg-panel/50 border border-border text-muted hover:text-white hover:border-white/30',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2.5 rounded-xl font-bold transition-all ${colors[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      {children}
    </button>
  )
}
