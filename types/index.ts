export interface Todo {
  id: string
  text: string
  completed: boolean
  targetDate?: Date
  memo?: string
}

export interface Report {
  id: string
  title: string
  content: string
  dateRange: string
  period: { start: Date; end: Date }
  templateType: "basic" | "custom"
  templateName?: string
  createdAt: string
  templateDeleted?: boolean
}
