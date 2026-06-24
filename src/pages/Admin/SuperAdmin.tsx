import { useState, useEffect } from 'react'
import { Card } from '../../components/Common/Card'
import { Badge } from '../../components/Common/Badge'
import { Button } from '../../components/Common/Button'
import { Input } from '../../components/Forms/Input'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import {
  Settings, Users, Wallet, TrendingUp, Shield,
  RefreshCw, Save, Edit2, X, CheckCircle,
  DollarSign, Percent, Gift, Zap, Award,
  Lock, Unlock, Eye, EyeOff, Plus, Trash2,
  UserCheck, UserX, Activity, MessageSquare,
  Server, Database, FileText, BarChart3,
  ToggleLeft, ToggleRight, Power, Trash2 as ClearIcon,
  AlertTriangle, Clock
} from 'lucide-react'
import toast from 'react-hot-toast'

export const SuperAdmin = () => {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)

  if (user?.role !== 'SuperAdmin') {
    return (
      <div className="p-6 bg-[#f0f2f5] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-900">无权限访问</h2>
          <p className="text-gray-500">只有超级管理员可以访问此页面</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-[#f0f2f5] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Shield className="text-yellow-500" size={28} />
              <h1 className="text-2xl font-bold text-gray-900">超级管理面板</h1>
            </div>
            <p className="text-gray-500 text-sm mt-1">统一管理所有系统参数、权限、价格</p>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw size={16} className="mr-2" /> 刷新
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Settings className="text-blue-500" size={20} />
              </div>
              <div>
                <p className="text-gray-900 font-medium">系统配置</p>
                <p className="text-gray-400 text-sm">管理所有参数</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="text-green-500" size={20} />
              </div>
              <div>
                <p className="text-gray-900 font-medium">权限管理</p>
                <p className="text-gray-400 text-sm">控制每个功能开关</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="text-purple-500" size={20} />
              </div>
              <div>
                <p className="text-gray-900 font-medium">价格控制</p>
                <p className="text-gray-400 text-sm">调整所有价格参数</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 text-sm">💡 超级管理面板功能开发中，敬请期待完整版本</p>
        </div>
      </div>
    </div>
  )
}
