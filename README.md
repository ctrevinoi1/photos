# Photos Scroll - TikTok Style Google Photos Viewer

A mobile-first web app that displays videos from your Google Photos albums in a TikTok-style vertical scrolling interface, optimized for iPhone.

## Features

- 🎥 TikTok-style vertical video scrolling
- 📱 Optimized for iPhone and mobile devices
- 🔐 Secure Google Photos OAuth integration
- 💾 Persistent authentication (no need to reconnect each time)
- 🎨 Beautiful, modern UI with smooth animations
- ⚡ Fast video loading and playback
- 📲 PWA support for app-like experience

## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Photos Library API**:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Photos Library API"
   - Click on it and press "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For development: `http://localhost:3000/api/auth/callback`
     - For production: `https://your-app-name.vercel.app/api/auth/callback`
   - Save the Client ID and Client Secret

### 2. Local Development Setup

1. Clone this repository
2. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in your Google OAuth credentials in `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) on your iPhone or in your browser

## Deployment to Vercel

### 1. Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. During setup, add the environment variables:
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel app URL)
4. Deploy!

### 2. Update Google OAuth Settings

1. Go back to Google Cloud Console
2. Update your OAuth client to include your Vercel URL:
   - Add `https://your-app-name.vercel.app/api/auth/callback` to authorized redirect URIs
3. Save the changes

### 3. Access Your App

Visit your Vercel URL on your iPhone for the best experience!

## Usage

1. **First Launch**: Click "Continue with Google" and authorize the app
2. **Select Album**: Choose a Google Photos album containing videos
3. **Navigate Videos**:
   - Swipe up: Next video
   - Swipe down: Previous video
   - Tap: Play/Pause
   - Side dots: Jump to specific video
4. **Persistent Connection**: Your authentication is saved, so you won't need to reconnect each time

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Video Player**: React Player
- **Animations**: Framer Motion
- **Authentication**: Google OAuth 2.0
- **Deployment**: Vercel

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Troubleshooting

### Videos not loading?
- Ensure your Google Photos album contains videos (not just photos)
- Check that the Google Photos Library API is enabled
- Try refreshing your authentication token

### Authentication issues?
- Verify your OAuth credentials are correct
- Ensure redirect URIs match exactly in Google Console
- Clear browser cookies and try again

### Mobile display issues?
- The app is optimized for portrait mode
- For best experience, add to home screen on iPhone
- Ensure JavaScript is enabled

## License

MIT License - feel free to use this project for your own purposes! 