import { create } from 'zustand'

type LoadingOptions = {
  isLoading: boolean
  keepAlive?: boolean
}

type LoadingStore = {
  isLoading: boolean
  setLoading: (options: LoadingOptions) => void
  keepAlive: boolean
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  setLoading: ({ isLoading, keepAlive }) =>
    set(
      keepAlive !== undefined
        ? { isLoading, keepAlive }
        : { isLoading, keepAlive: false },
    ),
  keepAlive: false,
}))
