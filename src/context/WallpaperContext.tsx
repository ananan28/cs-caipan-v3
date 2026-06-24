import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'

interface WallpaperContextType {
  loginWallpaper: string
  appWallpaper: string
  wallpaperStyle: string
  refreshWallpaper: () => void
}

const WallpaperContext = createContext<WallpaperContextType | undefined>(undefined)

export const WallpaperProvider = ({ children }: { children: ReactNode }) => {
  const [loginWallpaper, setLoginWallpaper] = useState('')
  const [appWallpaper, setAppWallpaper] = useState('')
  const [wallpaperStyle, setWallpaperStyle] = useState('blur')

  const loadWallpapers = async () => {
    const { data } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['login_wallpaper', 'app_wallpaper', 'wallpaper_style'])

    if (data) {
      data.forEach(item => {
        if (item.key === 'login_wallpaper') setLoginWallpaper(item.value || '')
        if (item.key === 'app_wallpaper') setAppWallpaper(item.value || '')
        if (item.key === 'wallpaper_style') setWallpaperStyle(item.value || 'blur')
      })
    }
  }

  useEffect(() => {
    loadWallpapers()
  }, [])

  return (
    <WallpaperContext.Provider value={{ 
      loginWallpaper, 
      appWallpaper, 
      wallpaperStyle,
      refreshWallpaper: loadWallpapers 
    }}>
      {children}
    </WallpaperContext.Provider>
  )
}

export const useWallpaper = () => {
  const context = useContext(WallpaperContext)
  if (!context) throw new Error('useWallpaper must be used within WallpaperProvider')
  return context
}
