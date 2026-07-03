import { create } from "zustand";

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Command menu
  commandMenuOpen: boolean;
  setCommandMenuOpen: (open: boolean) => void;

  // Active customer (for detail views)
  activeCustomerId: string | null;
  setActiveCustomerId: (id: string | null) => void;

  // Global loading
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  commandMenuOpen: false,
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),

  activeCustomerId: null,
  setActiveCustomerId: (id) => set({ activeCustomerId: id }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
