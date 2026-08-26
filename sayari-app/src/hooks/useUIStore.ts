import { create } from 'zustand'

interface UiState {
  isSidebarCollapsed: boolean
  toggleSidebarCollapse: () => void
  isMobileSidebarOpen: boolean
  toggleSidebar: () => void
  postModal: { isOpen: boolean; type: 'image' | 'text' | null }
  openPostModal: (type: 'image' | 'text') => void
  closePostModal: () => void
}

export const useUiStore = create<UiState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  isMobileSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),

  postModal: { isOpen: false, type: null },
  openPostModal: (type) => set({ postModal: { isOpen: true, type } }),
  closePostModal: () => set({ postModal: { isOpen: false, type: null } }),
}))



