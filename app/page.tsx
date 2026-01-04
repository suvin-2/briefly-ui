"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { WeeklyDateStrip } from "@/components/weekly-date-strip"
import { TodoItem } from "@/components/todo-item"
import { TodoInput } from "@/components/todo-input"
import { TodoDetailModal } from "@/components/todo-detail-modal"
import { TodoListSkeleton } from "@/components/todo-skeleton"
import { useLanguage } from "@/lib/language-context"
import { useTodos } from "@/hooks/use-todos"
import type { Todo } from "@/types"

export default function HomePage() {
  const { t } = useLanguage()
  const { todos, loading, selectedDate, setSelectedDate, handleAdd, handleToggle, handleUpdate, handleDelete } =
    useTodos()

  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleMemo = (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      setSelectedTodo(todo)
      setModalOpen(true)
    }
  }

  const handleSave = async (id: string, updates: { text: string; targetDate?: Date; memo?: string }) => {
    try {
      await handleUpdate(id, updates)
      setModalOpen(false)
    } catch {
      // Error handled by hook
    }
  }

  const handleDeleteWithModal = async (id: string) => {
    try {
      await handleDelete(id)
      setModalOpen(false)
    } catch {
      // Error handled by hook
    }
  }

  return (
    <AppShell>
      <div className="w-full space-y-6 px-4 md:px-0">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <h1 className="text-balance text-3xl font-bold text-gray-900">{t.weeklyTodos}</h1>
          <p className="text-pretty text-gray-600">{t.todoSubtitle}</p>
        </div>

        {/* Weekly Date Strip */}
        <WeeklyDateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {/* Desktop: Input at Top (Notion style) */}
        <div className="hidden md:block">
          <TodoInput onAdd={handleAdd} />
        </div>

        {/* Todo List - Responsive Grid */}
        {loading ? (
          <TodoListSkeleton />
        ) : todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500" role="status">
            <p>할 일이 없습니다.</p>
            <p className="text-sm">새로운 할 일을 추가해보세요!</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 md:gap-4" role="list" aria-label="할 일 목록">
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
        )}

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
        onDelete={handleDeleteWithModal}
      />
    </AppShell>
  )
}
