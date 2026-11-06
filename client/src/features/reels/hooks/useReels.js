import { useCallback, useEffect, useRef, useState } from 'react'
import { getReels } from '../api/reelApi.js'

export const useReel = (item) => {
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
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      setIsActionHide(false)
      try {
        await video.play()
        setIsPlay(true)
      } catch (error) {
        console.log('Playback blocked:', error)
      }

      setTimeout(() => {
        setIsActionHide(true)
      }, 800)
    } else {
      setIsActionHide(false)
      video.pause()
      setIsPlay(false)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video || !item?.videoUrl) return

    const handleLoadedMetadata = () => updateVideoOrientation()
    const handleCanPlay = () => {
      setIsLoaded(true)
      updateVideoOrientation()
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplay', handleCanPlay)

    if (video.readyState >= 2) {
      handleCanPlay()
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [item?.videoUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !item?.videoUrl) return

    const observerOptions = {
      root: null,
      rootMargin: '200px',
      threshold: 0.6
    }

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          video.pause()
          return
        }

        if (entry.intersectionRatio >= 0.6 && isPlay) {
          updateVideoOrientation()
          if (video.readyState >= 2) {
            video.play().catch((err) => console.log('Autoplay blocked:', err))
          }
        } else {
          video.pause()
        }
      })
    }

    const observer = new IntersectionObserver(handleIntersection, observerOptions)
    observer.observe(video)

    return () => observer.disconnect()
  }, [item?.videoUrl, isPlay])

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

export const useReels = (initialParams = {}) => {
  const [reels, setReels] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const pageRef = useRef(1)

  const fetchReels = useCallback(async (params = initialParams, append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      setError(null)

      const response = await getReels(params)
      const nextReels = response.reels ?? []
      const nextPagination = response.pagination ?? null

      setReels((prev) => (append ? [...prev, ...nextReels] : nextReels))
      setPagination(nextPagination)

      if (!append) {
        pageRef.current = Number(params.page ?? 1)
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load reels.')
      if (!append) {
        setReels([])
        setPagination(null)
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [initialParams])

  const loadNextPage = useCallback(() => {
    if (!pagination || !pagination.hasNextPage || loadingMore || loading) {
      return
    }

    const nextPage = Number(pagination.page || pageRef.current) + 1
    pageRef.current = nextPage
    fetchReels({ ...initialParams, page: nextPage, limit: initialParams.limit || 9 }, true)
  }, [fetchReels, initialParams, loading, loadingMore, pagination])

  useEffect(() => {
    const params = {
      page: initialParams.page || 1,
      limit: initialParams.limit || 9,
      ...initialParams
    }

    pageRef.current = Number(params.page)
    fetchReels(params, false)
  }, [])

  return {
    reels,
    pagination,
    loading,
    loadingMore,
    error,
    refetch: fetchReels,
    loadNextPage
  }
}

export default useReels
