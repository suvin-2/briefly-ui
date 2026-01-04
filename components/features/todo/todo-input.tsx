"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const MAX_LENGTH = 100

interface TodoInputProps {
  onAdd: (text: string) => void
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [value, setValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && value.length <= MAX_LENGTH) {
      onAdd(value.trim())
      setValue("")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_LENGTH) {
      setValue(newValue)
    }
  }

  const isOverLimit = value.length >= MAX_LENGTH
  const isNearLimit = value.length >= MAX_LENGTH * 0.8

  return (
    <form onSubmit={handleSubmit} className="border-white/50 bg-white/70 backdrop-blur-md rounded-xl border p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={handleChange}
            placeholder="Add a new task..."
            maxLength={MAX_LENGTH}
            className="flex-1 border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 pr-14 dark:text-zinc-200 dark:placeholder:text-zinc-500"
          />
          {value.length > 0 && (
            <span
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 text-xs",
                isOverLimit ? "text-red-500 font-medium dark:text-red-400" : isNearLimit ? "text-amber-500 dark:text-amber-400" : "text-gray-400 dark:text-zinc-500"
              )}
            >
              {value.length}/{MAX_LENGTH}
            </span>
          )}
        </div>
        <Button
          type="submit"
          size="icon"
          className="h-9 w-9 shrink-0 bg-gray-900 text-white hover:bg-gray-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
          disabled={!value.trim() || isOverLimit}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
