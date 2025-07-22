import type { NextApiRequest, NextApiResponse } from 'next'
import { refreshAccessToken } from '@/utils/googlePhotos'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  const { refreshToken } = req.body
  
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' })
  }
  
  try {
    const tokenResponse = await refreshAccessToken(refreshToken)
    
    res.status(200).json({
      accessToken: tokenResponse.access_token,
      expiresIn: tokenResponse.expires_in
    })
  } catch (error) {
    console.error('Error refreshing token:', error)
    res.status(401).json({ error: 'Failed to refresh token' })
  }
} 