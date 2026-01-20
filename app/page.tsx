"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { AppShell } from "@/components/layout/app-shell"
import { WeeklyDateStrip } from "@/components/weekly-date-strip"
import { SortableTodoItem } from "@/components/features/todo/todo-item"
import { TodoInput } from "@/components/features/todo/todo-input"
import { TodoDetailModal } from "@/components/features/todo/todo-detail-modal"
import { TodoListSkeleton } from "@/components/features/todo/todo-skeleton"
import { useLanguage } from "@/lib/language-context"
import { useTodos } from "@/hooks/use-todos"
import type { Todo } from "@/types"
import { ListTodo } from "lucide-react"

export default function HomePage() {
  const { t } = useLanguage()
  const { todos, loading, selectedDate, setSelectedDate, handleAdd, handleToggle, handleUpdate, handleDelete, handleReorder, isAdding, addError } =
    useTodos()

  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = todos.findIndex((t) => t.id === active.id)
      const newIndex = todos.findIndex((t) => t.id === over.id)
      const newOrder = arrayMove(todos, oldIndex, newIndex)
      handleReorder(newOrder)
    }
  }

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
      <div className="w-full min-w-0 space-y-6 px-4 pb-28 md:px-0 md:pb-0">
        {/* Header */}
        <div className="mb-6 space-y-2">
          <h1 className="text-balance text-3xl font-bold text-gray-900">{t.weeklyTodos}</h1>
          <p className="text-pretty text-gray-600">{t.todoSubtitle}</p>
        </div>

        {/* Weekly Date Strip */}
        <WeeklyDateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} isLoading={loading} />

        {/* Desktop: Input at Top (Notion style) */}
        <div className="hidden md:block">
          <TodoInput onAdd={handleAdd} isLoading={isAdding} error={addError} />
        </div>

        {/* Todo List - Responsive Grid */}
        {loading ? (
          <TodoListSkeleton />
        ) : todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-center" role="status">
            <div className="rounded-full bg-gray-100 p-6">
              <ListTodo className="h-12 w-12 text-gray-400" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">할 일이 없습니다</p>
              <p className="text-sm text-gray-500">새로운 할 일을 추가해보세요!</p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="flex min-w-0 flex-col gap-3" role="list" aria-label="할 일 목록">
                {todos.map((todo) => (
                  <SortableTodoItem
                    key={todo.id}
                    id={todo.id}
                    text={todo.text}
                    completed={todo.completed}
                    onToggle={handleToggle}
                    onMemo={handleMemo}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Mobile: Sticky Input at Bottom (above bottom nav) */}
        <div className="fixed bottom-24 left-0 right-0 z-10 px-4 pb-[env(safe-area-inset-bottom)] md:hidden">
          <TodoInput onAdd={handleAdd} isLoading={isAdding} error={addError} />
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
