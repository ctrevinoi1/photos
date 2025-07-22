import React, { useRef, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { motion } from 'framer-motion'

interface VideoPlayerProps {
  url: string
  isActive: boolean
  onEnded?: () => void
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, isActive, onEnded }) => {
  const playerRef = useRef<ReactPlayer>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  
  useEffect(() => {
    if (isActive) {
      setIsPlaying(true)
      setIsLoading(true)
    } else {
      setIsPlaying(false)
    }
  }, [isActive])
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }
  
  const handleMuteToggle = () => {
    setIsMuted(!isMuted)
  }
  
  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setProgress(state.played)
  }
  
  const handleDuration = (duration: number) => {
    setDuration(duration)
  }
  
  const handleReady = () => {
    setIsLoading(false)
  }
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {isLoading && isActive && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full spinner"></div>
        </div>
      )}
      
      <ReactPlayer
        ref={playerRef}
        url={url}
        playing={isPlaying && isActive}
        muted={isMuted}
        loop={false}
        width="100%"
        height="100%"
        style={{ objectFit: 'contain' }}
        onReady={handleReady}
        onProgress={handleProgress}
        onDuration={handleDuration}
        onEnded={onEnded}
        config={{
          file: {
            attributes: {
              style: { width: '100%', height: '100%', objectFit: 'contain' }
            }
          }
        }}
      />
      
      {/* Tap to play/pause overlay */}
      <button
        onClick={handlePlayPause}
        className="absolute inset-0 z-10"
        aria-label="Play/Pause"
      >
        {!isPlaying && isActive && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-black/50 rounded-full p-6">
              <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </motion.div>
        )}
      </button>
      
      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-safe-bottom">
        {/* Progress bar */}
        <div className="mb-4">
          <div className="bg-white/20 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-white h-full transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/70 mt-1">
            <span>{formatTime(progress * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Bottom controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleMuteToggle}
            className="p-2 bg-black/50 rounded-full"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer 