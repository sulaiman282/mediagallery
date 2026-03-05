import { create } from 'zustand';

export const useMediaStore = create((set) => ({
  media: [],
  loading: false,
  filter: 'all',
  currentPage: 1,
  itemsPerPage: 12,
  
  setMedia: (media) => set({ media }),
  addMedia: (newMedia) => set((state) => ({ media: [...newMedia, ...state.media] })),
  setLoading: (loading) => set({ loading }),
  setFilter: (filter) => set({ filter, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  
  getFilteredMedia: () => {
    const state = useMediaStore.getState();
    if (state.filter === 'all') return state.media;
    return state.media.filter(item => item.resource_type === state.filter);
  },
  
  getPaginatedMedia: () => {
    const state = useMediaStore.getState();
    const filtered = state.getFilteredMedia();
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    return filtered.slice(start, end);
  },
  
  getTotalPages: () => {
    const state = useMediaStore.getState();
    const filtered = state.getFilteredMedia();
    return Math.ceil(filtered.length / state.itemsPerPage);
  },
}));
