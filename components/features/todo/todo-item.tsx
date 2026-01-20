"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { FileText, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface SortableTodoItemProps {
  id: string
  text: string
  completed: boolean
  onToggle: (id: string) => void
  onMemo: (id: string) => void
}

export function SortableTodoItem({ id, text, completed, onToggle, onMemo }: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border border-white/50 bg-white/70 p-4 backdrop-blur-md hover:bg-white/80 dark:border-zinc-800 dark:bg-transparent dark:hover:bg-zinc-900",
        isDragging && "opacity-50 shadow-lg z-50"
      )}
      role="listitem"
    >
      <div className="flex items-start gap-2 min-w-0">
        {/* Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="mt-1 shrink-0 cursor-grab touch-none rounded p-0.5 text-gray-400 opacity-40 transition-opacity hover:opacity-100 focus:opacity-100 active:cursor-grabbing dark:text-zinc-600 md:opacity-0 md:group-hover:opacity-100"
          aria-label="드래그하여 순서 변경"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Checkbox
          id={id}
          checked={completed}
          onCheckedChange={() => onToggle(id)}
          className="mt-1 shrink-0 border-gray-300 transition-all data-[state=checked]:scale-110 data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900 dark:border-zinc-700 dark:data-[state=checked]:border-zinc-50 dark:data-[state=checked]:bg-zinc-50"
          aria-label={completed ? `${text} 완료됨` : `${text} 미완료`}
        />
        <label
          htmlFor={id}
          className={cn(
            "min-w-0 flex-1 cursor-pointer break-all text-sm leading-relaxed transition-all duration-300",
            completed ? "text-gray-400 line-through dark:text-zinc-600" : "text-gray-900 dark:text-zinc-200",
          )}
        >
          {text}
        </label>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMemo(id)}
          className="h-8 w-8 shrink-0 text-gray-500 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 dark:text-zinc-400"
          aria-label={`${text} 메모 및 상세 정보 보기`}
        >
          <FileText className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
