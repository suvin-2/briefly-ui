"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import { ReportCard } from "@/components/report-card"
import { GenerateReportDialog } from "@/components/generate-report-dialog"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Plus } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/lib/language-context"
import type { Report } from "@/types"
import * as reportService from "@/services/report.service"
import { toast } from "sonner"

export default function ReportPage() {
  const { t } = useLanguage()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const isMobile = useMobile()

  // 리포트 목록 조회
  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
    try {
      setLoading(true)
      const data = await reportService.getReports()
      setReports(data)
    } catch (error) {
      console.error("Failed to load reports:", error)
      toast.error("리포트를 불러오는데 실패했습니다")
    } finally {
      setLoading(false)
    }
  }

  const handleReportCreated = (newReport: Report) => {
    setReports((prev) => [newReport, ...prev])
    setDialogOpen(false)
    toast.success("리포트가 생성되었습니다")
  }

  const handleDelete = async (id: string) => {
    // Optimistic UI
    const previousReports = [...reports]
    setReports((prev) => prev.filter((report) => report.id !== id))

    try {
      await reportService.deleteReport(id)
      toast.success("리포트가 삭제되었습니다")
    } catch (error) {
      console.error("Failed to delete report:", error)
      toast.error("리포트 삭제에 실패했습니다")
      // 롤백
      setReports(previousReports)
    }
  }

  return (
    <AppShell>
      <div className="w-full space-y-8 px-4 md:px-0">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-balance text-3xl font-bold text-gray-900">{t.report}</h1>
            <p className="text-pretty text-gray-600">{t.reportHistory}</p>
          </div>
          {/* Desktop: Create button in header */}
          {!isMobile && (
            <Button
              onClick={() => setDialogOpen(true)}
              className="hidden bg-[#5D7AA5] text-white hover:bg-[#4d6a95] md:flex"
              // className="rounded-2xl bg-[#5D7AA5] px-6 py-6 text-base font-semibold text-white shadow-lg shadow-[#5D7AA5]/30 transition-all hover:scale-105 hover:bg-[#4D6A95] hover:shadow-xl hover:shadow-[#5D7AA5]/40"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t.createNewReport}
            </Button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <LoadingSpinner text="리포트를 불러오는 중..." />
        ) : reports.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <p className="text-lg font-medium">생성된 리포트가 없습니다</p>
            <p className="mt-2 text-sm">새 리포트를 만들어보세요!</p>
          </div>
        ) : (
          /* Report List */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Mobile: FAB */}
        {isMobile && (
          <button
            onClick={() => setDialogOpen(true)}
            className="fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[#5D7AA5] text-white shadow-lg transition-colors hover:bg-[#4A6285]"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}

        {/* Generate Report Dialog */}
        <GenerateReportDialog open={dialogOpen} onOpenChange={setDialogOpen} onReportCreated={handleReportCreated} />
      </div>
    </AppShell>
  )
}
