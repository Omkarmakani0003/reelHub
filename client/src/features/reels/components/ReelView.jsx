import React from 'react'
import useReel from '../hooks/useReel.js'

const ReelView = ({ item }) => {
  const {
    videoRef,
    isPlay,
    isActionHide,
    isVideoOrientation,
    togglePlay,
    updateVideoOrientation
  } = useReel(item)

  const videoSrc = item?.videoUrl || item?.clip || ''
  const profileName = item?.user?.username || item?.profile_name || 'reelnet_user'
  const description = item?.description || item?.title || 'No description'


  return (
    <div className="relative w-full h-full snap-start bg-zinc-950 flex items-center justify-center">
      <button
        type="button"
        aria-label={isPlay ? 'Pause video' : 'Play video'}
        className={`absolute z-20 flex ${isActionHide ? 'opacity-0' : 'opacity-100'} m-5 items-center justify-center w-20 h-20 rounded-full bg-black/45 backdrop-blur-md border border-white/10 text-white shadow-lg hover:scale-105 transition`}
        onClick={togglePlay}
      >
        {isPlay ? (
          <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
            <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
          </svg>
        ) : (
          <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <video
        ref={videoRef}
        className={`w-full h-full ${isVideoOrientation === 'landscape' ? 'object-contain' : 'object-cover'}`}
        src={videoSrc}
        loop
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={updateVideoOrientation}
        onCanPlay={updateVideoOrientation}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 flex flex-col justify-end p-4">
        <div className="pr-16 mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 p-[2px]">
              <div className="w-full h-full flex justify-center items-center rounded-full bg-zinc-800 border-2 border-black" >
                {profileName.charAt(0).toUpperCase()}
              </div>   
             </div>
            <span className="font-semibold text-sm tracking-wide">@{profileName}</span>
          </div>
          <p className="text-sm text-gray-200 line-clamp-2 leading-relaxed">{description}</p>
        </div>

        {/* <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-5">
          <button className="flex flex-col items-center group" type="button">
            <div className="p-3 bg-zinc-900/50 backdrop-blur-md rounded-full group-hover:bg-zinc-800/70 transition">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <span className="text-xs font-medium mt-1 drop-shadow">{likes}</span>
          </button>
        </div> */}
      </div>
    </div>
  )
}

export default ReelView
