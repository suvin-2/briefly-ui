import type { Todo } from "@/types"
import { formatLocalDate } from "@/services/todo.service"

/**
 * 리포트 템플릿 타입 정의
 */
export type TemplateType = "basic" | "detailed" | "summary" | "dev-team" | "sales-team"

export interface TemplateInfo {
  id: TemplateType
  name: string
  nameEn: string
  description: string
  descriptionEn: string
  icon: string
  category: "general" | "team-specific"
}

/**
 * 템플릿 카탈로그
 */
export const TEMPLATE_CATALOG: Record<TemplateType, TemplateInfo> = {
  basic: {
    id: "basic",
    name: "기본형",
    nameEn: "Basic",
    description: "날짜별 완료된 할 일을 정리합니다",
    descriptionEn: "Organize completed tasks by date",
    icon: "📄",
    category: "general",
  },
  detailed: {
    id: "detailed",
    name: "상세형",
    nameEn: "Detailed",
    description: "메모와 이슈를 포함한 상세 리포트",
    descriptionEn: "Detailed report with notes and issues",
    icon: "📋",
    category: "general",
  },
  summary: {
    id: "summary",
    name: "요약형",
    nameEn: "Summary",
    description: "핵심 성과만 간결하게 요약합니다",
    descriptionEn: "Brief summary of key achievements",
    icon: "⚡",
    category: "general",
  },
  "dev-team": {
    id: "dev-team",
    name: "개발팀용",
    nameEn: "Dev Team",
    description: "이슈 트래킹과 기술 블로커 중심",
    descriptionEn: "Focus on issue tracking and technical blockers",
    icon: "💻",
    category: "team-specific",
  },
  "sales-team": {
    id: "sales-team",
    name: "영업팀용",
    nameEn: "Sales Team",
    description: "완료율과 성과 지표 중심",
    descriptionEn: "Focus on completion rate and performance metrics",
    icon: "📊",
    category: "team-specific",
  },
}

// ========================================
// 템플릿 생성 함수들
// ========================================

/**
 * 1. 기본형 템플릿 (현재 구현과 동일)
 */
