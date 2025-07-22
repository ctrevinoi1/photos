import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import useStore from '@/store/useStore'
import Cookies from 'js-cookie'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Check for existing tokens on app load
    const accessToken = Cookies.get('access_token')
    const refreshToken = Cookies.get('refresh_token')
    
    if (accessToken && refreshToken) {
      const store = useStore.getState()
      store.setAuth(accessToken, refreshToken)
    }
    
    // Set viewport meta tag for proper mobile display
    const viewport = document.querySelector('meta[name="viewport"]')
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover')
    }
  }, [])
  
  return <Component {...pageProps} />
} 