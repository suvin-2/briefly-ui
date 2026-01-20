"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/lib/language-context"

const MAX_LENGTH = 200

interface TodoInputProps {
  onAdd: (text: string) => Promise<unknown> | void
  isLoading?: boolean
  error?: string | null
}

export function TodoInput({ onAdd, isLoading = false, error = null }: TodoInputProps) {
  const { t } = useLanguage()
  const [value, setValue] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && value.length <= MAX_LENGTH && !isLoading) {
      await onAdd(value.trim())
      setValue("")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_LENGTH) {
      setValue(newValue)
    }
  }

  const isAtLimit = value.length >= MAX_LENGTH
  const isOverLimit = value.length > MAX_LENGTH
  const isNearLimit = value.length >= MAX_LENGTH * 0.8
  const isEmpty = !value.trim()
  const isDisabled = isEmpty || isOverLimit || isLoading

  const getTooltipMessage = () => {
    if (isLoading) return null
    if (isEmpty) return t.todoInputEmpty
    if (isOverLimit) return `${MAX_LENGTH}${t.todoInputEmpty.includes("내용") ? "자 제한" : " character limit"}`
    return null
  }

  const tooltipMessage = getTooltipMessage()

  return (
    <form onSubmit={handleSubmit} className="border-white/50 bg-white/70 backdrop-blur-md rounded-xl border p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={value}
              onChange={handleChange}
              placeholder={t.addTodo}
              maxLength={MAX_LENGTH}
              disabled={isLoading}
              className="flex-1 border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 pr-14 dark:text-zinc-200 dark:placeholder:text-zinc-500 disabled:opacity-50"
            />
            {value.length > 0 && (
              <span
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 text-xs",
                  isAtLimit ? "text-red-500 font-medium dark:text-red-400" : isNearLimit ? "text-amber-500 dark:text-amber-400" : "text-gray-400 dark:text-zinc-500"
                )}
              >
                {value.length}/{MAX_LENGTH}
              </span>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="submit"
                    size="icon"
                    className="h-9 w-9 shrink-0 bg-gray-900 text-white hover:bg-gray-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200 disabled:opacity-50"
                    disabled={isDisabled}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </span>
              </TooltipTrigger>
              {tooltipMessage && (
                <TooltipContent>
                  <p>{tooltipMessage}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
        {error && (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    </form>
  )
}
