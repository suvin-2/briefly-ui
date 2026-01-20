"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { ChevronLeft, ChevronRight, Loader2, CalendarDays } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getTodoStatsByDateRange, formatLocalDate, type TodoStats } from "@/services/todo.service"

interface DateItem {
  date: Date
  day: string
  dayNum: number
  isToday: boolean
}

interface WeeklyDateStripProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  isLoading?: boolean
}

// 날짜 범위 제한: 3개월 전/후
const MAX_MONTHS_RANGE = 3

/**
 * 주어진 날짜가 속한 주의 시작일(월요일)을 반환
 * @param date - 기준 날짜
 * @returns 해당 주의 월요일 Date 객체 (시간은 00:00:00)
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  // 일요일(0)이면 -6, 그 외에는 (1 - day)를 더해 월요일로 이동
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

/**
 * 탐색 가능한 날짜 범위 계산 (오늘 기준 ±3개월)
 */
function getDateLimits(): { minDate: Date; maxDate: Date } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const minDate = new Date(today)
  minDate.setMonth(minDate.getMonth() - MAX_MONTHS_RANGE)

  const maxDate = new Date(today)
  maxDate.setMonth(maxDate.getMonth() + MAX_MONTHS_RANGE)

  return { minDate, maxDate }
}

export function WeeklyDateStrip({ selectedDate, onSelectDate, isLoading = false }: WeeklyDateStripProps) {
  // 날짜 범위 제한 (컴포넌트 생명주기 동안 고정)
  const { minDate, maxDate } = useMemo(() => getDateLimits(), [])

  // 현재 보고 있는 주간 (독립적인 상태)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(selectedDate))

  // 초기 마운트 시에만 selectedDate가 포함된 주로 이동
  // eslint-disable-next-line react-hooks/exhaustive-deps -- 의도적으로 마운트 시에만 실행
  useEffect(() => {
    setCurrentWeekStart(getWeekStart(selectedDate))
  }, [])

  // Generate dates for the strip (7 days on mobile, 14 on desktop)
  const generateDates = (count: number): DateItem[] => {
    const dates: DateItem[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < count; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + i)
      const isToday = date.getTime() === today.getTime()

      dates.push({
        date,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: date.getDate(),
        isToday,
      })
    }
    return dates
  }

  const mobileDates = generateDates(7)
  const desktopDates = generateDates(14)

  // Todo 통계 데이터 조회
  const weekEnd = new Date(currentWeekStart)
  weekEnd.setDate(currentWeekStart.getDate() + 13) // 14일 범위

  const { data: todoStats = [] } = useQuery({
    queryKey: ["todoStats", formatLocalDate(currentWeekStart), formatLocalDate(weekEnd)],
    queryFn: () => getTodoStatsByDateRange(currentWeekStart, weekEnd),
    staleTime: 30 * 1000,
  })

  // 날짜별 통계 맵 생성
  const statsMap = new Map<string, TodoStats>()
  for (const stat of todoStats) {
    statsMap.set(stat.date, stat)
  }

  // 현재 선택된 날짜의 인덱스 계산
  const getSelectedIndex = (dates: DateItem[]) => {
    return dates.findIndex(
      (item) => formatLocalDate(item.date) === formatLocalDate(selectedDate),
    )
  }

  const selectedMobileIndex = getSelectedIndex(mobileDates)
  const selectedDesktopIndex = getSelectedIndex(desktopDates)

  // 이전/다음 주 버튼 비활성화 체크
  const canGoPrev = () => {
    const prevWeekStart = new Date(currentWeekStart)
    prevWeekStart.setDate(prevWeekStart.getDate() - 7)
    return prevWeekStart >= minDate
  }

  const canGoNext = () => {
    const nextWeekStart = new Date(currentWeekStart)
    nextWeekStart.setDate(nextWeekStart.getDate() + 7)
    return nextWeekStart <= maxDate
  }

  const handlePrev = () => {
    if (!canGoPrev()) return
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const handleNext = () => {
    if (!canGoNext()) return
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const dateButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll selected date into view
  useEffect(() => {
    if (selectedMobileIndex >= 0) {
      const selectedButton = dateButtonRefs.current.get(selectedMobileIndex)
      if (selectedButton) {
        selectedButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        })
      }
    }
  }, [selectedMobileIndex, selectedDate])

  /**
   * 키보드 좌우 화살표로 날짜 이동
   * - ArrowLeft: 하루 전으로 이동 (minDate까지)
   * - ArrowRight: 하루 후로 이동 (maxDate까지)
   * - 주간 경계를 넘으면 자동으로 주간 뷰도 이동
   */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      const newDate = new Date(selectedDate)
      newDate.setDate(newDate.getDate() - 1)
      if (newDate >= minDate) {
        onSelectDate(newDate)
        // 새 날짜가 현재 주간에 없으면 주간 이동
        const newWeekStart = getWeekStart(newDate)
        if (newWeekStart.getTime() !== currentWeekStart.getTime()) {
          setCurrentWeekStart(newWeekStart)
        }
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      const newDate = new Date(selectedDate)
      newDate.setDate(newDate.getDate() + 1)
      if (newDate <= maxDate) {
        onSelectDate(newDate)
        // 새 날짜가 현재 주간에 없으면 주간 이동
        const newWeekStart = getWeekStart(newDate)
        if (newWeekStart.getTime() !== currentWeekStart.getTime()) {
          setCurrentWeekStart(newWeekStart)
        }
      }
    }
  }, [selectedDate, minDate, maxDate, currentWeekStart, onSelectDate])

  // 키보드 이벤트 리스너 등록
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener("keydown", handleKeyDown)
      return () => container.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  // 현재 보고 있는 주간의 연월 정보
  const getWeekRangeDisplay = () => {
    const weekEndDisplay = new Date(currentWeekStart)
    weekEndDisplay.setDate(currentWeekStart.getDate() + 6)

    const startMonth = currentWeekStart.toLocaleDateString("en-US", { month: "long" })
    const endMonth = weekEndDisplay.toLocaleDateString("en-US", { month: "long" })
    const year = currentWeekStart.getFullYear()

    // 같은 달인 경우
    if (startMonth === endMonth) {
      return `${startMonth} ${year}`
    }
    // 다른 달에 걸쳐 있는 경우
    return `${startMonth} - ${endMonth} ${year}`
  }

  const weekRangeDisplay = getWeekRangeDisplay()

  // 오늘 날짜인지 확인
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isToday = formatLocalDate(selectedDate) === formatLocalDate(today)

  // 오늘로 이동
  const handleGoToToday = () => {
    const todayDate = new Date()
    todayDate.setHours(0, 0, 0, 0)
    onSelectDate(todayDate)
    setCurrentWeekStart(getWeekStart(todayDate))
  }

  // 날짜 버튼 렌더링
  const renderDateButton = (item: DateItem, idx: number, isMobile: boolean) => {
    const dayOfWeek = item.date.getDay()
    const isSunday = dayOfWeek === 0
    const isSaturday = dayOfWeek === 6
    const isWeekend = isSunday || isSaturday
    const selectedIndex = isMobile ? selectedMobileIndex : selectedDesktopIndex
    const isSelected = selectedIndex === idx
    const dateString = formatLocalDate(item.date)
    const stats = statsMap.get(dateString)
    const isDateLoading = isLoading && isSelected

    return (
      <button
        key={idx}
        ref={isMobile ? (el) => {
          if (el) dateButtonRefs.current.set(idx, el)
          else dateButtonRefs.current.delete(idx)
        } : undefined}
        onClick={() => onSelectDate(item.date)}
        disabled={item.date < minDate || item.date > maxDate}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg transition-all",
          isMobile ? "h-14 w-14 shrink-0 snap-center" : "px-3 py-2",
          isSelected
            ? "bg-gray-900 text-white dark:bg-white dark:text-black"
            : isWeekend
              ? isSunday
                ? "bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-transparent dark:text-rose-400 dark:hover:text-rose-300"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-transparent dark:text-blue-400 dark:hover:text-blue-300"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-transparent dark:text-zinc-400 dark:hover:text-zinc-50",
          item.isToday && !isSelected && "ring-2 ring-[#5D7AA5] ring-offset-2 dark:ring-zinc-400",
          (item.date < minDate || item.date > maxDate) && "cursor-not-allowed opacity-40",
        )}
        aria-label={`${item.date.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}${stats ? `, 할 일 ${stats.total}개 중 ${stats.completed}개 완료` : ""}`}
        tabIndex={isSelected ? 0 : -1}
      >
        {/* 로딩 스피너 */}
        {isDateLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-900/80 dark:bg-white/80">
            <Loader2 className="h-4 w-4 animate-spin text-white dark:text-black" />
          </div>
        )}

        {/* Todo 개수 뱃지 */}
        {stats && stats.total > 0 && !isDateLoading && (
          <span
            className={cn(
              "absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold",
              stats.completed === stats.total
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 text-white"
            )}
          >
            {stats.total}
          </span>
        )}

        <span className={cn("font-medium uppercase", isMobile ? "text-[9px]" : "text-xs")}>{item.day}</span>
        <span className="text-lg font-bold">{item.dayNum}</span>

        {/* 완료율 시각화 (미니 프로그레스 바) */}
        {stats && stats.total > 0 && !isDateLoading && (
          <div
            className={cn(
              "absolute bottom-1.5 h-1 w-6 overflow-hidden rounded-full",
              isSelected ? "bg-white/30 dark:bg-black/30" : "bg-gray-200 dark:bg-zinc-700"
            )}
          >
            <div
              className={cn(
                "h-full rounded-full transition-all",
                stats.completed === stats.total ? "bg-emerald-500" : "bg-amber-400"
              )}
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            />
          </div>
        )}
      </button>
    )
  }

  return (
    <div
      ref={containerRef}
      className="space-y-3"
      tabIndex={0}
      role="application"
      aria-label="주간 날짜 선택기. 좌우 화살표 키로 날짜를 이동할 수 있습니다."
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-zinc-50">{weekRangeDisplay}</h2>
        {!isToday && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToToday}
            className="h-7 gap-1.5 rounded-full border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Today
          </Button>
        )}
      </div>

      <div className="max-w-full rounded-xl border border-white/50 bg-white/70 backdrop-blur-md dark:border-zinc-800 dark:bg-black">
        <div className="relative flex items-center p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            disabled={!canGoPrev()}
            className="relative z-20 h-8 w-8 shrink-0 border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="이전 주"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="relative min-w-0 flex-1 md:hidden">
            <div
              ref={scrollContainerRef}
              className="scrollbar-hide flex snap-x snap-mandatory gap-1 overflow-x-auto p-2"
              role="listbox"
              aria-label="날짜 목록"
            >
              {mobileDates.map((item, idx) => renderDateButton(item, idx, true))}
            </div>
          </div>

          <div className="hidden flex-1 grid-cols-7 gap-2 md:grid" role="listbox" aria-label="날짜 목록">
            {desktopDates.map((item, idx) => renderDateButton(item, idx, false))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            disabled={!canGoNext()}
            className="relative z-20 h-8 w-8 shrink-0 border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-800 dark:bg-transparent dark:text-zinc-400 dark:hover:bg-zinc-800"
            aria-label="다음 주"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
