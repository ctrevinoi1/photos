import type { NextApiRequest, NextApiResponse } from 'next'
import { exchangeCodeForToken } from '@/utils/googlePhotos'
import Cookies from 'js-cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, error } = req.query
  
  if (error) {
    return res.redirect('/?error=auth_denied')
  }
  
  if (!code || typeof code !== 'string') {
    return res.redirect('/?error=no_code')
  }
  
  try {
    const tokenResponse = await exchangeCodeForToken(code)
    
    // Set tokens in cookies for client-side access
    const cookieOptions = {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 30 * 24 * 60 * 60 // 30 days
    }
    
    res.setHeader('Set-Cookie', [
      `access_token=${tokenResponse.access_token}; Path=/; ${cookieOptions.httpOnly ? 'HttpOnly;' : ''} ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}; Max-Age=${cookieOptions.maxAge}`,
      `refresh_token=${tokenResponse.refresh_token}; Path=/; ${cookieOptions.httpOnly ? 'HttpOnly;' : ''} ${cookieOptions.secure ? 'Secure;' : ''} SameSite=${cookieOptions.sameSite}; Max-Age=${cookieOptions.maxAge}`
    ])
    
    // Redirect to album selection page
    res.redirect('/albums')
  } catch (error) {
    console.error('Error exchanging code for token:', error)
    res.redirect('/?error=token_exchange_failed')
  }
} 