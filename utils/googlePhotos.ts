import axios from 'axios'

const GOOGLE_PHOTOS_API_BASE = 'https://photoslibrary.googleapis.com/v1'
const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export interface GoogleAuthResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type: string
}

export interface GoogleAlbum {
  id: string
  title: string
  productUrl: string
  mediaItemsCount: string
  coverPhotoBaseUrl: string
}

export interface GoogleMediaItem {
  id: string
  productUrl: string
  baseUrl: string
  mimeType: string
  mediaMetadata: {
    creationTime: string
    width: string
    height: string
    video?: {
      fps: number
      status: string
    }
  }
  filename: string
}

export const getGoogleAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
    access_type: 'offline',
    prompt: 'consent'
  })
  
  return `${GOOGLE_OAUTH_URL}?${params.toString()}`
}

export const exchangeCodeForToken = async (code: string): Promise<GoogleAuthResponse> => {
  const response = await axios.post(GOOGLE_TOKEN_URL, {
    code,
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    grant_type: 'authorization_code'
  })
  
  return response.data
}

export const refreshAccessToken = async (refreshToken: string): Promise<GoogleAuthResponse> => {
  const response = await axios.post(GOOGLE_TOKEN_URL, {
    refresh_token: refreshToken,
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    grant_type: 'refresh_token'
  })
  
  return response.data
}

export const getAlbums = async (accessToken: string): Promise<GoogleAlbum[]> => {
  const response = await axios.get(`${GOOGLE_PHOTOS_API_BASE}/albums`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    params: {
      pageSize: 50
    }
  })
  
  return response.data.albums || []
}

export const getSharedAlbums = async (accessToken: string): Promise<GoogleAlbum[]> => {
  const response = await axios.get(`${GOOGLE_PHOTOS_API_BASE}/sharedAlbums`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    params: {
      pageSize: 50
    }
  })
  
  return response.data.sharedAlbums || []
}

export const getAlbumVideos = async (accessToken: string, albumId: string): Promise<GoogleMediaItem[]> => {
  const videos: GoogleMediaItem[] = []
  let pageToken: string | undefined = undefined
  
  do {
    const response = await axios.post(
      `${GOOGLE_PHOTOS_API_BASE}/mediaItems:search`,
      {
        albumId,
        pageSize: 100,
        pageToken,
        filters: {
          mediaTypeFilter: {
            mediaTypes: ['VIDEO']
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (response.data.mediaItems) {
      videos.push(...response.data.mediaItems)
    }
    
    pageToken = response.data.nextPageToken
  } while (pageToken)
  
  return videos
}

export const getAllVideos = async (accessToken: string, limit: number = 100): Promise<GoogleMediaItem[]> => {
  const videos: GoogleMediaItem[] = []
  let pageToken: string | undefined = undefined
  
  do {
    const response = await axios.post(
      `${GOOGLE_PHOTOS_API_BASE}/mediaItems:search`,
      {
        pageSize: Math.min(limit - videos.length, 100),
        pageToken,
        filters: {
          mediaTypeFilter: {
            mediaTypes: ['VIDEO']
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (response.data.mediaItems) {
      videos.push(...response.data.mediaItems)
    }
    
    pageToken = response.data.nextPageToken
    
    // Stop if we've reached the limit
    if (videos.length >= limit) break
  } while (pageToken)
  
  return videos.slice(0, limit)
}

export const getVideoUrl = (baseUrl: string): string => {
  // Google Photos requires specific parameters for video playback
  return `${baseUrl}=dv`
}

export const getThumbnailUrl = (baseUrl: string, width: number = 400): string => {
  return `${baseUrl}=w${width}`
} 