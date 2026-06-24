import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// 屏蔽控制台警告
const originalConsoleWarn = console.warn
const originalConsoleError = console.error

console.warn = function(...args) {
  const msg = args.join(' ')
  if (msg.includes('Cookie') || msg.includes('_cf_bm')) {
    return
  }
  originalConsoleWarn.apply(console, args)
}

console.error = function(...args) {
  const msg = args.join(' ')
  if (msg.includes('Cookie') || msg.includes('_cf_bm') || msg.includes('cors')) {
    return
  }
  originalConsoleError.apply(console, args)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
