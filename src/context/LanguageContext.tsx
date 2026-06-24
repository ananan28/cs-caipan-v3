import { createContext, useContext, useState, ReactNode } from 'react'
import zh from '../locales/zh'

interface LanguageContextType {
  t: (key: string) => string
  locale: string
  setLocale: (locale: string) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState('zh')

  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = zh
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  return (
    <LanguageContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
