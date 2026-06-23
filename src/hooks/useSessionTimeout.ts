import { useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export const useSessionTimeout = (timeoutMinutes: number = 30) => {
  const { logout } = useAuthStore()
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      toast.warning('⏰ 会话已超时，请重新登录')
      logout()
      window.location.href = '/login'
    }, timeoutMinutes * 60 * 1000)
  }

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'click']
    resetTimer()
    events.forEach(e => document.addEventListener(e, resetTimer))
    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])
}
