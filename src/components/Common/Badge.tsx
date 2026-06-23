import { ReactNode } from 'react'

export const Badge = ({ children, variant = 'default' }: { children: ReactNode; variant?: 'default' | 'blue' | 'green' | 'red' | 'orange' | 'purple' }) => {
  const colors = {
    default: 'bg-panel/70 text-muted',
    blue: 'bg-blue/20 text-sky border border-sky/30',
    green: 'bg-green/20 text-green border border-green/30',
    red: 'bg-red/20 text-red border border-red/30',
    orange: 'bg-orange/20 text-orange border border-orange/30',
    purple: 'bg-purple/20 text-purple border border-purple/30',
  }
  return <span className={`px-3 py-1 rounded-full text-xs font-bold ${colors[variant]}`}>{children}</span>
}
