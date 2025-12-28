"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { ReportCard } from "@/components/report-card"
import { GenerateReportDialog } from "@/components/generate-report-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/lib/language-context"

// Mock data
const reports = [
  {
    id: "1",
    title: "Weekly Report #12",
    dateRange: "Dec 1-7, 2024",
    createdAt: "Dec 8, 2024",
    template: "Weekly Summary",
    templateDeleted: false,
    reportContent: `# 주간 업무 리포트

**기간**: 2024.12.01 ~ 2024.12.07
**작성일**: 2024.12.08

---

## 📋 이번 주 요약
- 총 작업: 8건
- 완료: 6건 (75%)
- 진행 중: 2건

---

## ✅ 완료한 작업

### 1. 디자인 시스템 업데이트 검토
> 새로운 컬러 팔레트와 타이포그래피 가이드 검토 완료

### 2. Glassmorphism 네비게이션 컴포넌트 구현
> React 기반으로 재사용 가능한 컴포넌트 개발 완료`,
  },
  {
    id: "2",
    title: "Monthly Overview - November",
    dateRange: "Nov 1-30, 2024",
    createdAt: "Dec 1, 2024",
    template: "Monthly Overview",
    templateDeleted: false,
    reportContent: `# 월간 업무 리포트

**기간**: 2024.11.01 ~ 2024.11.30
**작성일**: 2024.12.01`,
  },
  {
    id: "3",
    title: "Project Alpha Update with a Very Long Title That Should Be Truncated to Two Lines Maximum",
    dateRange: "Nov 15-30, 2024",
    createdAt: "Nov 30, 2024",
    template: "Project Update with Very Long Template Name That Should Also Be Truncated",
    templateDeleted: false,
    reportContent: `# Project Alpha 업데이트

**기간**: 2024.11.15 ~ 2024.11.30`,
  },
  {
    id: "4",
    title: "Team Performance Q4",
    dateRange: "Oct 1 - Dec 14, 2024",
    createdAt: "Dec 14, 2024",
    template: "Team Performance",
    templateDeleted: true,
    reportContent: `# 팀 성과 리포트 (Q4)

**기간**: 2024.10.01 ~ 2024.12.14
**작성일**: 2024.12.14

---

## 📋 Q4 요약
- 총 프로젝트: 5개
- 완료: 4개 (80%)
- 진행 중: 1개`,
  },
  {
    id: "5",
    title: "Weekly Report #11",
    dateRange: "Nov 24-30, 2024",
    createdAt: "Dec 1, 2024",
    template: "Weekly Summary",
    templateDeleted: false,
    reportContent: `# 주간 업무 리포트

**기간**: 2024.11.24 ~ 2024.11.30`,
  },
]

export default function ReportPage() {
  const { t } = useLanguage()
  const [dialogOpen, setDialogOpen] = useState(false)
  const isMobile = useMobile()

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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <ReportCard key={report.id} {...report} />
          ))}
        </div>

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
        <GenerateReportDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </AppShell>
  )
}
