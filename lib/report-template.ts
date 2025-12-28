import type { Todo } from "@/types"
import { format } from "date-fns"

interface ReportPeriod {
  start: Date
  end: Date
}

export function generateBasicReport(todos: Todo[], period: ReportPeriod): string {
  const completedTodos = todos.filter((todo) => todo.completed)
  const inProgressTodos = todos.filter((todo) => !todo.completed)

  // 이슈 키워드가 포함된 메모 찾기
  const issueKeywords = ["issue", "문제", "블로커", "blocker", "bug", "버그", "error", "에러", "block"]
  const issues = todos.filter((todo) => {
    if (!todo.memo) return false
    const memoLower = todo.memo.toLowerCase()
    return issueKeywords.some((keyword) => memoLower.includes(keyword))
  })

  const startDate = format(period.start, "yyyy.MM.dd")
  const endDate = format(period.end, "yyyy.MM.dd")
  const createdDate = format(new Date(), "yyyy.MM.dd")

  const completionRate =
    todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0

  let markdown = `# 주간 업무 리포트

**기간**: ${startDate} ~ ${endDate}
**작성일**: ${createdDate}

---

## 📋 이번 주 요약
- 총 작업: ${todos.length}건
- 완료: ${completedTodos.length}건 (${completionRate}%)
- 진행 중: ${inProgressTodos.length}건

---

## ✅ 완료한 작업

`

  if (completedTodos.length === 0) {
    markdown += "_완료한 작업이 없습니다._\n\n"
  } else {
    completedTodos.forEach((todo, index) => {
      markdown += `### ${index + 1}. ${todo.text}\n`
      if (todo.memo) {
        markdown += `> ${todo.memo}\n\n`
      } else {
        markdown += `> _메모 없음_\n\n`
      }
    })
  }

  markdown += `---

## 🔄 진행 중인 작업

`

  if (inProgressTodos.length === 0) {
    markdown += "_진행 중인 작업이 없습니다._\n\n"
  } else {
    inProgressTodos.forEach((todo, index) => {
      markdown += `### ${index + 1}. ${todo.text}\n`
      if (todo.memo) {
        markdown += `> ${todo.memo}\n\n`
      } else {
        markdown += `> _메모 없음_\n\n`
      }
    })
  }

  markdown += `---

## ⚠️ 이슈 및 블로커

`

  if (issues.length === 0) {
    markdown += "_특이사항 없음_\n\n"
  } else {
    issues.forEach((todo) => {
      markdown += `- **${todo.text}**\n`
      if (todo.memo) {
        markdown += `  ${todo.memo}\n\n`
      }
    })
  }

  markdown += `---

## 📅 다음 주 계획

`

  if (inProgressTodos.length === 0) {
    markdown += "_계획된 작업이 없습니다._\n"
  } else {
    inProgressTodos.forEach((todo) => {
      markdown += `- ${todo.text}\n`
    })
  }

  return markdown
}

export function generateReportFilename(period: ReportPeriod): string {
  const startDate = format(period.start, "yyyy-MM-dd")
  const endDate = format(period.end, "yyyy-MM-dd")
  return `weekly-report-${startDate}-to-${endDate}.md`
}
