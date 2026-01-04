"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FileText, Download, Share2, X, FileDown, Edit } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { downloadAsMarkdown } from "@/lib/download-utils"
import { formatLocalDate } from "@/services/todo.service"
import { downloadReportAsPdf } from "@/services/report.service"
import type { Report } from "@/types"
import { toast } from "sonner"

interface ReportCardProps {
  report: Report
  onDelete: (id: string) => void
  onEdit: (id: string) => void
}

export function ReportCard({ report, onDelete, onEdit }: ReportCardProps) {
  const { t } = useLanguage()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const handleDownloadMarkdown = () => {
    const filename = `${report.title.replace(/\s+/g, "-").toLowerCase()}.md`
    downloadAsMarkdown(report.summary, filename)
  }

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true)
      await downloadReportAsPdf(report, t.pdfGenerating)
      toast.success(t.pdfDownloadSuccess)
    } catch (error) {
      console.error("PDF generation failed:", error)

      let errorMessage = t.pdfGenerationError

      if (error instanceof Error) {
        if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = t.networkError
        } else if (error.message.includes("memory") || error.message.includes("heap")) {
          errorMessage = t.memoryError
        }
      }

      toast.error(errorMessage, {
        description: t.pdfFallbackMessage,
        action: {
          label: t.retry,
          onClick: () => handleDownloadPdf(),
        },
      })
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    onDelete(report.id)
    setShowDeleteDialog(false)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: report.summary,
        })
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error)
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(report.summary)
        toast.success(t.reportCopiedToClipboard)
      } catch (error) {
        console.error("Copy failed:", error)
        toast.error(t.copyFailed)
      }
    }
  }

  const dateRange = `${formatLocalDate(report.startDate)} ~ ${formatLocalDate(report.endDate)}`
  const createdAt = new Date(report.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <>
      <Card
        className="group flex h-full flex-col border-gray-200 bg-white shadow-lg transition-all hover:shadow-xl hover:shadow-gray-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:shadow-none"
        role="article"
        aria-labelledby={`report-title-${report.id}`}
      >
        <CardHeader className="p-6">
          <div className="flex items-start justify-between">
            {/* Left: Report Icon */}
            <div className="rounded-2xl bg-[#5D7AA5] p-3 shadow-md shadow-[#5D7AA5]/20" aria-hidden="true">
              <FileText className="h-6 w-6 text-white" />
            </div>

            <button
              onClick={handleDeleteClick}
              className="text-gray-400 transition-colors hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400"
              aria-label={`${report.title} 리포트 삭제`}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

        {/* Title and Date below icons */}
        <div className="mt-4 space-y-2">
          <h3
            id={`report-title-${report.id}`}
            className="line-clamp-2 text-balance text-xl font-bold text-gray-900 dark:text-slate-50"
            title={report.title}
          >
            {report.title}
          </h3>
          <p className="text-sm font-medium text-[#5D7AA5] dark:text-[#7B9BC9]" aria-label={`기간: ${dateRange}`}>
            {dateRange}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-6 pt-0">
        <div className="space-y-3 rounded-2xl bg-gray-50 p-4 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="shrink-0 font-medium text-gray-500 dark:text-slate-400">{t.template}:</span>
            <span className="truncate rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm dark:bg-slate-950/50 dark:text-slate-200 dark:shadow-none">
              Basic Markdown
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-500 dark:text-slate-400">{t.created}:</span>
            <span className="font-medium text-gray-700 dark:text-slate-200">{createdAt}</span>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(report.id)}
            className="flex-1 rounded-xl border-gray-200 bg-white font-medium text-gray-700 shadow-sm transition-all hover:border-[#5D7AA5] hover:bg-[#5D7AA5] hover:text-white dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200 dark:shadow-none dark:hover:border-[#5D7AA5] dark:hover:bg-[#5D7AA5] dark:hover:text-white"
            aria-label={`${report.title} 리포트 수정`}
          >
            <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
            {t.edit}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isGeneratingPdf}
                className="flex-1 rounded-xl border-gray-200 bg-white font-medium text-gray-700 shadow-sm transition-all hover:border-[#5D7AA5] hover:bg-[#5D7AA5] hover:text-white dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200 dark:shadow-none dark:hover:border-[#5D7AA5] dark:hover:bg-[#5D7AA5] dark:hover:text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                {isGeneratingPdf ? t.generating : t.download}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDownloadMarkdown} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                <span>{t.markdownFile}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPdf} className="cursor-pointer">
                <FileDown className="mr-2 h-4 w-4" />
                <span>{t.pdfFile}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1 rounded-xl border-gray-200 bg-white font-medium text-gray-700 shadow-sm transition-all hover:border-[#5D7AA5] hover:bg-[#5D7AA5] hover:text-white dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-200 dark:shadow-none dark:hover:border-[#5D7AA5] dark:hover:bg-[#5D7AA5] dark:hover:text-white"
            aria-label={`${report.title} 리포트 공유`}
          >
            <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
            {t.share}
          </Button>
        </div>
      </CardContent>
    </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteReport}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.deleteReportConfirm}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
