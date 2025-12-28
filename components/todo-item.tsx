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
    <div className="group rounded-xl border border-white/50 bg-white/70 p-4 backdrop-blur-md transition-all hover:bg-white/80">
      <div className="flex items-start gap-3">
        <Checkbox
          id={id}
          checked={completed}
          onCheckedChange={() => onToggle(id)}
          className="mt-1 border-gray-300 data-[state=checked]:border-gray-900 data-[state=checked]:bg-gray-900"
        />
        <label
          htmlFor={id}
          className={cn(
            "flex-1 cursor-pointer text-sm leading-relaxed transition-all",
            completed ? "text-gray-400 line-through" : "text-gray-900",
          )}
        >
          {text}
        </label>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMemo(id)}
          className="h-8 w-8 shrink-0 text-gray-500 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100"
        >
          <FileText className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
