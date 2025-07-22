import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import useStore from '@/store/useStore'
import { getAlbums, getSharedAlbums, GoogleAlbum } from '@/utils/googlePhotos'
import Cookies from 'js-cookie'

export default function Albums() {
  const router = useRouter()
  const { isAuthenticated, accessToken, setAlbumId, setAuth } = useStore()
  const [albums, setAlbums] = useState<GoogleAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
      return
    }
    
    fetchAlbums()
  }, [isAuthenticated, router])
  
  const fetchAlbums = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get token from store or cookies
      let token = accessToken
      if (!token) {
        token = Cookies.get('access_token') || null
        const refreshToken = Cookies.get('refresh_token') || null
        if (token && refreshToken) {
          setAuth(token, refreshToken)
        }
      }
      
      if (!token) {
        throw new Error('No access token available')
      }
      
      // Fetch both owned and shared albums
      console.log('Fetching albums...')
      const [ownedAlbums, sharedAlbums] = await Promise.all([
        getAlbums(token).catch((err) => {
          console.error('Error fetching owned albums:', err)
          if (err.response?.status === 403) {
            throw new Error('Access denied. Please enable the Google Photos Library API in your Google Cloud Console.')
          }
          return []
        }),
        getSharedAlbums(token).catch((err) => {
          console.error('Error fetching shared albums:', err)
          if (err.response?.status === 403) {
            throw new Error('Access denied. Please enable the Google Photos Library API in your Google Cloud Console.')
          }
          return []
        })
      ])
      
      console.log('Owned albums:', ownedAlbums.length)
      console.log('Shared albums:', sharedAlbums.length)
      
      // Mark album types for debugging
      const allAlbums = [
        ...ownedAlbums.map(album => ({ ...album, isShared: false })),
        ...sharedAlbums.map(album => ({ ...album, isShared: true }))
      ]
      
      console.log('Total albums found:', allAlbums.length)
      setAlbums(allAlbums)
    } catch (err) {
      console.error('Error fetching albums:', err)
      setError('Failed to load albums. Please try logging in again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handleAlbumSelect = (albumId: string) => {
    setAlbumId(albumId)
    router.push('/player')
  }
  
  const handleLogout = () => {
    useStore.getState().clearAuth()
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    router.push('/')
  }
  
  return (
    <>
      <Head>
        <title>Select Album - Photos Scroll</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </Head>
      
      <main className="min-h-screen bg-black text-white safe-area-top safe-area-bottom">
        <div className="max-w-4xl mx-auto p-4">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Select an Album</h1>
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </header>
          
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full spinner"></div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400 mb-4">
              {error}
            </div>
          )}
          
          {!loading && !error && albums.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 mb-4">No albums found</p>
              <p className="text-sm text-gray-500 mb-4">
                Make sure you have albums in your Google Photos with videos.
                The app needs access to your Google Photos Library.
              </p>
              <button
                onClick={fetchAlbums}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          )}
          
          {!loading && albums.length > 0 && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Found {albums.length} album{albums.length !== 1 ? 's' : ''}
                </p>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showAll}
                    onChange={(e) => setShowAll(e.target.checked)}
                    className="rounded"
                  />
                  <span>Show all albums (including empty)</span>
                </label>
              </div>
              
              <div className="mb-6 p-4 bg-gray-900 rounded-lg text-sm">
                <p className="text-yellow-400 mb-2">⚠️ Note:</p>
                <p className="text-gray-300">
                  Google Photos API doesn't always return accurate media counts. 
                  Albums may contain videos even if they show "0 items". 
                  Try selecting any album that you know contains videos.
                </p>
              </div>
              
              <div className="mb-6">
                <button
                  onClick={() => {
                    setAlbumId('ALL_VIDEOS')
                    router.push('/player')
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-6 rounded-xl transition-all flex items-center justify-center space-x-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 16h4m10 0h4" />
                  </svg>
                  <span>View All Videos from Library</span>
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  This will show the most recent videos from your entire Google Photos library
                </p>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {albums.map((album: any) => {
                  const itemCount = parseInt(album.mediaItemsCount || '0')
                  const shouldShow = showAll || itemCount > 0 || !album.mediaItemsCount
                  
                  if (!shouldShow) return null
                  
                  return (
                    <button
                      key={album.id}
                      onClick={() => handleAlbumSelect(album.id)}
                      className="group relative aspect-square rounded-lg overflow-hidden bg-gray-900 hover:ring-2 hover:ring-purple-500 transition-all"
                    >
                      {album.coverPhotoBaseUrl ? (
                        <img
                          src={`${album.coverPhotoBaseUrl}=w400-h400-c`}
                          alt={album.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="font-medium truncate">{album.title || 'Untitled Album'}</h3>
                        <div className="flex items-center justify-between text-xs text-gray-300">
                          <span>{album.mediaItemsCount ? `${album.mediaItemsCount} items` : 'Unknown count'}</span>
                          {album.isShared && (
                            <span className="bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Shared</span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
} 