import { User } from '@/types'

export const hasRole = (user: User | null, roles: string[]): boolean => {
  if (!user) return false
  return roles.includes(user.role)
}

export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false
  if (user.role === 'SuperAdmin') return true
  return user.permissions?.[permission] || false
}

export const canManageUsers = (user: User | null): boolean => {
  return hasRole(user, ['SuperAdmin', 'Admin'])
}

export const canManageFinance = (user: User | null): boolean => {
  return hasRole(user, ['SuperAdmin', 'Admin', 'Finance'])
}

export const canViewReports = (user: User | null): boolean => {
  return hasRole(user, ['SuperAdmin', 'Admin', 'Finance'])
}
