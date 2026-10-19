import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UiState {
  isDarkMode: boolean
  searchTerm: string
  toggleDarkMode: () => void
  setSearchTerm: (term: string) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      searchTerm: '',
      toggleDarkMode: () =>
        set((state) => ({ isDarkMode: !state.isDarkMode })),
      setSearchTerm: (term: string) => set({ searchTerm: term }),
    }),
    {
      name: 'itelect4-ui',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
)

export default useUiStore
