"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  const [originalTitle, setOriginalTitle] = useState("")
  const [originalSummary, setOriginalSummary] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false)

  // 모달이 열릴 때마다 report 데이터로 초기화
  useEffect(() => {
    if (report) {
      setTitle(report.title)
      setSummary(report.summary)
      setOriginalTitle(report.title)
      setOriginalSummary(report.summary)
    }
  }, [report])

  // 변경 사항이 있는지 확인
  const isDirty = useCallback(() => {
    return title !== originalTitle || summary !== originalSummary
  }, [title, summary, originalTitle, originalSummary])

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

  /**
   * 다이얼로그 닫기 핸들러
   * - 저장 중에는 닫기 방지
   * - 변경 사항이 있으면 확인 다이얼로그 표시
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (isSaving && !newOpen) {
      // 저장 중에는 닫기 방지
      return
    }

    if (!newOpen && isDirty()) {
      // 변경 사항이 있으면 확인 다이얼로그 표시
      setShowUnsavedAlert(true)
      return
    }

    onOpenChange(newOpen)
  }

  // 변경 사항 버리고 닫기
  const handleDiscardChanges = () => {
    setShowUnsavedAlert(false)
    if (report) {
      setTitle(report.title)
      setSummary(report.summary)
    }
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
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
                  disabled={isSaving}
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
                  disabled={isSaving}
                  className="min-h-100 font-mono text-sm"
                  aria-label="리포트 내용 편집"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              {t.cancel}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !title.trim() || !isDirty()}>
              {isSaving ? t.saving : t.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 저장하지 않은 변경사항 확인 다이얼로그 */}
      <AlertDialog open={showUnsavedAlert} onOpenChange={setShowUnsavedAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.unsavedChanges}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.unsavedChangesDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDiscardChanges}>
              {t.discardChanges}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
