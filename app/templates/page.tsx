"use client"

import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileSpreadsheet, FileText, Download, X, Clock } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/lib/language-context"

export default function TemplatesPage() {
  const { t } = useLanguage()

  const templates = [
    {
      id: 1,
      title: "Weekly Progress Report",
      description: "Standard weekly report template for team updates and progress tracking",
      type: "xlsx",
      icon: FileSpreadsheet,
    },
    {
      id: 2,
      title: "Meeting Minutes Template",
      description: "Professional meeting notes format with action items and decisions",
      type: "docx",
      icon: FileText,
    },
    {
      id: 3,
      title: "Project Status Update",
      description: "Comprehensive project status report with milestones and blockers",
      type: "xlsx",
      icon: FileSpreadsheet,
    },
  ]

  const handleDelete = (id: number) => {
    console.log("Delete template:", id)
  }

  const handleUploadClick = () => {
    toast.info("템플릿 업로드 기능은 준비 중입니다.", {
      description: "곧 사용하실 수 있습니다!",
      icon: <Clock className="h-4 w-4" />,
    })
  }

  return (
    <AppShell>
      <div className="w-full space-y-6 px-4 md:px-0">
        {/* Header with Upload Button */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-balance text-3xl font-bold text-gray-900">{t.templates}</h1>
            <p className="text-pretty text-gray-600">{t.templatesLibrary}</p>
          </div>
          <div className="relative">
            <Button
              onClick={handleUploadClick}
              className="hidden bg-[#5D7AA5] text-white hover:bg-[#4d6a95] md:flex"
            >
              <Plus className="mr-2 h-5 w-5" />
              {t.uploadTemplate}
            </Button>
            <span className="absolute -right-2 -top-2 hidden rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white md:block">
              준비중
            </span>
          </div>
        </div>

        {/* Template Cards - Force single column on mobile */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const Icon = template.icon
            return (
              <Card
                key={template.id}
                className="group relative border-gray-200 bg-white shadow-lg transition-all hover:shadow-xl hover:shadow-gray-200/60"
              >
                <CardHeader className="p-6">
                  <div className="flex flex-row items-start justify-between">
                    {/* Left: Template Icon */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5D7AA5]/10">
                      <Icon className="h-6 w-6 text-[#5D7AA5]" />
                    </div>

                    <button
                      onClick={() => handleDelete(template.id)}
                      className="shrink-0 text-gray-400 transition-colors hover:text-red-500"
                      aria-label="Delete template"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <CardTitle className="mt-4 text-lg text-gray-900">{template.title}</CardTitle>
                  <CardDescription className="text-gray-600">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full border-gray-200 bg-white hover:bg-gray-50">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Mobile FAB for Upload */}
        <div className="fixed bottom-20 right-4 z-40 md:hidden">
          <button
            onClick={handleUploadClick}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5D7AA5] text-white shadow-lg transition-colors hover:bg-[#4A6285]"
          >
            <Plus className="h-6 w-6" />
          </button>
          <span className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1 py-0.5 text-[8px] font-bold text-white">
            준비중
          </span>
        </div>
      </div>
    </AppShell>
  )
}
