import { supabase } from "@/lib/supabase"
import type { Report, Todo } from "@/types"
import { formatLocalDate } from "./todo.service"

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
 */
export async function createReport(
  title: string,
  startDate: Date,
  endDate: Date,
  todos: Todo[],
): Promise<Report> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // MVP: 간단한 마크다운 생성 (날짜별로 정리)
  const summary = generateBasicMarkdown(todos, startDate, endDate)

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
 * 리포트 삭제
 */
export async function deleteReport(id: string): Promise<void> {
  const { error } = await supabase.from("reports").delete().eq("id", id)

  if (error) {
    console.error("Error deleting report:", error)
    throw new Error(error.message)
  }
}

// ========================================
// Helper Functions
// ========================================

/**
 * 투두 목록을 전문적인 업무 보고서 스타일 마크다운으로 생성
 */
function generateBasicMarkdown(todos: Todo[], startDate: Date, endDate: Date): string {
  const allTodos = todos // 전체 투두 (완료 + 미완료 포함)
  const completedTodos = todos.filter((todo) => todo.completed)
  const pendingTodos = todos.filter((todo) => !todo.completed)

  // 달성률 계산
  const totalTasks = allTodos.length
  const completionRate = totalTasks > 0 ? Math.round((completedTodos.length / totalTasks) * 100) : 0

  // memo가 있는 항목만 필터링 (이슈/인사이트)
  const todosWithMemo = completedTodos.filter((todo) => todo.memo && todo.memo.trim() !== "")

  // 날짜별로 그룹화
  const completedByDate: Record<string, Todo[]> = {}
  completedTodos.forEach((todo) => {
    if (todo.targetDate) {
      const dateKey = formatLocalDate(todo.targetDate)
      if (!completedByDate[dateKey]) {
        completedByDate[dateKey] = []
      }
      completedByDate[dateKey].push(todo)
    }
  })

  // 마크다운 생성
  let markdown = ""

  // ========================================
  // 1. 헤더
  // ========================================
  markdown += `# 📋 Weekly Report\n\n`
  markdown += `**기간:** ${formatLocalDate(startDate)} ~ ${formatLocalDate(endDate)}\n\n`
  markdown += `---\n\n`

  // ========================================
  // 2. 요약 (Summary)
  // ========================================
  markdown += `## 📊 Summary\n\n`
  markdown += `- **전체 업무:** ${totalTasks}건\n`
  markdown += `- **완료:** ${completedTodos.length}건\n`
  markdown += `- **진행 중:** ${pendingTodos.length}건\n`
  markdown += `- **달성률:** ${completionRate}%\n\n`
  markdown += `---\n\n`

  // ========================================
  // 3. 업무 내역 - 완료된 작업
  // ========================================
  markdown += `## ✅ Completed Tasks\n\n`

  if (completedTodos.length === 0) {
    markdown += `완료된 업무가 없습니다.\n\n`
  } else {
    // 날짜순으로 정렬
    const sortedDates = Object.keys(completedByDate).sort()

    sortedDates.forEach((dateKey) => {
      const dateTodos = completedByDate[dateKey]
      markdown += `### ${dateKey}\n\n`

      dateTodos.forEach((todo) => {
        markdown += `- [✅] ${todo.text}\n`
      })

      markdown += `\n`
    })
  }

  markdown += `---\n\n`

  // ========================================
  // 4. 업무 내역 - 진행 중
  // ========================================
  if (pendingTodos.length > 0) {
    markdown += `## 🔄 In Progress\n\n`

    pendingTodos.forEach((todo) => {
      markdown += `- [ ] ${todo.text}\n`
    })

    markdown += `\n---\n\n`
  }

  // ========================================
  // 5. 이슈 / 인사이트
  // ========================================
  if (todosWithMemo.length > 0) {
    markdown += `## 💡 Issues & Insights\n\n`

    todosWithMemo.forEach((todo) => {
      markdown += `### ${todo.text}\n\n`
      markdown += `> ${todo.memo}\n\n`
    })

    markdown += `---\n\n`
  }

  // ========================================
  // 6. 차주 계획 (Next Week Plan)
  // ========================================
  markdown += `## 📅 Next Week Plan\n\n`
  markdown += `- [ ] 다음 주 업무 계획을 작성하세요\n`
  markdown += `- [ ] 우선순위를 정리하세요\n`
  markdown += `- [ ] 필요한 리소스를 확인하세요\n\n`

  return markdown
}
