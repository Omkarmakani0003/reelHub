const ReelSkeleton = () => (
  <div className="relative w-full h-[70vh] snap-start bg-zinc-950 overflow-hidden">
    <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950" />
    <div className="absolute inset-x-0 bottom-0 p-4 space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-zinc-700 animate-pulse" />
        <div className="h-4 w-28 rounded-full bg-zinc-700 animate-pulse" />
      </div>
      <div className="h-4 w-48 rounded-full bg-zinc-700 animate-pulse" />
      <div className="h-4 w-36 rounded-full bg-zinc-700 animate-pulse" />
    </div>
  </div>
)

export default ReelSkeleton
