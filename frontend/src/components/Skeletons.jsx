export function VehicleCardSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 overflow-hidden animate-pulse">
      <div className="h-48 bg-neutral-200" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-neutral-200 rounded w-2/3" />
        <div className="h-3 bg-neutral-200 rounded w-1/3" />
        <div className="h-6 bg-neutral-200 rounded w-1/2 mt-4" />
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="h-9 bg-neutral-200 rounded-xl" />
          <div className="h-9 bg-neutral-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 p-6 animate-pulse">
      <div className="h-3 bg-neutral-200 rounded w-1/2 mb-3" />
      <div className="h-8 bg-neutral-200 rounded w-1/3" />
    </div>
  )
}

export function BookingSkeleton() {
  return (
    <div className="rounded-2xl border border-neutral-200 p-5 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-4 bg-neutral-200 rounded w-1/3" />
        <div className="h-5 bg-neutral-200 rounded-full w-20" />
      </div>
      <div className="h-3 bg-neutral-200 rounded w-1/2" />
      <div className="h-3 bg-neutral-200 rounded w-2/3" />
    </div>
  )
}