export interface Todo {
  id: string
  text: string
  completed: boolean
  targetDate?: Date
  memo?: string
}

export interface Report {
  id: string
  title: string // 사용자가 입력한 리포트 제목
  summary: string // 마크다운 형태의 본문 (DB 컬럼명과 일치)
  startDate: Date // 기간 시작일
  endDate: Date // 기간 종료일
  createdAt: Date
}
