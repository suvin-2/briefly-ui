"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { WeeklyDateStrip } from "@/components/weekly-date-strip"
import { TodoItem } from "@/components/todo-item"
import { TodoInput } from "@/components/todo-input"
import { TodoDetailModal } from "@/components/todo-detail-modal"
import { useLanguage } from "@/lib/language-context"

interface Todo {
  id: string
  text: string
  completed: boolean
  targetDate?: Date
  memo?: string
}

export default function HomePage() {
  const { t } = useLanguage()
  const [todos, setTodos] = useState<Todo[]>([
    { id: "1", text: "Review weekly design system updates", completed: false },
    { id: "2", text: "Implement glassmorphism navigation component", completed: true },
    { id: "3", text: "Test responsive layout on mobile devices", completed: false },
    { id: "4", text: "Update documentation for new UI patterns", completed: false },
    { id: "5", text: "Schedule team meeting for project review", completed: false },
    { id: "6", text: "Optimize image assets for better performance", completed: false },
  ])
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleToggle = (id: string) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const handleMemo = (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      setSelectedTodo(todo)
      setModalOpen(true)
    }
  }

  const handleAdd = (text: string) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      text,
      completed: false,
    }
    setTodos((prev) => [newTodo, ...prev])
  }

  const handleSave = (id: string, updates: { text: string; targetDate?: Date; memo?: string }) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, text: updates.text, targetDate: updates.targetDate, memo: updates.memo } : todo,
      ),
    )
  }

  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  return (
    <AppShell>
      <div className="w-full space-y-6 px-4 md:px-0">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <h1 className="text-balance text-3xl font-bold text-gray-900">{t.weeklyTodos}</h1>
          <p className="text-pretty text-gray-600">Manage your tasks with a clean, minimal interface</p>
        </div>

        {/* Weekly Date Strip */}
        <WeeklyDateStrip />

        {/* Desktop: Input at Top (Notion style) */}
        <div className="hidden md:block">
          <TodoInput onAdd={handleAdd} />
        </div>

        {/* Todo List - Responsive Grid */}
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {todos.map((todo) => (
            <TodoItem
              key={todo.id}
              id={todo.id}
              text={todo.text}
              completed={todo.completed}
              onToggle={handleToggle}
              onMemo={handleMemo}
            />
          ))}
        </div>

        {/* Mobile: Sticky Input at Bottom (above bottom nav) */}
        <div className="fixed bottom-20 left-0 right-0 px-4 md:hidden">
          <TodoInput onAdd={handleAdd} />
        </div>
      </div>

      <TodoDetailModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        todo={selectedTodo}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </AppShell>
  )
}
