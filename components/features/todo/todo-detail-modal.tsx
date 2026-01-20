"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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

  // Check if there are unsaved changes
  const isDirty = useCallback(() => {
    if (!todo) return false
    const textChanged = text !== originalText
    const memoChanged = memo !== originalMemo
    const dateChanged = (() => {
      if (!originalDate && !targetDate) return false
      if (!originalDate || !targetDate) return true
      return originalDate.toDateString() !== targetDate.toDateString()
    })()
    return textChanged || memoChanged || dateChanged
  }, [text, memo, targetDate, originalText, originalMemo, originalDate, todo])

  // Check if date changed (for warning display)
  const isDateChanged = (() => {
    if (!originalDate && !targetDate) return false
    if (!originalDate || !targetDate) return true
    return originalDate.toDateString() !== targetDate.toDateString()
  })()

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

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-h-[90dvh] overflow-y-auto border-white/50 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 sm:max-w-125"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-zinc-50">{t.editTask}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Task Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="task-title" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                  {t.taskTitle}
                </Label>
                <span
                  className={cn(
                    "text-xs",
                    titleAtLimit ? "font-medium text-red-500" : titleNearLimit ? "text-amber-500" : "text-gray-400 dark:text-zinc-500"
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
                  "border-gray-200 bg-white/60 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/60",
                  titleError && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {titleError && (
                <p className="text-xs text-red-500">{t.taskTitleRequired}</p>
              )}
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t.targetDate}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isSaving}
                    className={cn(
                      "w-full justify-start border-gray-200 bg-white/60 text-left font-normal backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/60",
                      !targetDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDate ? format(targetDate, "PPP") : <span>{t.pickDate}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-white/50 bg-white/90 p-0 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
                  <Calendar mode="single" selected={targetDate} onSelect={setTargetDate} initialFocus />
                </PopoverContent>
              </Popover>
              {isDateChanged && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{t.dateChangeWarning}</span>
                </div>
              )}
            </div>

            {/* Memo / Retrospective Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="memo" className="text-sm font-medium text-gray-700 dark:text-zinc-300">
                  {t.memoReview}
                </Label>
                <span
                  className={cn(
                    "text-xs",
                    memoAtLimit ? "font-medium text-red-500" : memoNearLimit ? "text-amber-500" : "text-gray-400 dark:text-zinc-500"
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
                className="resize-none border-gray-200 bg-white/60 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/60"
              />
              <p className="text-xs text-gray-500 dark:text-zinc-500">{t.memoHelp}</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleDeleteClick}
              disabled={isSaving || isDeleting}
              className="rounded-lg border-red-200 bg-red-50 px-4 py-2 text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t.deleteTask}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isDeleting || !isDirty()}
              className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? t.saving : t.saveChanges}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="border-white/50 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-zinc-50">{t.deleteTaskConfirm}</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-zinc-400">
              {t.deleteTaskDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg dark:border-zinc-700 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800">
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unsaved Changes Alert Dialog */}
      <AlertDialog open={showUnsavedAlert} onOpenChange={setShowUnsavedAlert}>
        <AlertDialogContent className="border-white/50 bg-white/90 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-zinc-50">{t.unsavedChanges}</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-zinc-400">
              {t.unsavedChangesDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg dark:border-zinc-700 dark:bg-transparent dark:text-zinc-300 dark:hover:bg-zinc-800">
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="rounded-lg bg-gray-900 text-white hover:bg-gray-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              {t.discardChanges}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
