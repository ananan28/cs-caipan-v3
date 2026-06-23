import toast from 'react-hot-toast'

export const showSuccess = (message: string) => {
  toast.success(message, { icon: '✅', duration: 3000 })
}

export const showError = (message: string) => {
  toast.error(message, { icon: '❌', duration: 4000 })
}

export const showWarning = (message: string) => {
  toast(message, { icon: '⚠️', duration: 3500 })
}

export const showLoading = (message: string) => {
  return toast.loading(message)
}

export const showInfo = (message: string) => {
  toast(message, { icon: 'ℹ️', duration: 3000 })
}
