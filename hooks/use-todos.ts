import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { Todo } from "@/types"
import * as todoService from "@/services/todo.service"
import { formatLocalDate } from "@/services/todo.service"

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([])
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
      toast.error("할 일을 불러오는데 실패했습니다")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async (text: string) => {
    try {
      const newTodo = await todoService.createTodo({
        text,
        completed: false,
        targetDate: selectedDate,
      })
      // Optimistic UI 업데이트
      setTodos((prev) => [newTodo, ...prev])
      toast.success("할 일이 추가되었습니다")
    } catch (error) {
      console.error("Failed to create todo:", error)
      toast.error("할 일 추가에 실패했습니다")
      throw error
    }
  }

  const handleToggle = async (id: string) => {
    // Optimistic UI: 이전 상태 백업
    const previousTodos = [...todos]

    try {
      // Optimistic UI 업데이트
      setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))

      // 서버 업데이트
      await todoService.toggleTodo(id)
    } catch (error) {
      console.error("Failed to toggle todo:", error)
      toast.error("할 일 상태 변경에 실패했습니다")
      // 롤백: 이전 상태로 복원
      setTodos(previousTodos)
      throw error
    }
  }

  const handleUpdate = async (id: string, updates: { text: string; targetDate?: Date; memo?: string }) => {
    // Optimistic UI: 이전 상태 백업
    const previousTodos = [...todos]

    try {
      // 날짜가 변경되었는지 확인 (YYYY-MM-DD 단위로 비교)
      const currentSelectedDateString = formatLocalDate(selectedDate)
      const isDateChanged =
        updates.targetDate && formatLocalDate(updates.targetDate) !== currentSelectedDateString

      // Optimistic UI 업데이트
      setTodos((prev) => {
        if (isDateChanged) {
          // 날짜가 변경되었다면 현재 리스트에서 제거
          return prev.filter((todo) => todo.id !== id)
        } else {
          // 날짜가 그대로라면 내용만 업데이트
          return prev.map((todo) =>
            todo.id === id ? { ...todo, text: updates.text, targetDate: updates.targetDate, memo: updates.memo } : todo,
          )
        }
      })

      // 서버 업데이트
      await todoService.updateTodo(id, updates)
      toast.success("할 일이 수정되었습니다")
    } catch (error) {
      console.error("Failed to update todo:", error)
      toast.error("할 일 수정에 실패했습니다")
      // 롤백: 이전 상태로 복원
      setTodos(previousTodos)
      throw error
    }
  }

  const handleDelete = async (id: string) => {
    // Optimistic UI: 이전 상태 백업
    const previousTodos = [...todos]

    try {
      // Optimistic UI 업데이트
      setTodos((prev) => prev.filter((todo) => todo.id !== id))

      // 서버 삭제
      await todoService.deleteTodo(id)
      toast.success("할 일이 삭제되었습니다")
    } catch (error) {
      console.error("Failed to delete todo:", error)
      toast.error("할 일 삭제에 실패했습니다")
      // 롤백: 이전 상태로 복원
      setTodos(previousTodos)
      throw error
    }
  }

  return {
    todos,
    loading,
    selectedDate,
    setSelectedDate,
    handleAdd,
    handleToggle,
    handleUpdate,
    handleDelete,
  }
}
