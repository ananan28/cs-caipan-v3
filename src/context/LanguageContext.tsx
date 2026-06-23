import { createContext, useContext, useState, ReactNode } from 'react'
import { zh } from '@/locales/zh'
import { en } from '@/locales/en'

type Language = 'zh' | 'en'
type Translation = typeof zh

interface LanguageContextType {
  language: Language
  t: Translation
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('zh')
  
  const translations: Record<Language, Translation> = { zh, en }
  const t = translations[language]

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
