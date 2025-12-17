import { create } from 'zustand';
import { SectionStatus } from '@/types';

interface UIStore {
  // State
  editMode: boolean;
  selectedPhaseId: string | null;
  selectedSectionId: string | null;
  sidebarOpen: boolean;
  searchQuery: string;
  filterStatus: SectionStatus | 'all';
  
  // Toast/notification state
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  };
  
  // Actions
  toggleEditMode: () => void;
  setEditMode: (mode: boolean) => void;
  selectPhase: (phaseId: string | null) => void;
  selectSection: (sectionId: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: SectionStatus | 'all') => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  editMode: false,
  selectedPhaseId: null,
  selectedSectionId: null,
  sidebarOpen: true,
  searchQuery: '',
  filterStatus: 'all',
  toast: {
    message: '',
    type: 'info',
    visible: false,
  },
  
  // Actions
  toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),
  setEditMode: (mode) => set({ editMode: mode }),
  
  selectPhase: (phaseId) => set({ selectedPhaseId: phaseId, selectedSectionId: null }),
  selectSection: (sectionId) => set({ selectedSectionId: sectionId }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),
  
  showToast: (message, type = 'info') => {
    set({ toast: { message, type, visible: true } });
    // Auto-hide after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toast: { ...state.toast, visible: false }
      }));
    }, 3000);
  },
  
  hideToast: () => set((state) => ({ toast: { ...state.toast, visible: false } })),
}));
