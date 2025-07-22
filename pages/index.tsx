import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import useStore from '@/store/useStore'
import { getGoogleAuthUrl } from '@/utils/googlePhotos'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, albumId } = useStore()
  
  useEffect(() => {
    // If already authenticated and has album selected, redirect to player
    if (isAuthenticated && albumId) {
      router.push('/player')
    } else if (isAuthenticated) {
      router.push('/albums')
    }
  }, [isAuthenticated, albumId, router])
  
  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl()
  }
  
  return (
    <>
      <Head>
        <title>TikTok-style Google Photos Viewer</title>
        <meta name="description" content="View your Google Photos videos in a TikTok-style interface" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      </Head>
      
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 safe-area-top safe-area-bottom">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              Photos Scroll
            </h1>
            
            <p className="text-gray-400 text-lg">
              View your Google Photos videos in a TikTok-style scrolling interface
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black font-semibold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
            
            <p className="text-sm text-gray-500">
              Connect your Google Photos account to get started
            </p>
          </div>
          
          {router.query.error && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-400">
              {router.query.error === 'auth_denied' && 'Authentication was denied. Please try again.'}
              {router.query.error === 'no_code' && 'No authorization code received. Please try again.'}
              {router.query.error === 'token_exchange_failed' && 'Failed to authenticate. Please try again.'}
            </div>
          )}
        </div>
      </main>
    </>
  )
} 