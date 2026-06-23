export type Role = 'SuperAdmin' | 'Admin' | 'Finance' | 'Agent' | 'User'

export type User = {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  status: 'Active' | 'Frozen' | 'Deleted'
  points: number
  avatar: string
  owner_id: string
  owner_type: string
  permissions: Record<string, boolean>
  created_at: string
  updated_at: string
}

export type PointsTransaction = {
  id: string
  user_id: string
  type: 'recharge' | 'transfer_in' | 'transfer_out' | 'adjust' | 'task_cost' | 'package_buy'
  points: number
  fee: number
  points_before: number
  points_after: number
  description: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
}

export type Transfer = {
  id: string
  from_user_id: string
  to_user_id: string
  points: number
  fee: number
  net_points: number
  note: string
  status: 'pending' | 'completed' | 'failed'
  created_at: string
  completed_at: string
}

export type Package = {
  id: number
  name: string
  price: number
  points: number
  desc: string
  enabled: boolean
  popular: boolean
}

export type Task = {
  id: string
  creator_id: string
  platform: string
  numbers: string[]
  total_count: number
  cost_points: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result: any
  created_at: string
  completed_at: string
}

export type Ticket = {
  id: string
  user_id: string
  title: string
  content: string
  category: 'technical' | 'finance' | 'general' | 'feature'
  status: 'pending' | 'processing' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  assignee_id: string
  created_at: string
  updated_at: string
  closed_at: string
}

export type Announcement = {
  id: string
  title: string
  content: string
  type: 'normal' | 'important' | 'emergency'
  is_popup: boolean
  is_published: boolean
  read_count: number
  created_at: string
  updated_at: string
}

// 客服相关类型
export type ChatMessage = {
  id: string
  sessionId: string
  userId: string
  userName: string
  userEmail: string
  content: string
  isFromUser: boolean   // true=用户发送, false=客服发送
  read: boolean
  readBy: string[]     // 已读的客服ID列表
  createdAt: string
  category?: 'general' | 'technical' | 'finance' | 'recharge' | 'task'
  status: 'pending' | 'processing' | 'resolved'
  assignedTo?: string  // 分配给哪个客服
}

export type ChatSession = {
  id: string
  userId: string
  userName: string
  userEmail: string
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  status: 'active' | 'waiting' | 'resolved' | 'closed'
  assignedTo?: string
  createdAt: string
}

export type ChatUserInfo = {
  userId: string
  name: string
  email: string
  points: number
  balance: number
  role: string
  status: string
  recentTransactions: any[]
}
