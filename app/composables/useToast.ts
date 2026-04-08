export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const toasts = ref<Toast[]>([])
let nextId = 0

export const useToast = () => {
  const add = (message: string, type: Toast['type'] = 'info', duration = 4000) => {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      remove(id)
    }, duration)
  }

  const remove = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const success = (message: string) => add(message, 'success')
  const error = (message: string) => add(message, 'error', 6000)
  const info = (message: string) => add(message, 'info')

  return { toasts, add, remove, success, error, info }
}
