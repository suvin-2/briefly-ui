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
  },
  {
    id: "2",
    title: "Monthly Overview - November",
    dateRange: "Nov 1-30, 2024",
    createdAt: "Dec 1, 2024",
    template: "Monthly Overview",
    templateDeleted: false,
  },
  {
    id: "3",
    title: "Project Alpha Update with a Very Long Title That Should Be Truncated to Two Lines Maximum",
    dateRange: "Nov 15-30, 2024",
    createdAt: "Nov 30, 2024",
    template: "Project Update with Very Long Template Name That Should Also Be Truncated",
    templateDeleted: false,
  },
  {
    id: "4",
    title: "Team Performance Q4",
    dateRange: "Oct 1 - Dec 14, 2024",
    createdAt: "Dec 14, 2024",
    template: "Team Performance",
    templateDeleted: true,
  },
  {
    id: "5",
    title: "Weekly Report #11",
    dateRange: "Nov 24-30, 2024",
    createdAt: "Dec 1, 2024",
    template: "Weekly Summary",
    templateDeleted: false,
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
