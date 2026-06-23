import { format } from 'date-fns'

export const now = () => format(new Date(), 'yyyy-MM-dd HH:mm:ss')

export const money = (n: number) => {
  if (n === undefined || n === null) return '0'
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')
}

export const randomId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export const generateInviteCode = () => {
  return 'INVITE-' + randomId() + '-' + Date.now().toString(36).toUpperCase()
}

export const hashPassword = (password: string): string => {
  // Simple hash for demo - in production use bcrypt
  return 'hash_' + btoa(encodeURIComponent(password)).split('').reverse().join('')
}

export const checkPassword = (input: string, hash: string): boolean => {
  return hashPassword(input) === hash
}

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const validatePhone = (phone: string): boolean => {
  return /^[\d+\s-]{8,15}$/.test(phone)
}

export const formatNumber = (n: number): string => {
  return new Intl.NumberFormat('zh-CN').format(n)
}

export const truncate = (str: string, len: number = 50): string => {
  return str.length > len ? str.substring(0, len) + '...' : str
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
