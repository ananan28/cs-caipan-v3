import { ReactNode } from 'react'

export const Card = ({ children, className = '', title, subtitle }: { children: ReactNode; className?: string; title?: string; subtitle?: string }) => (
  <div className={`bg-panel/90 backdrop-blur border border-border rounded-2xl p-6 shadow-glow ${className}`}>
    {(title || subtitle) && (
      <div className="mb-4">
        {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
        {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
)
