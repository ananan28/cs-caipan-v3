import { ReactNode } from 'react'
import { useWallpaper } from '../../context/WallpaperContext'

interface WallpaperProps {
  type: 'login' | 'app'
  children: ReactNode
}

export const Wallpaper: React.FC<WallpaperProps> = ({ type, children }) => {
  const { loginWallpaper, appWallpaper, wallpaperStyle } = useWallpaper()
  
  const wallpaper = type === 'login' ? loginWallpaper : appWallpaper
  const style = wallpaperStyle || 'blur'

  if (!wallpaper) {
    return <>{children}</>
  }

  return (
    <div className="relative min-h-screen">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: `url(${wallpaper})` }}
      />
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: style === 'blur' ? 'rgba(10, 15, 31, 0.7)' : 
                           style === 'dark' ? 'rgba(0, 0, 0, 0.85)' : 
                           style === 'light' ? 'rgba(255, 255, 255, 0.85)' : 
                           'rgba(10, 15, 31, 0.5)',
          backdropFilter: style === 'blur' ? 'blur(12px)' : 'none'
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
