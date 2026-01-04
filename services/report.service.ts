import { supabase } from "@/lib/supabase"
import type { Report, Todo } from "@/types"
import { formatLocalDate } from "./todo.service"
import { generateReportByTemplate, type TemplateType } from "@/lib/report-templates"

// ========================================
// Database 타입 (Supabase 스키마와 일치)
// ========================================
interface DatabaseReport {
  id: string
  user_id: string
  title?: string // Optional - 원본 스키마에는 없음
  summary: string
  period_start: string
  period_end: string
  created_at: string
}

// ========================================
// 타입 변환 헬퍼 함수
// ========================================
function fromDatabase(dbReport: DatabaseReport): Report {
  return {
    id: dbReport.id,
    title: dbReport.title || "Untitled Report", // Fallback for old records
    summary: dbReport.summary,
    startDate: new Date(dbReport.period_start),
    endDate: new Date(dbReport.period_end),
    createdAt: new Date(dbReport.created_at),
  }
}

// ========================================
// Report Service Functions
// ========================================

/**
 * 모든 리포트 조회 (최신순)
 */
export async function getReports(): Promise<Report[]> {
  const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reports:", error)
    throw new Error(error.message)
  }

  return (data as DatabaseReport[]).map(fromDatabase)
}

/**
 * 리포트 생성
 * @param title - 리포트 제목
 * @param startDate - 기간 시작일
 * @param endDate - 기간 종료일
 * @param todos - 해당 기간의 완료된 투두 목록
 * @param templateType - 사용할 템플릿 타입 (기본값: "basic")
 */
export async function createReport(
  title: string,
  startDate: Date,
  endDate: Date,
  todos: Todo[],
  templateType: TemplateType = "basic",
): Promise<Report> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // 선택된 템플릿으로 마크다운 생성
  const summary = generateReportByTemplate(templateType, todos, startDate, endDate)

  const { data, error } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      title,
      summary,
      period_start: formatLocalDate(startDate),
      period_end: formatLocalDate(endDate),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating report:", error)
    throw new Error(error.message)
  }

  return fromDatabase(data as DatabaseReport)
}

/**
 * 리포트 수정
 */
export async function updateReport(
  id: string,
  updates: { title?: string; summary?: string }
): Promise<Report> {
  const { data, error } = await supabase
    .from("reports")
    .update({
      title: updates.title,
      summary: updates.summary,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating report:", error)
    throw new Error(error.message)
  }

  return fromDatabase(data as DatabaseReport)
}

/**
 * 리포트 삭제
 */
export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase.from("reports").delete().eq("id", id)

  if (error) {
    console.error("Error deleting report:", error)
    throw new Error(error.message)
  }
}

/**
 * PDF 생성을 위한 오버레이 생성
 */
function createPdfOverlay(message: string): HTMLDivElement {
  const overlay = document.createElement("div")
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "#ffffff",
    zIndex: "9999",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
    color: "#5D7AA5",
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, sans-serif",
  })
  overlay.innerText = message
  return overlay
}

/**
 * PDF를 위한 리포트 컨테이너(A4) 생성
 */
function createReportContainer(): HTMLDivElement {
  const container = document.createElement("div")
  Object.assign(container.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "210mm",
    minHeight: "297mm",
    backgroundColor: "#ffffff",
    color: "#000000",
    zIndex: "9998",
    padding: "20mm",
    boxSizing: "border-box",
    fontFamily: "Pretendard Variable, Pretendard, -apple-system, sans-serif",
  })
  return container
}

/**
 * PDF 스타일 태그 생성
 */
function createPdfStyleTag(): HTMLStyleElement {
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
  return styleTag
}

/**
 * 리포트 헤더 추가 (제목 + 날짜 범위 + 구분선)
 */
function addReportHeader(container: HTMLDivElement, report: Report): void {
  const title = document.createElement("h1")
  title.innerText = report.title || "Weekly Report"
  title.style.fontSize = "24px"
  title.style.fontWeight = "bold"
  title.style.marginBottom = "12px"
  title.style.color = "#5D7AA5"
  title.style.fontFamily = "Pretendard Variable, Pretendard, -apple-system, sans-serif"
  container.appendChild(title)

  const dateRange = document.createElement("p")
  dateRange.innerText = `${formatLocalDate(report.startDate)} ~ ${formatLocalDate(report.endDate)}`
  dateRange.style.fontSize = "12px"
  dateRange.style.color = "#666666"
  dateRange.style.marginBottom = "24px"
  dateRange.style.fontFamily = "Pretendard Variable, Pretendard, -apple-system, sans-serif"
  container.appendChild(dateRange)

  const divider = document.createElement("hr")
  divider.style.border = "none"
  divider.style.borderTop = "2px solid #5D7AA5"
  divider.style.marginBottom = "20px"
  container.appendChild(divider)
}

/**
 * 리포트를 PDF로 다운로드
 * @param report - PDF로 변환할 리포트 객체
 * @param overlayMessage - 오버레이에 표시할 메시지
 */
export async function downloadReportAsPdf(
  report: Report,
  overlayMessage: string = "PDF 문서를 생성하고 있습니다..."
): Promise<void> {
  let overlay: HTMLDivElement | null = null
  let reportContainer: HTMLDivElement | null = null

  try {
    // 1. 오버레이 생성 및 표시
    overlay = createPdfOverlay(overlayMessage)
    document.body.appendChild(overlay)

    // 2. marked 라이브러리 import
    const { marked } = await import("marked")

    // 3. 리포트 컨테이너 생성
    reportContainer = createReportContainer()
    reportContainer.appendChild(createPdfStyleTag())
    addReportHeader(reportContainer, report)

    // 4. Markdown을 HTML로 변환하여 주입
    const htmlContent = await marked.parse(report.summary)
    const contentContainer = document.createElement("div")
    contentContainer.className = "pdf-content"
    contentContainer.innerHTML = htmlContent
    reportContainer.appendChild(contentContainer)

    // DOM에 추가 (캡처를 위해 필수)
    document.body.appendChild(reportContainer)

    // 5. 렌더링 대기
    await document.fonts.ready
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 6. 이미지 변환
    const { toPng } = await import("html-to-image")
    const dataUrl = await toPng(reportContainer, {
      quality: 0.95,
      backgroundColor: "#ffffff",
      pixelRatio: 2,
    })

    // 7. PDF 생성 및 저장
    const { jsPDF } = await import("jspdf")
    const pdf = new jsPDF("p", "mm", "a4")
    const imgProps = pdf.getImageProperties(dataUrl)
    const pdfHeight = (imgProps.height * 210) / imgProps.width

    pdf.addImage(dataUrl, "PNG", 0, 0, 210, pdfHeight)

    // 파일명 생성
    const dateStr = formatLocalDate(report.startDate).replace(/-/g, "")
    const filename = `Report_${dateStr}.pdf`
    pdf.save(filename)
  } finally {
    // 8. 뒷정리
    if (overlay && document.body.contains(overlay)) {
      document.body.removeChild(overlay)
    }
    if (reportContainer && document.body.contains(reportContainer)) {
      document.body.removeChild(reportContainer)
    }
  }
}

// Note: 모든 템플릿 생성 로직은 lib/report-templates.ts로 이동되었습니다.
