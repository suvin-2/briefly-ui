import { supabase } from "@/lib/supabase"
import type { Todo } from "@/types"

// ========================================
// Timezone Helper (Local Date First)
// ========================================
/**
 * Date 객체를 로컬 시간 기준 'YYYY-MM-DD' 문자열로 변환
 * 타임존 버그 방지: toISOString()은 UTC로 변환하므로 절대 사용 금지
 * @param date - 변환할 Date 객체
 * @returns 로컬 시간 기준 'YYYY-MM-DD' 문자열
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// ========================================
// Database 타입 (Supabase 스키마와 일치)
// ========================================
interface DatabaseTodo {
  id: string
  user_id: string
  content: string
  completed: boolean
  target_date: string // DB에서는 date string
  memo: string | null
  created_at: string
}

// ========================================
// 타입 변환 헬퍼 함수
// ========================================
function fromDatabase(dbTodo: DatabaseTodo): Todo {
  return {
    id: dbTodo.id,
    text: dbTodo.content,
    completed: dbTodo.completed,
    targetDate: dbTodo.target_date ? new Date(dbTodo.target_date) : undefined,
    memo: dbTodo.memo || undefined,
  }
}

function toDatabase(todo: Partial<Todo>): Partial<Omit<DatabaseTodo, "id" | "user_id" | "created_at">> {
  const dbTodo: Partial<Omit<DatabaseTodo, "id" | "user_id" | "created_at">> = {}

  if (todo.text !== undefined) dbTodo.content = todo.text
  if (todo.completed !== undefined) dbTodo.completed = todo.completed
  if (todo.targetDate !== undefined) {
    dbTodo.target_date = formatLocalDate(todo.targetDate)
  }
  if (todo.memo !== undefined) dbTodo.memo = todo.memo || null

  return dbTodo
}

// ========================================
// Todo Service Functions
// ========================================

/**
 * 모든 Todo 조회
 */
export async function getAllTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching todos:", error)
    throw new Error(error.message)
  }

  return (data as DatabaseTodo[]).map(fromDatabase)
}

/**
 * 특정 날짜의 Todo 조회
 */
export async function getTodosByDate(date: Date): Promise<Todo[]> {
  const dateString = formatLocalDate(date)

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("target_date", dateString)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching todos by date:", error)
    throw new Error(error.message)
  }

  return (data as DatabaseTodo[]).map(fromDatabase)
}

/**
 * 날짜 범위로 Todo 조회 (리포트 생성용)
 */
export async function getTodosByDateRange(startDate: Date, endDate: Date): Promise<Todo[]> {
  const startString = formatLocalDate(startDate)
  const endString = formatLocalDate(endDate)

  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .gte("target_date", startString)
    .lte("target_date", endString)
    .order("target_date", { ascending: true })

  if (error) {
    console.error("Error fetching todos by date range:", error)
    throw new Error(error.message)
  }

  return (data as DatabaseTodo[]).map(fromDatabase)
}

/**
 * Todo 생성
 */
export async function createTodo(todo: Omit<Todo, "id">): Promise<Todo> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const dbTodo = toDatabase(todo)

  const { data, error } = await supabase
    .from("todos")
    .insert({
      ...dbTodo,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating todo:", error)
    throw new Error(error.message)
  }

  return fromDatabase(data as DatabaseTodo)
}

/**
 * Todo 수정
 */
export async function updateTodo(id: string, updates: Partial<Todo>): Promise<Todo> {
  const dbUpdates = toDatabase(updates)

  const { data, error } = await supabase.from("todos").update(dbUpdates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating todo:", error)
    throw new Error(error.message)
  }

  return fromDatabase(data as DatabaseTodo)
}

/**
 * Todo 완료 상태 토글
 */
export async function toggleTodo(id: string): Promise<Todo> {
  // 먼저 현재 상태를 조회
  const { data: currentTodo, error: fetchError } = await supabase.from("todos").select("completed").eq("id", id).single()

  if (fetchError) {
    console.error("Error fetching todo:", fetchError)
    throw new Error(fetchError.message)
  }

  // 상태 반전
  const { data, error } = await supabase
    .from("todos")
    .update({ completed: !currentTodo.completed })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error toggling todo:", error)
    throw new Error(error.message)
  }

  return fromDatabase(data as DatabaseTodo)
}

/**
 * Todo 삭제
 */
export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from("todos").delete().eq("id", id)

  if (error) {
    console.error("Error deleting todo:", error)
    throw new Error(error.message)
  }
}
