import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    // 从 localStorage 读取
    const saved = localStorage.getItem('theme') as Theme
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved)
    }
  }, [])

  useEffect(() => {
    // 保存到 localStorage
    localStorage.setItem('theme', theme)
    
    // 移除所有主题类
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.remove('dark-theme', 'light-theme')
    
    // 添加当前主题类
    document.documentElement.classList.add(theme)
    
    // 强制设置 body 背景
    if (theme === 'light') {
      document.body.style.background = '#f1f5f9'
      document.body.style.color = '#0f172a'
    } else {
      document.body.style.background = ''
      document.body.style.color = ''
    }
    
    console.log('✅ 主题切换为:', theme)
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
