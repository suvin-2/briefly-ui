"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
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

  // Update state when todo changes
  useEffect(() => {
    if (todo) {
      setText(todo.text)
      setTargetDate(todo.targetDate)
      setMemo(todo.memo || "")
    }
  }, [todo])

  const handleSave = () => {
    if (todo) {
      onSave(todo.id, { text, targetDate, memo })
      onOpenChange(false)
    }
  }

  const handleDelete = () => {
    if (todo) {
      onDelete(todo.id)
      onOpenChange(false)
    }
  }

  if (!todo) return null

  return (
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
            onClick={handleDelete}
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
  )
}
