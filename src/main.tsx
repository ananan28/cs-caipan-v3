import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

// 忽略特定控制台警告
const originalConsoleWarn = console.warn
console.warn = function(...args) {
  if (typeof args[0] === 'string' && args[0].includes('Cookie')) {
    return
  }
  if (typeof args[0] === 'string' && args[0].includes('_cf_bm')) {
    return
  }
  originalConsoleWarn.apply(console, args)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
