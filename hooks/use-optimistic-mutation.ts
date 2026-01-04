import { useState } from "react"
import { toast } from "sonner"

/**
 * Optimistic UI 업데이트를 위한 제네릭 훅
 * @template T - 상태로 관리할 데이터 타입
 */
export function useOptimisticMutation<T>() {
  /**
   * Optimistic Update를 적용하고 롤백 가능한 mutation 수행
   * @param currentState - 현재 상태
   * @param setState - 상태 업데이트 함수
   * @param optimisticUpdate - Optimistic UI를 위한 즉시 적용할 상태 업데이트 함수
   * @param mutation - 실제 서버 요청 함수
   * @param options - 성공/실패 메시지 및 옵션
   */
  async function mutate(
    currentState: T,
    setState: React.Dispatch<React.SetStateAction<T>>,
    optimisticUpdate: (state: T) => T,
    mutation: () => Promise<void>,
    options?: {
      successMessage?: string
      errorMessage?: string
      skipSuccessToast?: boolean
    }
  ): Promise<void> {
    // 이전 상태 백업 (롤백용)
    const previousState = currentState

    try {
      // Optimistic UI 업데이트 (즉시 적용)
      setState(optimisticUpdate)

      // 서버 요청 수행
      await mutation()

      // 성공 메시지 표시 (옵션)
      if (options?.successMessage && !options?.skipSuccessToast) {
        toast.success(options.successMessage)
      }
    } catch (error) {
      console.error("Mutation failed:", error)

      // 실패 시 롤백 (이전 상태로 복원)
      setState(previousState)

      // 에러 메시지 표시
      if (options?.errorMessage) {
        toast.error(options.errorMessage)
      }

      throw error
    }
  }

  return { mutate }
}

/**
 * 배열 상태에 특화된 Optimistic UI 헬퍼 함수들
 */
export const optimisticArrayHelpers = {
  /**
   * 배열에 새 항목 추가 (맨 앞에)
   */
  prepend: <T,>(newItem: T) => (prev: T[]) => [newItem, ...prev],

  /**
   * 배열에 새 항목 추가 (맨 뒤에)
   */
  append: <T,>(newItem: T) => (prev: T[]) => [...prev, newItem],

  /**
   * ID로 배열에서 항목 제거
   */
  remove: <T extends { id: string }>(id: string) => (prev: T[]) => prev.filter((item) => item.id !== id),

  /**
   * ID로 배열 항목 업데이트
   */
  update: <T extends { id: string }>(id: string, updates: Partial<T>) => (prev: T[]) =>
    prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),

  /**
   * ID로 배열 항목 토글 (completed 등의 boolean 필드)
   */
  toggle: <T extends { id: string; completed: boolean }>(id: string) => (prev: T[]) =>
    prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
}
