import { useState, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { Todo } from "@/types"
import * as todoService from "@/services/todo.service"
import { formatLocalDate } from "@/services/todo.service"

export function useTodos() {
  const queryClient = useQueryClient()

  // 선택된 날짜 상태 (기본값: 오늘)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })

  // TanStack Query로 todos 조회 - 날짜별 캐싱
  const {
    data: todos = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["todos", formatLocalDate(selectedDate)],
    queryFn: () => todoService.getTodosByDate(selectedDate),
    staleTime: 30 * 1000, // 30초 동안 fresh
  })

  // 에러 처리
  if (error) {
    console.error("Failed to load todos:", error)
    toast.error("할 일을 불러오는데 실패했습니다")
  }

  // Add Todo Mutation
  const addMutation = useMutation({
    mutationFn: (text: string) =>
      todoService.createTodo({
        text,
        completed: false,
        targetDate: selectedDate,
      }),
    onMutate: async (text) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["todos", formatLocalDate(selectedDate)] })

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos", formatLocalDate(selectedDate)])

      // Optimistically update
      const optimisticTodo: Todo = {
        id: `temp-${Date.now()}`,
        text,
        completed: false,
        targetDate: selectedDate,
      }
      queryClient.setQueryData<Todo[]>(["todos", formatLocalDate(selectedDate)], (old = []) => [
        optimisticTodo,
        ...old,
      ])

      return { previousTodos }
    },
    onSuccess: (newTodo) => {
      // Replace optimistic with real data
      queryClient.setQueryData<Todo[]>(["todos", formatLocalDate(selectedDate)], (old = []) =>
        old.map((todo) => (todo.id.startsWith("temp-") ? newTodo : todo))
      )
      toast.success("할 일이 추가되었습니다")
    },
    onError: (error, _text, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos", formatLocalDate(selectedDate)], context.previousTodos)
      }
      console.error("Failed to create todo:", error)
      toast.error("할 일 추가에 실패했습니다")
    },
  })

  // Toggle Todo Mutation
  const toggleMutation = useMutation({
    mutationFn: todoService.toggleTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos", formatLocalDate(selectedDate)] })

      const previousTodos = queryClient.getQueryData<Todo[]>(["todos", formatLocalDate(selectedDate)])

      // Optimistic update
      queryClient.setQueryData<Todo[]>(["todos", formatLocalDate(selectedDate)], (old = []) =>
        old.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo))
      )

      return { previousTodos }
    },
    onError: (error, _id, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos", formatLocalDate(selectedDate)], context.previousTodos)
      }
      console.error("Failed to toggle todo:", error)
      toast.error("할 일 상태 변경에 실패했습니다")
    },
  })

  const handleAdd = (text: string) => addMutation.mutateAsync(text)
  const handleToggle = (id: string) => toggleMutation.mutate(id)

  // Update Todo Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { text: string; targetDate?: Date; memo?: string } }) =>
      todoService.updateTodo(id, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["todos", formatLocalDate(selectedDate)] })

      const previousTodos = queryClient.getQueryData<Todo[]>(["todos", formatLocalDate(selectedDate)])

      // 날짜가 변경되었는지 확인
      const currentSelectedDateString = formatLocalDate(selectedDate)
      const isDateChanged =
        updates.targetDate && formatLocalDate(updates.targetDate) !== currentSelectedDateString

      // Optimistic update
      queryClient.setQueryData<Todo[]>(["todos", formatLocalDate(selectedDate)], (old = []) => {
        if (isDateChanged) {
          return old.filter((todo) => todo.id !== id)
        } else {
          return old.map((todo) =>
            todo.id === id ? { ...todo, text: updates.text, targetDate: updates.targetDate, memo: updates.memo } : todo
          )
        }
      })

      // 날짜가 변경된 경우 새로운 날짜의 캐시 무효화
      if (isDateChanged && updates.targetDate) {
        queryClient.invalidateQueries({ queryKey: ["todos", formatLocalDate(updates.targetDate)] })
      }

      return { previousTodos }
    },
    onSuccess: () => {
      toast.success("할 일이 수정되었습니다")
    },
    onError: (error, _variables, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos", formatLocalDate(selectedDate)], context.previousTodos)
      }
      console.error("Failed to update todo:", error)
      toast.error("할 일 수정에 실패했습니다")
    },
  })

  // Delete Todo Mutation
  const deleteMutation = useMutation({
    mutationFn: todoService.deleteTodo,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["todos", formatLocalDate(selectedDate)] })

      const previousTodos = queryClient.getQueryData<Todo[]>(["todos", formatLocalDate(selectedDate)])

      // Optimistic update
      queryClient.setQueryData<Todo[]>(["todos", formatLocalDate(selectedDate)], (old = []) =>
        old.filter((todo) => todo.id !== id)
      )

      return { previousTodos }
    },
    onSuccess: () => {
      toast.success("할 일이 삭제되었습니다")
    },
    onError: (error, _id, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(["todos", formatLocalDate(selectedDate)], context.previousTodos)
      }
      console.error("Failed to delete todo:", error)
      toast.error("할 일 삭제에 실패했습니다")
    },
  })

  const handleUpdate = (id: string, updates: { text: string; targetDate?: Date; memo?: string }) =>
    updateMutation.mutateAsync({ id, updates })

  const handleDelete = (id: string) => deleteMutation.mutateAsync(id)

  // Reorder Mutation
  const reorderTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const reorderMutation = useMutation({
    mutationFn: (todoIds: string[]) => todoService.reorderTodos(todoIds),
    onError: (error) => {
      console.error("Failed to reorder todos:", error)
      toast.error("순서 변경에 실패했습니다")
      // Refetch to restore correct order from DB
      queryClient.invalidateQueries({ queryKey: ["todos", formatLocalDate(selectedDate)] })
    },
  })

  // Reorder todos with optimistic update and debounced DB save
  const handleReorder = (newTodos: Todo[]) => {
    // Optimistic update immediately
    queryClient.setQueryData<Todo[]>(["todos", formatLocalDate(selectedDate)], newTodos)

    // Debounce DB save (300ms) to handle rapid reordering
    if (reorderTimeoutRef.current) {
      clearTimeout(reorderTimeoutRef.current)
    }

    reorderTimeoutRef.current = setTimeout(() => {
      const todoIds = newTodos.map((t) => t.id)
      reorderMutation.mutate(todoIds)
    }, 300)
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
    handleReorder,
    isAdding: addMutation.isPending,
    addError: addMutation.error ? "할 일 추가에 실패했습니다" : null,
  }
}
