"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"

interface TodoInputProps {
  onAdd: (text: string) => void
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [value, setValue] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onAdd(value.trim())
      setValue("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-white/50 bg-white/70 backdrop-blur-md rounded-xl border p-3">
      <div className="flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <Button
          type="submit"
          size="icon"
          className="h-9 w-9 shrink-0 bg-gray-900 text-white hover:bg-gray-800"
          disabled={!value.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}
