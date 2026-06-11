import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activeTheme: 'dark' | 'light' | 'system';
  setActiveTheme: (theme: 'dark' | 'light' | 'system') => void;
  quickLaunchOpen: boolean;
  setQuickLaunchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      activeTheme: 'dark',
      setActiveTheme: (theme) => set({ activeTheme: theme }),
      quickLaunchOpen: false,
      setQuickLaunchOpen: (open) => set({ quickLaunchOpen: open }),
    }),
    {
      name: 'onecontact-ui-storage',
    }
  )
);
