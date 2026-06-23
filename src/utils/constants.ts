import { Role } from '@/types'

export const ROLES: Record<Role, string> = {
  SuperAdmin: '平台拥有者',
  Admin: '管理员',
  Finance: '财务',
  Agent: '代理',
  AgentDownline: '代理下线',
  User: '普通用户',
  NaturalUser: '自然注册',
}

export const ROLE_COLORS: Record<Role, string> = {
  SuperAdmin: 'badge-purple',
  Admin: 'badge-blue',
  Finance: 'badge-green',
  Agent: 'badge-orange',
  AgentDownline: 'badge-orange',
  User: 'badge-blue',
  NaturalUser: 'badge-green',
}

export const USER_STATUS: Record<string, string> = {
  Active: '正常',
  Frozen: '已冻结',
  Deleted: '已删除',
}

export const TASK_PLATFORMS = ['WhatsApp', 'Telegram', 'Signal', 'LINE', 'Viber', 'Zalo', 'Facebook']

export const TASK_STATUS = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  failed: '失败',
}

export const TICKET_STATUS = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭',
}

export const TICKET_CATEGORIES = {
  technical: '技术问题',
  finance: '财务问题',
  general: '一般咨询',
  feature: '功能建议',
}

export const ANNOUNCEMENT_TYPES = {
  normal: '普通',
  important: '重要',
  emergency: '紧急',
}

export const DEFAULT_TRADE_PASSWORD = '123456'

export const MAX_LOGIN_ATTEMPTS = 5
export const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutes
