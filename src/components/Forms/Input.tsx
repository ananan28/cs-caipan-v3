import { InputHTMLAttributes, forwardRef } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-bold text-muted">{label}</label>}
      <input ref={ref} className={`w-full min-h-[45px] bg-panel/50 border border-border rounded-xl text-white outline-none px-4 focus:border-sky/50 focus:ring-2 focus:ring-sky/20 ${className}`} {...props} />
      {error && <p className="text-xs text-red">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'
