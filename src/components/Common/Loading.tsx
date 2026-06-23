export const LoadingSpinner = ({ size = 40 }: { size?: number }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-blue/20 border-t-blue rounded-full animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-blue rounded-full animate-pulse" />
      </div>
    </div>
  </div>
)

export const PageLoader = () => (
  <div className="fixed inset-0 bg-bg flex items-center justify-center z-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue/20 border-t-blue rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted">加载中...</p>
    </div>
  </div>
)

export const SkeletonCard = () => (
  <div className="glass-card p-6 animate-pulse">
    <div className="h-4 bg-panel/50 rounded w-3/4 mb-3" />
    <div className="h-8 bg-panel/50 rounded w-1/2 mb-3" />
    <div className="h-4 bg-panel/50 rounded w-full mb-2" />
    <div className="h-4 bg-panel/50 rounded w-2/3" />
  </div>
)

export const SkeletonTable = ({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) => (
  <div className="space-y-2 animate-pulse">
    <div className="flex gap-4">
      {[...Array(cols)].map((_, i) => <div key={i} className="h-6 bg-panel/50 rounded flex-1" />)}
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4">
        {[...Array(cols)].map((_, j) => <div key={j} className="h-8 bg-panel/30 rounded flex-1" />)}
      </div>
    ))}
  </div>
)
