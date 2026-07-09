import { create } from 'zustand'

type LoaderInfo = {
  keepAlive?: boolean
}

type LoadingStore = {
  loaders: Record<string, LoaderInfo>
  anyActive: boolean
  hasKeepAlive: boolean
  startLoading: (id: string, opts?: { keepAlive?: boolean }) => void
  stopLoading: (id: string) => void
  settleNonKeepAlive: () => void
}

function computeFlags(loaders: Record<string, LoaderInfo>) {
  const entries = Object.values(loaders)
  return {
    anyActive: entries.length > 0,
    hasKeepAlive: entries.some((l) => l.keepAlive),
  }
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  loaders: {},
  anyActive: false,
  hasKeepAlive: false,
  startLoading: (id, opts) =>
    set((state) => {
      const loaders = {
        ...state.loaders,
        [id]: { keepAlive: opts?.keepAlive ?? false },
      }
      return { loaders, ...computeFlags(loaders) }
    }),
  stopLoading: (id) =>
    set((state) => {
      const { [id]: _, ...loaders } = state.loaders
      return { loaders, ...computeFlags(loaders) }
    }),
  settleNonKeepAlive: () =>
    set((state) => {
      const loaders: Record<string, LoaderInfo> = {}
      for (const [id, info] of Object.entries(state.loaders)) {
        if (info.keepAlive) loaders[id] = info
      }
      return { loaders, ...computeFlags(loaders) }
    }),
}))
