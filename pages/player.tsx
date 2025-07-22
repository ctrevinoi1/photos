import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import useStore from '@/store/useStore'
import VideoPlayer from '@/components/VideoPlayer'
import { getAlbumVideos, getAllVideos, getVideoUrl, getThumbnailUrl } from '@/utils/googlePhotos'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

interface Video {
  id: string
  url: string
  thumbnailUrl: string
  title: string
  createdTime: string
  mimeType: string
}

export default function Player() {
  const router = useRouter()
  const { isAuthenticated, accessToken, refreshToken, albumId, videos, setVideos, currentVideoIndex, setCurrentVideoIndex, setAuth } = useStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  
  useEffect(() => {
    if (!isAuthenticated || !albumId) {
      router.push('/')
      return
    }
    
    if (videos.length === 0) {
      fetchVideos()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, albumId, router])
  
  const refreshTokenIfNeeded = async () => {
    if (!refreshToken) return accessToken
    
    try {
      const response = await axios.post('/api/auth/refresh', { refreshToken })
      const newAccessToken = response.data.accessToken
      setAuth(newAccessToken, refreshToken)
      return newAccessToken
    } catch (error) {
      console.error('Failed to refresh token:', error)
      return accessToken
    }
  }
  
  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let token = accessToken
      if (!token) {
        throw new Error('No access token available')
      }
      
      console.log('Fetching videos for album:', albumId)
      
      // Try to fetch videos, refresh token if needed
      try {
        const isAllVideos = albumId === 'ALL_VIDEOS'
        const mediaItems = isAllVideos 
          ? await getAllVideos(token, 50) // Get 50 most recent videos
          : await getAlbumVideos(token, albumId!)
          
        console.log('Media items found:', mediaItems.length)
        console.log('Fetching mode:', isAllVideos ? 'All videos' : 'Album videos')
        
        if (mediaItems.length === 0) {
          console.log('No videos found. The album might contain only photos or you might not have any videos.')
        }
        
        const formattedVideos: Video[] = mediaItems.map(item => ({
          id: item.id,
          url: getVideoUrl(item.baseUrl),
          thumbnailUrl: getThumbnailUrl(item.baseUrl),
          title: item.filename,
          createdTime: item.mediaMetadata.creationTime,
          mimeType: item.mimeType
        }))
        
        console.log('Videos formatted:', formattedVideos.length)
        setVideos(formattedVideos)
      } catch (error: any) {
        if (error?.response?.status === 401) {
          // Token expired, try to refresh
          const newToken = await refreshTokenIfNeeded()
          if (newToken && newToken !== accessToken) {
            const isAllVideos = albumId === 'ALL_VIDEOS'
            const mediaItems = isAllVideos 
              ? await getAllVideos(newToken, 50)
              : await getAlbumVideos(newToken, albumId!)
            
            const formattedVideos: Video[] = mediaItems.map(item => ({
              id: item.id,
              url: getVideoUrl(item.baseUrl),
              thumbnailUrl: getThumbnailUrl(item.baseUrl),
              title: item.filename,
              createdTime: item.mediaMetadata.creationTime,
              mimeType: item.mimeType
            }))
            
            setVideos(formattedVideos)
          } else {
            throw error
          }
        } else {
          throw error
        }
      }
    } catch (err) {
      console.error('Error fetching videos:', err)
      setError('Failed to load videos. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isSwipeUp = distance > 50
    const isSwipeDown = distance < -50
    
    if (isSwipeUp && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1)
    }
    
    if (isSwipeDown && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1)
    }
  }
  
  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 50 && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1)
    } else if (e.deltaY < -50 && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1)
    }
  }
  
  const handleVideoEnd = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1)
    }
  }
  
  const handleBack = () => {
    router.push('/albums')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full spinner"></div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchVideos}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  if (videos.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No videos found in this album</p>
          <button
            onClick={handleBack}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <>
      <Head>
        <title>Video Player - Photos Scroll</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </Head>
      
      <main 
        ref={containerRef}
        className="relative h-screen-small overflow-hidden bg-black"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-safe-top">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="p-2 bg-black/50 backdrop-blur rounded-full"
              aria-label="Back"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full">
              <span className="text-white text-sm">{currentVideoIndex + 1} / {videos.length}</span>
            </div>
          </div>
        </div>
        
        {/* Video Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentVideoIndex}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <VideoPlayer
              url={videos[currentVideoIndex].url}
              isActive={true}
              onEnded={handleVideoEnd}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Side indicators */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <div className="space-y-2">
            {videos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentVideoIndex(index)}
                className={`w-1 h-8 rounded-full transition-all ${
                  index === currentVideoIndex 
                    ? 'bg-white' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Swipe hints */}
        {videos.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 animate-pulse">
            <div className="text-white/50 text-sm flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              <span>Swipe to navigate</span>
            </div>
          </div>
        )}
      </main>
    </>
  )
} 