export function generateBasicTemplate(todos: Todo[], startDate: Date, endDate: Date): string {
  const allTodos = todos
  const completedTodos = todos.filter((todo) => todo.completed)
  const pendingTodos = todos.filter((todo) => !todo.completed)

  const totalTasks = allTodos.length
  const completionRate = totalTasks > 0 ? Math.round((completedTodos.length / totalTasks) * 100) : 0

  const todosWithMemo = completedTodos.filter((todo) => todo.memo && todo.memo.trim() !== "")

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

  let markdown = ""

  markdown += `# 📋 Weekly Report\n\n`
  markdown += `**기간:** ${formatLocalDate(startDate)} ~ ${formatLocalDate(endDate)}\n\n`
  markdown += `---\n\n`

  markdown += `## 📊 Summary\n\n`
  markdown += `- **전체 업무:** ${totalTasks}건\n`
  markdown += `- **완료:** ${completedTodos.length}건\n`
  markdown += `- **진행 중:** ${pendingTodos.length}건\n`
  markdown += `- **달성률:** ${completionRate}%\n\n`
  markdown += `---\n\n`

  markdown += `## ✅ Completed Tasks\n\n`

  if (completedTodos.length === 0) {
    markdown += `완료된 업무가 없습니다.\n\n`
  } else {
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

  if (pendingTodos.length > 0) {
    markdown += `## 🔄 In Progress\n\n`

    pendingTodos.forEach((todo) => {
      markdown += `- [ ] ${todo.text}\n`
    })

    markdown += `\n---\n\n`
  }

  if (todosWithMemo.length > 0) {
    markdown += `## 💡 Issues & Insights\n\n`

    todosWithMemo.forEach((todo) => {
      markdown += `### ${todo.text}\n\n`
      markdown += `> ${todo.memo}\n\n`
    })

    markdown += `---\n\n`
  }

  return markdown
}

/**
 * 2. 상세형 템플릿 (메모 중심)
 */
export function generateDetailedTemplate(todos: Todo[], startDate: Date, endDate: Date): string {
  const allTodos = todos
  const completedTodos = todos.filter((todo) => todo.completed)
  const pendingTodos = todos.filter((todo) => !todo.completed)

  const totalTasks = allTodos.length
  const completionRate = totalTasks > 0 ? Math.round((completedTodos.length / totalTasks) * 100) : 0

  const completedWithMemo = completedTodos.filter((todo) => todo.memo && todo.memo.trim() !== "")
  const completedWithoutMemo = completedTodos.filter((todo) => !todo.memo || todo.memo.trim() === "")

  let markdown = ""

  markdown += `# 📋 상세 업무 리포트\n\n`
  markdown += `**보고 기간:** ${formatLocalDate(startDate)} ~ ${formatLocalDate(endDate)}\n\n`
  markdown += `---\n\n`

  markdown += `## 📈 전체 현황\n\n`
  markdown += `| 항목 | 수량 |\n`
  markdown += `|------|------|\n`
  markdown += `| 전체 업무 | ${totalTasks}건 |\n`
  markdown += `| 완료 | ${completedTodos.length}건 |\n`
  markdown += `| 진행 중 | ${pendingTodos.length}건 |\n`
  markdown += `| **달성률** | **${completionRate}%** |\n\n`
  markdown += `---\n\n`

  markdown += `## ✅ 완료된 업무 상세\n\n`

  if (completedWithMemo.length > 0) {
    markdown += `### 📝 상세 내역 (메모 포함)\n\n`
    completedWithMemo.forEach((todo, idx) => {
      markdown += `#### ${idx + 1}. ${todo.text}\n\n`
      markdown += `- **날짜:** ${todo.targetDate ? formatLocalDate(todo.targetDate) : "미정"}\n`
      markdown += `- **상태:** ✅ 완료\n\n`
      markdown += `**업무 내용:**\n\n`
      markdown += `${todo.memo}\n\n`
      markdown += `---\n\n`
    })
  }

  if (completedWithoutMemo.length > 0) {
    markdown += `### ✅ 완료 목록\n\n`
    completedWithoutMemo.forEach((todo) => {
      const dateStr = todo.targetDate ? formatLocalDate(todo.targetDate) : "미정"
      markdown += `- [${dateStr}] ${todo.text}\n`
    })
    markdown += `\n`
  }

  if (completedTodos.length === 0) {
    markdown += `완료된 업무가 없습니다.\n\n`
  }

  markdown += `---\n\n`

  if (pendingTodos.length > 0) {
    markdown += `## 🔄 진행 중인 업무\n\n`

    pendingTodos.forEach((todo, idx) => {
      const dateStr = todo.targetDate ? formatLocalDate(todo.targetDate) : "미정"
      markdown += `${idx + 1}. **${todo.text}**\n`
      markdown += `   - 목표일: ${dateStr}\n`
      if (todo.memo && todo.memo.trim() !== "") {
        markdown += `   - 현황: ${todo.memo}\n`
      }
      markdown += `\n`
    })

    markdown += `---\n\n`
  }

  markdown += `## 📝 종합 의견\n\n`
  markdown += `_이번 주 업무에 대한 종합 의견을 작성하세요._\n\n`

  return markdown
}

/**
 * 3. 요약형 템플릿 (간결한 리포트)
 */
export function generateSummaryTemplate(todos: Todo[], startDate: Date, endDate: Date): string {
  const completedTodos = todos.filter((todo) => todo.completed)
  const totalTasks = todos.length
  const completionRate = totalTasks > 0 ? Math.round((completedTodos.length / totalTasks) * 100) : 0

  let markdown = ""

  markdown += `# ⚡ 주간 요약\n\n`
  markdown += `**${formatLocalDate(startDate)} ~ ${formatLocalDate(endDate)}**\n\n`

  markdown += `## 📊 핵심 지표\n\n`
  markdown += `- 완료: **${completedTodos.length}건** / 전체: ${totalTasks}건\n`
  markdown += `- 달성률: **${completionRate}%**\n\n`

  markdown += `---\n\n`

  markdown += `## ✨ 주요 성과\n\n`

  if (completedTodos.length === 0) {
    markdown += `_완료된 업무가 없습니다._\n\n`
  } else {
    // 최근 5개만 표시
    const recentCompleted = completedTodos.slice(0, 5)
    recentCompleted.forEach((todo, idx) => {
      markdown += `${idx + 1}. ${todo.text}\n`
    })

    if (completedTodos.length > 5) {
      markdown += `\n_외 ${completedTodos.length - 5}건_\n`
    }
    markdown += `\n`
  }

  return markdown
}

/**
 * 4. 개발팀용 템플릿 (이슈/블로커 중심)
 */
export function generateDevTeamTemplate(todos: Todo[], startDate: Date, endDate: Date): string {
  const completedTodos = todos.filter((todo) => todo.completed)
  const pendingTodos = todos.filter((todo) => !todo.completed)
  const todosWithMemo = todos.filter((todo) => todo.memo && todo.memo.trim() !== "")

  const totalTasks = todos.length
  const completionRate = totalTasks > 0 ? Math.round((completedTodos.length / totalTasks) * 100) : 0

  let markdown = ""

  markdown += `# 💻 개발팀 스프린트 리포트\n\n`
  markdown += `**Sprint Period:** ${formatLocalDate(startDate)} ~ ${formatLocalDate(endDate)}\n\n`
  markdown += `---\n\n`

  markdown += `## 📊 Sprint Overview\n\n`
  markdown += `| Metric | Value |\n`
  markdown += `|--------|-------|\n`
  markdown += `| Total Tasks | ${totalTasks} |\n`
  markdown += `| Completed | ${completedTodos.length} |\n`
  markdown += `| In Progress | ${pendingTodos.length} |\n`
  markdown += `| Velocity | ${completionRate}% |\n\n`
  markdown += `---\n\n`

  markdown += `## ✅ Completed Tasks\n\n`

  if (completedTodos.length === 0) {
    markdown += `No tasks completed.\n\n`
  } else {
    completedTodos.forEach((todo) => {
      markdown += `- [x] ${todo.text}\n`
    })
    markdown += `\n`
  }

  markdown += `---\n\n`

  if (pendingTodos.length > 0) {
    markdown += `## 🔄 In Progress / Backlog\n\n`

    pendingTodos.forEach((todo) => {
      markdown += `- [ ] ${todo.text}\n`
    })

    markdown += `\n---\n\n`
  }

  markdown += `## 🐛 Issues & Blockers\n\n`

  if (todosWithMemo.length === 0) {
    markdown += `_No issues or blockers reported._\n\n`
  } else {
    todosWithMemo.forEach((todo) => {
      markdown += `### 🔴 ${todo.text}\n\n`
      markdown += `**Issue:**\n\n`
      markdown += `${todo.memo}\n\n`
      markdown += `**Status:** ${todo.completed ? "✅ Resolved" : "⚠️ Active"}\n\n`
      markdown += `---\n\n`
    })
  }

  markdown += `## 📝 Technical Notes\n\n`
  markdown += `_Add any technical decisions, architecture changes, or important notes here._\n\n`

  return markdown
}

/**
 * 5. 영업팀용 템플릿 (성과 지표 중심)
 */
export function generateSalesTeamTemplate(todos: Todo[], startDate: Date, endDate: Date): string {
  const completedTodos = todos.filter((todo) => todo.completed)
  const pendingTodos = todos.filter((todo) => !todo.completed)

  const totalTasks = todos.length
  const completionRate = totalTasks > 0 ? Math.round((completedTodos.length / totalTasks) * 100) : 0

  // 날짜별 그룹화
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

  let markdown = ""

  markdown += `# 📊 영업팀 주간 실적 보고\n\n`
  markdown += `**보고 기간:** ${formatLocalDate(startDate)} ~ ${formatLocalDate(endDate)}\n\n`
  markdown += `---\n\n`

  markdown += `## 📈 주간 성과 요약\n\n`
  markdown += `| 지표 | 실적 |\n`
  markdown += `|------|------|\n`
  markdown += `| 목표 활동 | ${totalTasks}건 |\n`
  markdown += `| 완료 활동 | ${completedTodos.length}건 |\n`
  markdown += `| 진행 중 | ${pendingTodos.length}건 |\n`
  markdown += `| **달성률** | **${completionRate}%** |\n\n`

  // 성과 등급
  let grade = ""
  if (completionRate >= 90) grade = "🏆 우수"
  else if (completionRate >= 70) grade = "✅ 양호"
  else if (completionRate >= 50) grade = "⚠️ 보통"
  else grade = "🔴 미흡"

  markdown += `**종합 평가:** ${grade}\n\n`
  markdown += `---\n\n`

  markdown += `## ✅ 완료된 영업 활동\n\n`

  if (completedTodos.length === 0) {
    markdown += `완료된 활동이 없습니다.\n\n`
  } else {
    const sortedDates = Object.keys(completedByDate).sort()

    sortedDates.forEach((dateKey) => {
      const dateTodos = completedByDate[dateKey]
      markdown += `### 📅 ${dateKey}\n\n`

      dateTodos.forEach((todo, idx) => {
        markdown += `${idx + 1}. ✅ ${todo.text}\n`
        if (todo.memo && todo.memo.trim() !== "") {
          markdown += `   > ${todo.memo}\n`
        }
      })

      markdown += `\n`
    })
  }

  markdown += `---\n\n`

  if (pendingTodos.length > 0) {
    markdown += `## 🔄 진행 중인 활동\n\n`

    pendingTodos.forEach((todo, idx) => {
      markdown += `${idx + 1}. ${todo.text}\n`
      if (todo.memo && todo.memo.trim() !== "") {
        markdown += `   - 현황: ${todo.memo}\n`
      }
    })

    markdown += `\n---\n\n`
  }

  markdown += `## 💡 주요 이슈 및 특이사항\n\n`
  markdown += `_이슈나 특이사항이 있으면 작성하세요._\n\n`

  return markdown
}

/**
 * 템플릿 생성 팩토리 함수
 */
export function generateReportByTemplate(
  templateType: TemplateType,
  todos: Todo[],
  startDate: Date,
  endDate: Date,
): string {
  switch (templateType) {
    case "basic":
      return generateBasicTemplate(todos, startDate, endDate)
    case "detailed":
      return generateDetailedTemplate(todos, startDate, endDate)
    case "summary":
      return generateSummaryTemplate(todos, startDate, endDate)
    case "dev-team":
      return generateDevTeamTemplate(todos, startDate, endDate)
    case "sales-team":
      return generateSalesTeamTemplate(todos, startDate, endDate)
    default:
      return generateBasicTemplate(todos, startDate, endDate)
  }
}
