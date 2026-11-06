import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ReelSkeleton from '../features/reels/components/ReelSkeleton.jsx'
import ReelView from '../features/reels/components/ReelView.jsx'
import useReels from '../features/reels/hooks/useReels.js'
import { useAuth } from '../features/auth/context/AuthContext'

const Home = () => {
  const navigate = useNavigate()
  const scrollRef = useRef(null)
  const { logout } = useAuth()
  const { reels, loading, loadingMore, error, pagination, loadNextPage } = useReels({ page: 1, limit: 9 })

  useEffect(() => {
    if (error) {
      console.error('Reels fetch error:', error)
    }
  }, [error])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const nearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 250
      if (nearBottom) {
        loadNextPage()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [loadNextPage])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="bg-gray-900 text-white flex justify-center flex-col items-center h-screen overflow-hidden">
      <div ref={scrollRef} className="w-full max-w-md h-screen md:h-[95vh] md:max-h-[800px] md:rounded-t-2xl md:border md:border-zinc-800 overflow-y-scroll snap-y snap-mandatory scrollbar-none bg-black shadow-2xl">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => <ReelSkeleton key={index} />)
        ) : error ? (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red-400">
            {error}
          </div>
        ) : (
          <>
            {reels.map((item) => (
              <ReelView key={item._id || item.id} item={item} />
            ))}

            {loadingMore && (
              <div className="space-y-2">
                <ReelSkeleton />
                <ReelSkeleton />
              </div>
            )}

            {!loadingMore && pagination && !pagination.hasNextPage && reels.length > 0 && (
              <div className="flex items-center justify-center py-6 text-xs text-zinc-500">
                You&apos;ve reached the end
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-around items-center w-full max-w-md h-15 md:rounded-b-2xl bg-black/45">
        <Link>
          <svg xmlns="http://www.w3.org" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </Link>

        {/* <Link>
          <svg xmlns="http://www.w3.org" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </Link> */}

        <Link to="/profile">
          <svg xmlns="http://www.w3.org" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default Home