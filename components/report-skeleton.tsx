import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function ReportSkeleton() {
  return (
    <Card className="group flex h-full flex-col border-gray-200 bg-white shadow-lg">
      <CardHeader className="p-6">
        <div className="flex items-start justify-between">
          <Skeleton className="h-12 w-12 rounded-2xl" />
          <Skeleton className="h-5 w-5" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-6 pt-0">
        <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-9 flex-1 rounded-xl" />
          <Skeleton className="h-9 flex-1 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  )
}

export function ReportListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <ReportSkeleton key={i} />
      ))}
    </div>
  )
}
