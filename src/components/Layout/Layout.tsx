import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useState } from 'react'

export const Layout = () => {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="min-h-screen flex bg-bg">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-72px)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
