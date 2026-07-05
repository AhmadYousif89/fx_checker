import { create } from 'zustand'

type LoadingStore = {
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}))
