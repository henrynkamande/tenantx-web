export interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

const toasts = ref<ToastNotification[]>([])

export const useToast = () => {
  const addToast = (notification: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 15)
    const toast: ToastNotification = {
      id,
      duration: 5000,
      ...notification
    }

    toasts.value.push(toast)

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearAll = () => {
    toasts.value = []
  }

  const success = (title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addToast({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const error = (title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addToast({
      type: 'error',
      title,
      message,
      duration: 8000, // Longer duration for errors
      ...options
    })
  }

  const warning = (title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addToast({
      type: 'warning',
      title,
      message,
      ...options
    })
  }

  const info = (title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addToast({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  return {
    toasts: readonly(toasts),
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info
  }
}
