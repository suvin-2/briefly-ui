import { Skeleton } from "@/components/ui/skeleton"

export function TodoSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <Skeleton className="h-5 w-5 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-8 rounded-lg" />
    </div>
  )
}

export function TodoListSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2 md:gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <TodoSkeleton key={i} />
      ))}
    </div>
  )
}
