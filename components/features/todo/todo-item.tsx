"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface TodoItemProps {
  id: string
  text: string
  completed: boolean
  onToggle: (id: string) => void
  onMemo: (id: string) => void
}

export function TodoItem({ id, text, completed, onToggle, onMemo }: TodoItemProps) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-white/50 bg-white/70 p-4 backdrop-blur-md transition-all hover:bg-white/80 dark:border-zinc-800 dark:bg-transparent dark:hover:bg-zinc-900",
        completed && "animate-in fade-in-50 zoom-in-95 duration-200"
      )}
      role="listitem"
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={completed}
          onCheckedChange={() => onToggle(id)}
          className="mt-1 border-gray-300 transition-all data-[state=checked]:scale-110 data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900 dark:border-zinc-700 dark:data-[state=checked]:border-zinc-50 dark:data-[state=checked]:bg-zinc-50"
          aria-label={completed ? `${text} 완료됨` : `${text} 미완료`}
        />
        <label
          htmlFor={id}
          className={cn(
            "flex-1 cursor-pointer text-sm leading-relaxed transition-all duration-300",
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
