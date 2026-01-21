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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
import { useMobile } from "@/hooks/use-mobile"
import type { Report } from "@/types"

interface EditReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  report: Report | null
  onSave: (id: string, updates: { title: string; summary: string }) => Promise<void>
}

export function EditReportDialog({ open, onOpenChange, report, onSave }: EditReportDialogProps) {
  const { t } = useLanguage()
  const isMobile = useMobile()
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

  const content = (
    <div className="max-h-[60vh] overflow-y-auto scroll-smooth">
      <div className="space-y-6 px-4 py-2">
        {/* Title Input */}
        <div className="space-y-2">
          <Label htmlFor="report-title">{t.reportTitle}</Label>
          <Input
            id="report-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="리포트 제목을 입력하세요"
            disabled={isSaving}
            className="border-gray-200 bg-white"
          />
        </div>

        {/* Summary Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="report-summary">{t.reportContent}</Label>
            <span className="text-xs text-gray-500">Markdown 형식</span>
          </div>
          <Textarea
            id="report-summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="리포트 내용을 입력하세요 (Markdown 형식)"
            disabled={isSaving}
            className="min-h-60 md:min-h-80 font-mono text-sm border-gray-200 bg-white"
            aria-label="리포트 내용 편집"
          />
          <p className="text-xs text-gray-500">
            💡 줄바꿈: 빈 줄을 추가하면 단락이 분리됩니다. 같은 단락 내 줄바꿈은 줄 끝에 공백 2개를 추가하세요.
          </p>
        </div>
      </div>
    </div>
  )

  const footer = (
    <div className="flex gap-2 p-4">
      <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1">
        {t.cancel}
      </Button>
      <Button
        onClick={handleSave}
        disabled={isSaving || !title.trim() || !isDirty()}
        className="flex-1 bg-[#5D7AA5] hover:bg-[#4d6a95]"
      >
        {isSaving ? t.saving : t.save}
      </Button>
    </div>
  )

  const unsavedAlert = (
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
  )

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle>{t.editReport}</DrawerTitle>
              <DrawerDescription>{t.editReportDialogDescription}</DrawerDescription>
            </DrawerHeader>
            {content}
            <DrawerFooter>{footer}</DrawerFooter>
          </DrawerContent>
        </Drawer>
        {unsavedAlert}
      </>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-125 max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t.editReport}</DialogTitle>
            <DialogDescription>{t.editReportDialogDescription}</DialogDescription>
          </DialogHeader>
          {content}
          <DialogFooter>{footer}</DialogFooter>
        </DialogContent>
      </Dialog>
      {unsavedAlert}
    </>
  )
}
