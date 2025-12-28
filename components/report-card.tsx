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
import { FileText, Download, Share2, X, FileDown } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { downloadAsMarkdown } from "@/lib/download-utils"
import { formatLocalDate } from "@/services/todo.service"
import type { Report } from "@/types"
import { toast } from "sonner"

interface ReportCardProps {
  report: Report
  onDelete: (id: string) => void
}

export function ReportCard({ report, onDelete }: ReportCardProps) {
  const { t } = useLanguage()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const handleDownloadMarkdown = () => {
    const filename = `${report.title.replace(/\s+/g, "-").toLowerCase()}.md`
    downloadAsMarkdown(report.summary, filename)
  }

  const handleDownloadPdf = async () => {
    let overlay: HTMLDivElement | null = null
    let reportContainer: HTMLDivElement | null = null

    try {
      setIsGeneratingPdf(true)

      // 1. 가림막(Overlay) 생성 - 화면 전체를 덮어서 깜빡임 방지
      overlay = document.createElement("div")
      Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#ffffff",
        zIndex: "9999", // 최상단
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "18px",
        fontWeight: "bold",
        color: "#5D7AA5",
        fontFamily: "Pretendard Variable, Pretendard, -apple-system, sans-serif",
      })
      overlay.innerText = "PDF 문서를 생성하고 있습니다..."
      document.body.appendChild(overlay)

      // 2. marked 라이브러리 import
      const { marked } = await import("marked")

      // 3. 리포트 컨테이너(A4) 생성 - 화면에 보이지만 overlay 뒤에 배치
      reportContainer = document.createElement("div")
      Object.assign(reportContainer.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "210mm", // A4 Width
        minHeight: "297mm", // A4 Height
        backgroundColor: "#ffffff",
        color: "#000000",
        zIndex: "9998", // 가림막 바로 아래 (렌더링은 되지만 보이지 않음)
        padding: "20mm",
        boxSizing: "border-box",
        fontFamily: "Pretendard Variable, Pretendard, -apple-system, sans-serif",
      })

      // 4. 스타일 태그 주입 (문서 예쁘게 꾸미기)
      const styleTag = document.createElement("style")
      styleTag.innerHTML = `
        .pdf-content {
          font-family: 'Pretendard Variable', 'Pretendard', -apple-system, sans-serif;
          color: #000000;
          font-size: 14px;
        }
        .pdf-content h1 {
          font-size: 20px;
          color: #333;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
          margin-top: 20px;
          margin-bottom: 12px;
          font-weight: bold;
        }
        .pdf-content h2 {
          font-size: 18px;
          color: #555;
          margin-top: 15px;
          margin-bottom: 8px;
          font-weight: bold;
        }
        .pdf-content h3 {
          font-size: 16px;
          color: #666;
          margin-top: 10px;
          margin-bottom: 6px;
          font-weight: bold;
        }
        .pdf-content ul {
          padding-left: 20px;
          margin-bottom: 10px;
        }
        .pdf-content ol {
          padding-left: 20px;
          margin-bottom: 10px;
        }
        .pdf-content li {
          margin-bottom: 4px;
          line-height: 1.6;
        }
        .pdf-content p {
          margin-bottom: 10px;
          line-height: 1.6;
        }
        .pdf-content blockquote {
          border-left: 4px solid #5D7AA5;
          padding-left: 10px;
          color: #666;
          margin: 10px 0;
          font-style: italic;
        }
        .pdf-content code {
          background-color: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
          font-size: 13px;
        }
        .pdf-content pre {
          background-color: #f5f5f5;
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
          margin-bottom: 10px;
        }
        .pdf-content strong {
          font-weight: bold;
        }
        .pdf-content em {
          font-style: italic;
        }
      `
      reportContainer.appendChild(styleTag)

      // 5. 헤더 섹션 추가
      const title = document.createElement("h1")
      title.innerText = report.title || "Weekly Report"
      title.style.fontSize = "24px"
      title.style.fontWeight = "bold"
      title.style.marginBottom = "12px"
      title.style.color = "#5D7AA5"
      title.style.fontFamily = "Pretendard Variable, Pretendard, -apple-system, sans-serif"
      reportContainer.appendChild(title)

      const dateRange = document.createElement("p")
      dateRange.innerText = `${formatLocalDate(report.startDate)} ~ ${formatLocalDate(report.endDate)}`
      dateRange.style.fontSize = "12px"
      dateRange.style.color = "#666666"
      dateRange.style.marginBottom = "24px"
      dateRange.style.fontFamily = "Pretendard Variable, Pretendard, -apple-system, sans-serif"
      reportContainer.appendChild(dateRange)

      // 구분선 추가
      const divider = document.createElement("hr")
      divider.style.border = "none"
      divider.style.borderTop = "2px solid #5D7AA5"
      divider.style.marginBottom = "20px"
      reportContainer.appendChild(divider)

      // 6. Markdown을 HTML로 변환하여 주입
      const htmlContent = await marked.parse(report.summary)
      const contentContainer = document.createElement("div")
      contentContainer.className = "pdf-content"
      contentContainer.innerHTML = htmlContent // HTML로 주입
      reportContainer.appendChild(contentContainer)

      // DOM에 추가 (캡처를 위해 필수)
      document.body.appendChild(reportContainer)

      // 7. 핵심: 렌더링 기다리기 (Delay)
      await document.fonts.ready // 폰트 로딩 대기
      await new Promise((resolve) => setTimeout(resolve, 500)) // 0.5초 렌더링 대기

      // 8. 이미지 변환 (html-to-image)
      const { toPng } = await import("html-to-image")
      const dataUrl = await toPng(reportContainer, {
        quality: 0.95,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      })

      // 9. PDF 저장 (jspdf)
      const { jsPDF } = await import("jspdf")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgProps = pdf.getImageProperties(dataUrl)
      const pdfHeight = (imgProps.height * 210) / imgProps.width // A4 너비 기준 높이 계산

      pdf.addImage(dataUrl, "PNG", 0, 0, 210, pdfHeight)

      // 날짜 포맷팅 for filename
      const dateStr = formatLocalDate(report.startDate).replace(/-/g, "")
      const filename = `Report_${dateStr}.pdf`
      pdf.save(filename)

      toast.success("PDF 다운로드 완료")
    } catch (error) {
      console.error("PDF generation failed:", error)
      alert("PDF 생성 중 오류가 발생했습니다.")
    } finally {
      // 10. 뒷정리 (가림막과 리포트 컨테이너 제거)
      if (overlay && document.body.contains(overlay)) {
        document.body.removeChild(overlay)
      }
      if (reportContainer && document.body.contains(reportContainer)) {
        document.body.removeChild(reportContainer)
      }
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
    // Web Share API 사용 (모바일 우선)
    if (navigator.share) {
      try {
        await navigator.share({
          title: report.title,
          text: report.summary,
        })
      } catch (error) {
        // 사용자가 취소한 경우 무시
        if ((error as Error).name !== "AbortError") {
          console.error("Share failed:", error)
        }
      }
    } else {
      // Fallback: 클립보드에 복사
      try {
        await navigator.clipboard.writeText(report.summary)
        toast.success("리포트 내용이 클립보드에 복사되었습니다")
      } catch (error) {
        console.error("Copy failed:", error)
        toast.error("복사에 실패했습니다")
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
        className="group flex h-full flex-col border-gray-200 bg-white shadow-lg transition-all hover:shadow-xl hover:shadow-gray-200/60"
      >
        <CardHeader className="p-6">
          <div className="flex items-start justify-between">
            {/* Left: Report Icon */}
            <div className="rounded-2xl bg-[#5D7AA5] p-3 shadow-md shadow-[#5D7AA5]/20">
              <FileText className="h-6 w-6 text-white" />
            </div>

            <button
              onClick={handleDeleteClick}
              className="text-gray-400 transition-colors hover:text-red-500"
              aria-label="Delete report"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

        {/* Title and Date below icons */}
        <div className="mt-4 space-y-2">
          <h3 className="line-clamp-2 text-balance text-xl font-bold text-gray-900" title={report.title}>
            {report.title}
          </h3>
          <p className="text-sm font-medium text-[#5D7AA5]">{dateRange}</p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-6 pt-0">
        <div className="space-y-3 rounded-2xl bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="shrink-0 font-medium text-gray-500">{t.template}:</span>
            <span className="truncate rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm">
              Basic Markdown
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-500">{t.created}:</span>
            <span className="font-medium text-gray-700">{createdAt}</span>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isGeneratingPdf}
                className="flex-1 rounded-xl border-gray-200 bg-white font-medium text-gray-700 shadow-sm transition-all hover:border-[#5D7AA5] hover:bg-[#5D7AA5] hover:text-white"
              >
                <Download className="mr-2 h-4 w-4" />
                {isGeneratingPdf ? "생성 중..." : t.download}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDownloadMarkdown} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                <span>Markdown (.md)</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadPdf} className="cursor-pointer">
                <FileDown className="mr-2 h-4 w-4" />
                <span>PDF 문서 (.pdf)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex-1 rounded-xl border-gray-200 bg-white font-medium text-gray-700 shadow-sm transition-all hover:border-[#5D7AA5] hover:bg-[#5D7AA5] hover:text-white"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {t.share}
          </Button>
        </div>
      </CardContent>
    </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>리포트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 리포트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
