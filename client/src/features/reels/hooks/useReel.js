import { useState, useEffect, useRef } from 'react'

const useReel = (item) => {
  const videoRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isPlay, setIsPlay] = useState(true)
  const [isActionHide, setIsActionHide] = useState(true)
  const [isVideoOrientation, setVideoOrientation] = useState('portrait')

  const updateVideoOrientation = () => {
    const video = videoRef.current
    if (!video) return

    const ratio = video.videoWidth / video.videoHeight
    setVideoOrientation(ratio >= 1 ? 'landscape' : 'portrait')
  }

  const togglePlay = async () => {
    if (!videoRef.current) return

    if (videoRef.current.paused) {
      setIsActionHide(false)
      await videoRef.current.play()
      setIsPlay(true)
      setTimeout(() => {
        setIsActionHide(true)
      }, 800)
    } else {
      setIsActionHide(false)
      videoRef.current.pause()
      setIsPlay(false)
    }
  }

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '200px',
      threshold: 0.6
    }

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoaded) {
          setIsLoaded(true)
        }

        if (videoRef.current) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6 && isPlay) {
            updateVideoOrientation()
            videoRef.current.play().catch((err) => console.log('Autoplay blocked:', err))
          } else {
            videoRef.current.pause()
          }
        }
      })
    }

    const observer = new IntersectionObserver(handleIntersection, observerOptions)

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => {
      if (videoRef.current) observer.disconnect()
    }
  }, [isLoaded, item?.videoUrl, isPlay])

  return {
    videoRef,
    isLoaded,
    isPlay,
    isActionHide,
    isVideoOrientation,
    togglePlay,
    updateVideoOrientation
  }
}

export default useReel
