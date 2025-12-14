"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Share2, X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"

interface ReportCardProps {
  id: string
  title: string
  dateRange: string
  createdAt: string
  template: string
  templateDeleted?: boolean
}

export function ReportCard({ title, dateRange, createdAt, template, templateDeleted = false }: ReportCardProps) {
  const { t } = useLanguage()

  return (
    <Card className="group flex h-full flex-col border-gray-200 bg-white shadow-lg transition-all hover:shadow-xl hover:shadow-gray-200/60">
      <CardHeader className="p-6">
        <div className="flex items-start justify-between">
          {/* Left: Report Icon */}
          <div className="rounded-2xl bg-[#5D7AA5] p-3 shadow-md shadow-[#5D7AA5]/20">
            <FileText className="h-6 w-6 text-white" />
          </div>

          <button className="text-gray-400 transition-colors hover:text-red-500" aria-label="Delete report">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Title and Date below icons */}
        <div className="mt-4 space-y-2">
          <h3 className="line-clamp-2 text-balance text-xl font-bold text-gray-900" title={title}>
            {title}
          </h3>
          <p className="text-sm font-medium text-[#5D7AA5]">{dateRange}</p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-6 pt-0">
        <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="shrink-0 font-medium text-gray-500">{t.template}:</span>
            <span
              className="truncate rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm"
              title={template}
            >
              {template}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-500">{t.created}:</span>
            <span className="font-medium text-gray-700">{createdAt}</span>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={templateDeleted}
            className={cn(
              "flex-1 rounded-xl border-gray-200 font-medium shadow-sm transition-all",
              templateDeleted
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "bg-white text-gray-700 hover:border-[#5D7AA5] hover:bg-[#5D7AA5] hover:text-white",
            )}
            title={templateDeleted ? "Source template deleted" : undefined}
          >
            <Download className="mr-2 h-4 w-4" />
            {templateDeleted ? "Text Only" : t.download}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl border-gray-200 bg-white font-medium text-gray-700 shadow-sm transition-all hover:border-[#5D7AA5] hover:bg-[#5D7AA5] hover:text-white"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {t.share}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
