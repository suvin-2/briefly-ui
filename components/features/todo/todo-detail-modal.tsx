"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, AlertTriangle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"
import { useMobile } from "@/hooks/use-mobile"
import type { Todo } from "@/types"

const TITLE_MAX_LENGTH = 200
const MEMO_MAX_LENGTH = 1000

interface TodoDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todo: Todo | null
  onSave: (id: string, updates: { text: string; targetDate?: Date; memo?: string }) => Promise<void> | void
  onDelete: (id: string) => Promise<void> | void
}

export function TodoDetailModal({ open, onOpenChange, todo, onSave, onDelete }: TodoDetailModalProps) {
  const { t } = useLanguage()
  const isMobile = useMobile()
  const [text, setText] = useState("")
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined)
  const [memo, setMemo] = useState("")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false)
  const [originalText, setOriginalText] = useState("")
  const [originalDate, setOriginalDate] = useState<Date | undefined>(undefined)
  const [originalMemo, setOriginalMemo] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [titleError, setTitleError] = useState(false)

  // Update state when todo changes
  useEffect(() => {
    if (todo) {
      setText(todo.text)
      setTargetDate(todo.targetDate)
      setMemo(todo.memo || "")
      setOriginalText(todo.text)
      setOriginalDate(todo.targetDate)
      setOriginalMemo(todo.memo || "")
      setTitleError(false)
    }
  }, [todo])

  /**
   * 두 날짜가 다른지 비교 (날짜만 비교, 시간 무시)
   * - 둘 다 undefined면 false (같음)
   * - 하나만 undefined면 true (다름)
   * - 둘 다 있으면 날짜 문자열로 비교
   */
  const areDatesEqual = useCallback((date1: Date | undefined, date2: Date | undefined): boolean => {
    if (!date1 && !date2) return true
    if (!date1 || !date2) return false
    return date1.toDateString() === date2.toDateString()
  }, [])

  // Check if there are unsaved changes
  const isDirty = useCallback(() => {
    if (!todo) return false
    const textChanged = text !== originalText
    const memoChanged = memo !== originalMemo
    const dateChanged = !areDatesEqual(originalDate, targetDate)
    return textChanged || memoChanged || dateChanged
  }, [text, memo, targetDate, originalText, originalMemo, originalDate, todo, areDatesEqual])

  // Check if date changed (for warning display)
  const isDateChanged = !areDatesEqual(originalDate, targetDate)

  const handleSave = async () => {
    if (!todo) return

    // Validate title
    if (!text.trim()) {
      setTitleError(true)
      return
    }

    setIsSaving(true)
    try {
      await onSave(todo.id, { text: text.trim(), targetDate, memo: memo.trim() })
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteAlert(true)
  }

  const handleDeleteConfirm = async () => {
    if (!todo) return

    setIsDeleting(true)
    try {
      await onDelete(todo.id)
      setShowDeleteAlert(false)
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isDirty()) {
      setShowUnsavedAlert(true)
    } else {
      onOpenChange(newOpen)
    }
  }

  const handleDiscardChanges = () => {
    setShowUnsavedAlert(false)
    onOpenChange(false)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length <= TITLE_MAX_LENGTH) {
      setText(newValue)
      if (newValue.trim()) {
        setTitleError(false)
      }
    }
  }

  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (newValue.length <= MEMO_MAX_LENGTH) {
      setMemo(newValue)
    }
  }

  const titleNearLimit = text.length >= TITLE_MAX_LENGTH * 0.8
  const titleAtLimit = text.length >= TITLE_MAX_LENGTH
  const memoNearLimit = memo.length >= MEMO_MAX_LENGTH * 0.8
  const memoAtLimit = memo.length >= MEMO_MAX_LENGTH

  if (!todo) return null

  const content = (
    <div className="max-h-[60vh] overflow-y-auto scroll-smooth">
      <div className="space-y-6 px-4 py-2">
        {/* Task Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="task-title">{t.taskTitle}</Label>
            <span
              className={cn(
                "text-xs",
                titleAtLimit ? "font-medium text-red-500" : titleNearLimit ? "text-amber-500" : "text-gray-400"
              )}
            >
              {text.length}/{TITLE_MAX_LENGTH}
            </span>
          </div>
          <Input
            id="task-title"
            value={text}
            onChange={handleTextChange}
            placeholder={t.taskTitlePlaceholder}
            disabled={isSaving}
            maxLength={TITLE_MAX_LENGTH}
            className={cn(
              "border-gray-200 bg-white",
              titleError && "border-red-500 focus-visible:ring-red-500"
            )}
          />
          {titleError && (
            <p className="text-xs text-red-500">{t.taskTitleRequired}</p>
          )}
        </div>

        {/* Target Date */}
        <div className="space-y-2">
          <Label>{t.targetDate}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={isSaving}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !targetDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {targetDate ? format(targetDate, "PPP") : <span>{t.pickDate}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={targetDate} onSelect={setTargetDate} />
            </PopoverContent>
          </Popover>
          {isDateChanged && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{t.dateChangeWarning}</span>
            </div>
          )}
        </div>

        {/* Memo / Retrospective Area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="memo">{t.memoReview}</Label>
            <span
              className={cn(
                "text-xs",
                memoAtLimit ? "font-medium text-red-500" : memoNearLimit ? "text-amber-500" : "text-gray-400"
              )}
            >
              {memo.length}/{MEMO_MAX_LENGTH}
            </span>
          </div>
          <Textarea
            id="memo"
            value={memo}
            onChange={handleMemoChange}
            placeholder={t.memoPlaceholder}
            rows={6}
            disabled={isSaving}
            maxLength={MEMO_MAX_LENGTH}
            className="resize-none border-gray-200 bg-white"
          />
          <p className="text-xs text-gray-500">{t.memoHelp}</p>
        </div>
      </div>
    </div>
  )

  const footer = (
    <div className="flex gap-2 p-4">
      <Button
        variant="outline"
        onClick={handleDeleteClick}
        disabled={isSaving || isDeleting}
        className="flex-1 border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
      >
        {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {t.deleteTask}
      </Button>
      <Button
        onClick={handleSave}
        disabled={isSaving || isDeleting || !isDirty()}
        className="flex-1 bg-[#5D7AA5] hover:bg-[#4d6a95]"
      >
        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isSaving ? t.saving : t.saveChanges}
      </Button>
    </div>
  )

  const deleteAlert = (
    <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.deleteTaskConfirm}</AlertDialogTitle>
          <AlertDialogDescription>{t.deleteTaskDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t.delete}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  const unsavedAlert = (
    <AlertDialog open={showUnsavedAlert} onOpenChange={setShowUnsavedAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.unsavedChanges}</AlertDialogTitle>
          <AlertDialogDescription>{t.unsavedChangesDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDiscardChanges}>{t.discardChanges}</AlertDialogAction>
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
              <DrawerTitle>{t.editTask}</DrawerTitle>
              <DrawerDescription>{t.memoHelp}</DrawerDescription>
            </DrawerHeader>
            {content}
            <DrawerFooter>{footer}</DrawerFooter>
          </DrawerContent>
        </Drawer>
        {deleteAlert}
        {unsavedAlert}
      </>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-125 max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t.editTask}</DialogTitle>
            <DialogDescription>{t.memoHelp}</DialogDescription>
          </DialogHeader>
          {content}
          <DialogFooter>{footer}</DialogFooter>
        </DialogContent>
      </Dialog>
      {deleteAlert}
      {unsavedAlert}
    </>
  )
}
