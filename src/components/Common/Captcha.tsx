import { useState, useEffect, useRef } from 'react'
import { RefreshCw } from 'lucide-react'

interface CaptchaProps {
  onVerify: (valid: boolean) => void
}

export const Captcha: React.FC<CaptchaProps> = ({ onVerify }) => {
  const [captchaText, setCaptchaText] = useState('')
  const [userInput, setUserInput] = useState('')
  const [isValid, setIsValid] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let text = ''
    for (let i = 0; i < 6; i++) {
      text += chars[Math.floor(Math.random() * chars.length)]
    }
    setCaptchaText(text)
    drawCaptcha(text)
  }

  const drawCaptcha = (text: string) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 160
    canvas.height = 60

    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, 160, 60)

    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `hsl(${Math.random() * 360}, 70%, 50%)`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(Math.random() * 160, Math.random() * 60)
      ctx.lineTo(Math.random() * 160, Math.random() * 60)
      ctx.stroke()
    }

    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `hsl(${Math.random() * 360}, 50%, 50%)`
      ctx.beginPath()
      ctx.arc(Math.random() * 160, Math.random() * 60, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    for (let i = 0; i < text.length; i++) {
      const x = 20 + i * 25
      const y = 35 + Math.random() * 10
      ctx.font = `${24 + Math.random() * 6}px Arial`
      ctx.fillStyle = `hsl(${Math.random() * 360}, 60%, 30%)`
      ctx.textBaseline = 'middle'
      ctx.fillText(text[i], x, y)
    }
  }

  useEffect(() => {
    generateCaptcha()
  }, [])

  const handleChange = (value: string) => {
    setUserInput(value)
    const valid = value.toUpperCase() === captchaText
    setIsValid(valid)
    onVerify(valid)
  }

  const refresh = () => {
    generateCaptcha()
    setUserInput('')
    setIsValid(false)
    onVerify(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <canvas ref={canvasRef} className="rounded-lg border border-gray-200" />
        <button
          type="button"
          onClick={refresh}
          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw size={18} className="text-gray-600" />
        </button>
      </div>
      <input
        type="text"
        value={userInput}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="输入验证码"
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
          userInput && isValid
            ? 'border-green-400 focus:ring-green-200'
            : userInput && !isValid
            ? 'border-red-400 focus:ring-red-200'
            : 'border-gray-200 focus:ring-yellow-200'
        }`}
        maxLength={6}
      />
      {userInput && !isValid && <p className="text-red-500 text-xs">验证码错误</p>}
      {userInput && isValid && <p className="text-green-500 text-xs">✅ 验证通过</p>}
    </div>
  )
}
