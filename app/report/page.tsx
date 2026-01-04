"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { ReportCard } from "@/components/features/report/report-card"
import { GenerateReportDialog } from "@/components/features/report/generate-report-dialog"
import { EditReportDialog } from "@/components/features/report/edit-report-dialog"
import { Button } from "@/components/ui/button"
import { ReportListSkeleton } from "@/components/features/report/report-skeleton"
import { Plus, FileText, Sparkles } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/lib/language-context"
import type { Report } from "@/types"
import * as reportService from "@/services/report.service"
import { toast } from "sonner"
import { useOptimisticMutation, optimisticArrayHelpers } from "@/hooks/use-optimistic-mutation"

export default function ReportPage() {
  const { t } = useLanguage()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const isMobile = useMobile()
  const { mutate } = useOptimisticMutation<Report[]>()

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
    await mutate(reports, setReports, optimisticArrayHelpers.remove(id), () => reportService.deleteReport(id), {
      successMessage: "리포트가 삭제되었습니다",
      errorMessage: "리포트 삭제에 실패했습니다",
    })
  }

  const handleEdit = (id: string) => {
    const report = reports.find((r) => r.id === id)
    if (report) {
      setSelectedReport(report)
      setEditDialogOpen(true)
    }
  }

  const handleSaveEdit = async (id: string, updates: { title: string; summary: string }) => {
    try {
      const updatedReport = await reportService.updateReport(id, updates)
      setReports((prev) => prev.map((report) => (report.id === id ? updatedReport : report)))
      toast.success(t.reportUpdated)
    } catch (error) {
      console.error("Failed to update report:", error)
      toast.error(t.reportUpdateFailed)
      throw error
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
          <ReportListSkeleton />
        ) : reports.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center gap-6 py-16 text-center" role="status">
            <div className="rounded-full bg-gradient-to-br from-[#5D7AA5]/10 to-[#5D7AA5]/5 p-6">
              <FileText className="h-12 w-12 text-[#5D7AA5]" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">생성된 리포트가 없습니다</p>
              <p className="text-sm text-gray-500">완료된 할 일을 바탕으로 리포트를 만들어보세요!</p>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              className="mt-2 bg-[#5D7AA5] text-white hover:bg-[#4d6a95]"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              새 리포트 만들기
            </Button>
          </div>
        ) : (
          /* Report List */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" role="list" aria-label="리포트 목록">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} onDelete={handleDelete} onEdit={handleEdit} />
            ))}
          </div>
        )}

        {/* Mobile: FAB */}
        {isMobile && (
          <button
            onClick={() => setDialogOpen(true)}
            className="fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[#5D7AA5] text-white shadow-lg transition-colors hover:bg-[#4A6285]"
            aria-label="새 리포트 생성"
          >
            <Plus className="h-6 w-6" />
          </button>
        )}

        {/* Generate Report Dialog */}
        <GenerateReportDialog open={dialogOpen} onOpenChange={setDialogOpen} onReportCreated={handleReportCreated} />

        {/* Edit Report Dialog */}
        <EditReportDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          report={selectedReport}
          onSave={handleSaveEdit}
        />
      </div>
    </AppShell>
  )
}
