"use client"

import { useState, useEffect } from "react"
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
import { CalendarIcon, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { Todo } from "@/types"

interface TodoDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  todo: Todo | null
  onSave: (id: string, updates: { text: string; targetDate?: Date; memo?: string }) => void
  onDelete: (id: string) => void
}

export function TodoDetailModal({ open, onOpenChange, todo, onSave, onDelete }: TodoDetailModalProps) {
  const [text, setText] = useState("")
  const [targetDate, setTargetDate] = useState<Date | undefined>(undefined)
  const [memo, setMemo] = useState("")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [originalDate, setOriginalDate] = useState<Date | undefined>(undefined)

  // Update state when todo changes
  useEffect(() => {
    if (todo) {
      setText(todo.text)
      setTargetDate(todo.targetDate)
      setOriginalDate(todo.targetDate)
      setMemo(todo.memo || "")
    }
  }, [todo])

  // 날짜가 변경되었는지 확인
  const isDateChanged = (() => {
    if (!originalDate && !targetDate) return false
    if (!originalDate || !targetDate) return true
    return originalDate.toDateString() !== targetDate.toDateString()
  })()

  const handleSave = () => {
    if (todo) {
      onSave(todo.id, { text, targetDate, memo })
      onOpenChange(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteAlert(true)
  }

  const handleDeleteConfirm = () => {
    if (todo) {
      onDelete(todo.id)
      setShowDeleteAlert(false)
      onOpenChange(false)
    }
  }

  if (!todo) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="border-white/50 bg-white/80 backdrop-blur-md sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Edit Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Task Title */}
            <div className="space-y-2">
              <Label htmlFor="task-title" className="text-sm font-medium text-gray-700">
                Task Title
              </Label>
              <Input
                id="task-title"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter task title..."
                className="border-gray-200 bg-white/60 backdrop-blur-sm"
              />
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start border-gray-200 bg-white/60 text-left font-normal backdrop-blur-sm",
                      !targetDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDate ? format(targetDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-white/50 bg-white/90 p-0 backdrop-blur-md">
                  <Calendar mode="single" selected={targetDate} onSelect={setTargetDate} initialFocus />
                </PopoverContent>
              </Popover>
              {isDateChanged && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>날짜를 변경하면 해당 날짜의 할 일 목록으로 이동합니다.</span>
                </div>
              )}
            </div>

            {/* Memo / Retrospective Area */}
            <div className="space-y-2">
              <Label htmlFor="memo" className="text-sm font-medium text-gray-700">
                Memo (Review)
              </Label>
              <Textarea
                id="memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Briefly describe what happened or any blockers..."
                rows={6}
                className="resize-none border-gray-200 bg-white/60 backdrop-blur-sm"
              />
              <p className="text-xs text-gray-500">This memo will be used for AI report generation</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleDeleteClick}
              className="rounded-lg border-red-200 bg-red-50 px-4 py-2 text-red-600 hover:bg-red-100"
            >
              Delete
            </Button>
            <Button onClick={handleSave} className="rounded-lg bg-[#5D7AA5] px-4 py-2 text-white hover:bg-[#4d6a95]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="border-white/50 bg-white/90 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 할 일이 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
