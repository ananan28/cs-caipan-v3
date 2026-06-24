import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export const Layout = () => {
  const [collapsed, setCollapsed] = useState(false)

  const wallpaper = 'https://fuqhvyqxibepmbauohmh.supabase.co/storage/v1/object/public/wallpapers/messageImage_1781060895989.jpg'

  return (
    <div className="min-h-screen relative">
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${wallpaper})` }}
      />
      <div className="fixed inset-0 bg-white/80" />
      
      <div className="relative z-10">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
          <Topbar collapsed={collapsed} />
          <main className="pt-16 p-6 min-h-screen">
            <div className="bg-white/90 backdrop-blur-none rounded-2xl p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
