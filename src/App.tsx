import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { Layout } from './components/Layout/Layout'
import { FloatingChat } from './components/Chat/FloatingChat'
import { Login } from './pages/Auth/Login'
import { Register } from './pages/Auth/Register'
import { ForgotPassword } from './pages/Auth/ForgotPassword'
import { ResetPassword } from './pages/Auth/ResetPassword'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { Users } from './pages/Users/Users'
import { WalletPage } from './pages/Wallet/Wallet'
import { Finance } from './pages/Finance/Finance'
import { Tasks } from './pages/Tasks/Tasks'
import { Tickets } from './pages/Tickets/Tickets'
import { Announcements } from './pages/Announcements/Announcements'
import { Settings } from './pages/Settings/Settings'
import { Logs } from './pages/Logs/Logs'
import { Profile } from './pages/Profile/Profile'
import { Permissions } from './pages/Permissions/Permissions'
import { Orders } from './pages/Orders/Orders'
import { Transactions } from './pages/Transactions/Transactions'
import { Ledger } from './pages/Ledger/Ledger'
import { Invites } from './pages/Invites/Invites'
import { ApiCenter } from './pages/ApiCenter/ApiCenter'
import { Features } from './pages/Features/Features'
import { Notifications } from './pages/Notifications/Notifications'
import { Stats } from './pages/Stats/Stats'
import { Chat } from './pages/Chat/Chat'
import { ChatSettings } from './pages/ChatSettings/ChatSettings'
import { ScheduledTasks } from './pages/ScheduledTasks/ScheduledTasks'
import { Backup } from './pages/Backup/Backup'
import { Monitor } from './pages/Monitor/Monitor'
import { PriceControl } from './pages/PriceControl/PriceControl'
import { ChangeLog } from './pages/ChangeLog/ChangeLog'
import { NotFound } from './pages/NotFound/NotFound'
import { Recharge } from './pages/Recharge/Recharge'
import { PaymentAddresses } from './pages/Admin/PaymentAddresses'
import { SuperAdmin } from './pages/Admin/SuperAdmin'
import { ApiKeys } from './pages/Admin/ApiKeys'
import { DataExport } from './pages/Admin/DataExport'
import { LanguageProvider } from './context/LanguageContext'
import { ThemeProvider } from './context/ThemeContext'
import { WallpaperProvider } from './context/WallpaperContext'
import { Wallpaper } from './components/Common/Wallpaper'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore()
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <WallpaperProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Wallpaper type="login"><Login /></Wallpaper>} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/" element={<PrivateRoute><Wallpaper type="app"><Layout /></Wallpaper></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="finance" element={<Finance />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="orders" element={<Orders />} />
                <Route path="ledger" element={<Ledger />} />
                <Route path="invites" element={<Invites />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="features" element={<Features />} />
                <Route path="api" element={<ApiCenter />} />
                <Route path="tickets" element={<Tickets />} />
                <Route path="announcements" element={<Announcements />} />
                <Route path="settings" element={<Settings />} />
                <Route path="logs" element={<Logs />} />
                <Route path="profile" element={<Profile />} />
                <Route path="permissions" element={<Permissions />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="stats" element={<Stats />} />
                <Route path="chat" element={<Chat />} />
                <Route path="chat-settings" element={<ChatSettings />} />
                <Route path="scheduled-tasks" element={<ScheduledTasks />} />
                <Route path="backup" element={<Backup />} />
                <Route path="monitor" element={<Monitor />} />
                <Route path="price-control" element={<PriceControl />} />
                <Route path="changelog" element={<ChangeLog />} />
                <Route path="recharge" element={<Recharge />} />
                <Route path="payment-addresses" element={<PaymentAddresses />} />
                <Route path="super-admin" element={<SuperAdmin />} />
                <Route path="api-keys" element={<ApiKeys />} />
                <Route path="data-export" element={<DataExport />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <FloatingChat />
        </WallpaperProvider>
      </ThemeProvider>
    </LanguageProvider>
  )
}

export default App
