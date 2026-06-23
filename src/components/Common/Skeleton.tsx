export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-panel/50 rounded ${className}`} />
)

export const SkeletonCard = () => (
  <div className="glass-card p-6 space-y-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
)

export const SkeletonTable = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-2">
    <div className="flex gap-4">
      {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 flex-1" />)}
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4">
        {[...Array(5)].map((_, j) => <Skeleton key={j} className="h-6 flex-1" />)}
      </div>
    ))}
  </div>
)
