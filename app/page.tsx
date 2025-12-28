"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/app-shell"
import { WeeklyDateStrip } from "@/components/weekly-date-strip"
import { TodoItem } from "@/components/todo-item"
import { TodoInput } from "@/components/todo-input"
import { TodoDetailModal } from "@/components/todo-detail-modal"
import { useLanguage } from "@/lib/language-context"
import type { Todo } from "@/types"
import * as todoService from "@/services/todo.service"

export default function HomePage() {
  const { t } = useLanguage()
  const [todos, setTodos] = useState<Todo[]>([])
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // 선택된 날짜 상태 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })

  // selectedDate가 변경될 때마다 해당 날짜의 todos 조회
  useEffect(() => {
    loadTodosByDate(selectedDate)
  }, [selectedDate])

  const loadTodosByDate = async (date: Date) => {
    try {
      setLoading(true)
      const data = await todoService.getTodosByDate(date)
      setTodos(data)
    } catch (error) {
      console.error("Failed to load todos:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: string) => {
    try {
      // Optimistic UI 업데이트
      setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))

      // 서버 업데이트
      await todoService.toggleTodo(id)
    } catch (error) {
      console.error("Failed to toggle todo:", error)
      // 실패 시 데이터 다시 로드
      loadTodosByDate(selectedDate)
    }
  }

  const handleMemo = (id: string) => {
    const todo = todos.find((t) => t.id === id)
    if (todo) {
      setSelectedTodo(todo)
      setModalOpen(true)
    }
  }

  const handleAdd = async (text: string) => {
    try {
      const newTodo = await todoService.createTodo({
        text,
        completed: false,
        targetDate: selectedDate, // 선택된 날짜로 설정
      })
      setTodos((prev) => [newTodo, ...prev])
    } catch (error) {
      console.error("Failed to create todo:", error)
    }
  }

  const handleSave = async (id: string, updates: { text: string; targetDate?: Date; memo?: string }) => {
    try {
      // Optimistic UI 업데이트
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, text: updates.text, targetDate: updates.targetDate, memo: updates.memo } : todo,
        ),
      )

      // 서버 업데이트
      await todoService.updateTodo(id, updates)
      setModalOpen(false)
    } catch (error) {
      console.error("Failed to update todo:", error)
      // 실패 시 데이터 다시 로드
      loadTodosByDate(selectedDate)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      // Optimistic UI 업데이트
      setTodos((prev) => prev.filter((todo) => todo.id !== id))

      // 서버 삭제
      await todoService.deleteTodo(id)
      setModalOpen(false)
    } catch (error) {
      console.error("Failed to delete todo:", error)
      // 실패 시 데이터 다시 로드
      loadTodosByDate(selectedDate)
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
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <p>할 일이 없습니다.</p>
            <p className="text-sm">새로운 할 일을 추가해보세요!</p>
          </div>
        ) : (
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
        onDelete={handleDelete}
      />
    </AppShell>
  )
}
