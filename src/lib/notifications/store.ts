export type ToastItem = {
  id: string
  message: string
  duration: number
  dismissable: boolean
  createdAt: number
  totalPausedMs: number
  pauseStartedAt: number | null
}

type Listener = () => void

let state: ToastItem[] = []
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l())
}

export const toasts = {
  subscribe(cb: Listener) {
    listeners.add(cb)
    return () => listeners.delete(cb)
  },

  getSnapshot(): ToastItem[] {
    return state
  },

  push(message: string, opts?: { duration?: number; dismissable?: boolean }) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    const toast: ToastItem = {
      id,
      message,
      duration: opts?.duration ?? 3000,
      dismissable: opts?.dismissable ?? true,
      createdAt: Date.now(),
      totalPausedMs: 0,
      pauseStartedAt: null,
    }
    state = [...state, toast]
    emit()
  },

  remove(id: string) {
    state = state.filter((t) => t.id !== id)
    emit()
  },

  pause(id: string) {
    state = state.map((t) =>
      t.id === id ? { ...t, pauseStartedAt: Date.now() } : t,
    )
    emit()
  },

  resume(id: string) {
    state = state.map((t) => {
      if (t.id !== id || t.pauseStartedAt == null) return t
      return {
        ...t,
        totalPausedMs: t.totalPausedMs + (Date.now() - t.pauseStartedAt),
        pauseStartedAt: null,
      }
    })
    emit()
  },

  removeExpired() {
    const now = Date.now()

    const expiredIds = new Set(
      state
        .filter((t) => {
          const elapsed = now - t.createdAt - t.totalPausedMs
          const expired = t.pauseStartedAt == null && elapsed >= t.duration
          return expired
        })
        .map((t) => t.id),
    )
    state = state.filter((t) => !expiredIds.has(t.id))
    emit()
  },
}
