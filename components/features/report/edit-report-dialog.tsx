"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/lib/language-context"
import type { Report } from "@/types"

interface EditReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: Report | null
  onSave: (id: string, updates: { title: string; summary: string }) => Promise<void>
}

export function EditReportDialog({ open, onOpenChange, report, onSave }: EditReportDialogProps) {
  const { t } = useLanguage()
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // 모달이 열릴 때마다 report 데이터로 초기화
  useEffect(() => {
    if (report) {
      setTitle(report.title)
      setSummary(report.summary)
    }
  }, [report])

  const handleSave = async () => {
    if (!report) return

    try {
      setIsSaving(true)
      await onSave(report.id, { title, summary })
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save report:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset to original values
    if (report) {
      setTitle(report.title)
      setSummary(report.summary)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{t.editReport}</DialogTitle>
          <DialogDescription>리포트 제목과 내용을 수정할 수 있습니다.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6">
          <div className="flex flex-col gap-4 py-4">
            {/* Title Input */}
            <div className="space-y-2">
              <Label htmlFor="report-title">{t.reportTitle}</Label>
              <Input
                id="report-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="리포트 제목을 입력하세요"
                className="font-medium"
              />
            </div>

            {/* Summary Textarea */}
            <div className="space-y-2">
              <Label htmlFor="report-summary">{t.reportContent}</Label>
              <Textarea
                id="report-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="리포트 내용을 입력하세요 (Markdown 형식)"
                className="min-h-[400px] font-mono text-sm"
                aria-label="리포트 내용 편집"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            {t.cancel}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? "저장 중..." : t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
