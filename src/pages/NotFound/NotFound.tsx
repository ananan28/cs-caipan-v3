import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/Common/Button'
import { Home, AlertTriangle } from 'lucide-react'

export const NotFound = () => {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <AlertTriangle size={80} className="text-orange mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-xl text-muted mb-6">页面不存在</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          <Home size={18} className="mr-2" />返回控制台
        </Button>
      </div>
    </div>
  )
}
