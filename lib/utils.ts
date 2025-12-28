import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 날짜 범위로부터 스마트한 리포트 제목 생성
 * 예: "2024년 12월 4주차 주간보고" 또는 "Dec 23 - Dec 29 Weekly Report"
 */
export function generateReportTitle(startDate: Date, endDate: Date, language: "ko" | "en" = "ko"): string {
  if (language === "ko") {
    const year = startDate.getFullYear()
    const month = startDate.getMonth() + 1

    // 해당 월의 몇 주차인지 계산
    const firstDayOfMonth = new Date(year, startDate.getMonth(), 1)
    const dayOfMonth = startDate.getDate()
    const weekOfMonth = Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7)

    return `${year}년 ${month}월 ${weekOfMonth}주차 주간보고`
  } else {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const startMonth = monthNames[startDate.getMonth()]
    const endMonth = monthNames[endDate.getMonth()]
    const startDay = startDate.getDate()
    const endDay = endDate.getDate()

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay} Weekly Report`
    } else {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay} Weekly Report`
    }
  }
}
