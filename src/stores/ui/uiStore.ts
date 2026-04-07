import { create } from 'zustand';
import type { UIState, UIStore, Toast } from '@/types';

/**
 * État initial de l'UI
 */
const INITIAL_STATE: UIState = {
  activeModal: null,
  toasts: [],
  soundEnabled: true,
  animSpeed: 'normal',
  isSidebarOpen: false,
};

/**
 * Génère un ID unique pour les toasts
 */
const generateToastId = (): string => {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
};

/**
 * Store Zustand pour l'UI
 */
export const useUIStore = create<UIStore>()((set, get) => ({
  ...INITIAL_STATE,

  /**
   * Ouvre une modale
   */
  openModal: (modal) => {
    set({ activeModal: modal });
  },

  /**
   * Ferme la modale active
   */
  closeModal: () => {
    set({ activeModal: null });
  },

  /**
   * Ajoute un toast notification
   * Auto-dismiss après duration ms
   */
  addToast: (toast: Omit<Toast, 'id'>) => {
    const id = generateToastId();
    const newToast: Toast = { ...toast, id };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-dismiss
    if (toast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, toast.duration);
    }
  },

  /**
   * Supprime un toast par son ID
   */
  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  /**
   * Active/désactive le son
   */
  toggleSound: () => {
    set((state) => ({ soundEnabled: !state.soundEnabled }));
  },

  /**
   * Définit la vitesse des animations
   */
  setAnimSpeed: (speed) => {
    set({ animSpeed: speed });
  },

  /**
   * Ouvre/ferme la sidebar
   */
  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },
}));
