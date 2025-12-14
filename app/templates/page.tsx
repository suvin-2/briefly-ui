"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TemplateUploadModal } from "@/components/template-upload-modal"
import { Plus, FileSpreadsheet, FileText, Download, X } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export default function TemplatesPage() {
  const { t } = useLanguage()
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

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

  return (
    <AppShell>
      <div className="w-full space-y-6 px-4 md:px-0">
        {/* Header with Upload Button */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-balance text-3xl font-bold text-gray-900">{t.templates}</h1>
            <p className="text-pretty text-gray-600">{t.templatesLibrary}</p>
          </div>
          <Button
            onClick={() => setUploadModalOpen(true)}
            className="hidden bg-[#5D7AA5] text-white hover:bg-[#4d6a95] md:flex"
          >
            <Plus className="mr-2 h-5 w-5" />
            {t.uploadTemplate}
          </Button>
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
        <button
          onClick={() => setUploadModalOpen(true)}
          className="fixed bottom-20 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[#5D7AA5] text-white shadow-lg transition-colors hover:bg-[#4A6285] md:hidden"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      <TemplateUploadModal open={uploadModalOpen} onOpenChange={setUploadModalOpen} />
    </AppShell>
  )
}
