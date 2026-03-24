export default function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface-container p-5 rounded-xl flex items-center gap-5 border border-transparent">
          <div className="w-14 h-14 bg-surface-bright rounded-lg animate-pulse shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-surface-bright rounded w-2/3 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-3 bg-surface-bright rounded w-16 animate-pulse" />
              <div className="h-3 bg-surface-bright rounded w-24 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
