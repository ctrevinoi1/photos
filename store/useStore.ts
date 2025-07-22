import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface Video {
  id: string
  url: string
  thumbnailUrl?: string
  title?: string
  createdTime?: string
  mimeType: string
}

interface Store {
  // Auth state
  isAuthenticated: boolean
  accessToken: string | null
  refreshToken: string | null
  albumId: string | null
  
  // Video state
  videos: Video[]
  currentVideoIndex: number
  isLoading: boolean
  error: string | null
  
  // Actions
  setAuth: (token: string, refreshToken: string) => void
  setAlbumId: (albumId: string) => void
  clearAuth: () => void
  setVideos: (videos: Video[]) => void
  setCurrentVideoIndex: (index: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const useStore = create<Store>()(
  persist(
    (set) => ({
      // Initial state
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      albumId: null,
      videos: [],
      currentVideoIndex: 0,
      isLoading: false,
      error: null,
      
      // Actions
      setAuth: (token, refreshToken) => set({ 
        isAuthenticated: true, 
        accessToken: token,
        refreshToken: refreshToken 
      }),
      
      setAlbumId: (albumId) => set({ albumId }),
      
      clearAuth: () => set({ 
        isAuthenticated: false, 
        accessToken: null,
        refreshToken: null,
        albumId: null,
        videos: []
      }),
      
      setVideos: (videos) => set({ videos }),
      
      setCurrentVideoIndex: (index) => set({ currentVideoIndex: index }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'google-photos-tiktok-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        albumId: state.albumId,
      }),
    }
  )
)

export default useStore 