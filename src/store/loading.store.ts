import { create } from 'zustand'

type LoaderInfo = {
  keepAlive?: boolean
}

type LoadingStore = {
  loaders: Record<string, LoaderInfo>
  anyActive: boolean
  startLoading: (id: string, opts?: { keepAlive?: boolean }) => void
  stopLoading: (id: string) => void
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  loaders: {},
  anyActive: false,
  startLoading: (id, opts) =>
    set((state) => {
      const loaders = {
        ...state.loaders,
        [id]: { keepAlive: opts?.keepAlive ?? false },
      }
      return { loaders, anyActive: Object.keys(loaders).length > 0 }
    }),
  stopLoading: (id) =>
    set((state) => {
      const { [id]: _, ...loaders } = state.loaders
      return { loaders, anyActive: Object.keys(loaders).length > 0 }
    }),
}))
