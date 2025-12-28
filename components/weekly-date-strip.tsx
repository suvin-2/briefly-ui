"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DateItem {
  date: Date
  day: string
  dayNum: number
  isToday: boolean
}

interface WeeklyDateStripProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

export function WeeklyDateStrip({ selectedDate, onSelectDate }: WeeklyDateStripProps) {
  // selectedDate를 기준으로 주의 시작 날짜 계산
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    const day = d.getDay()
    const diff = day === 0 ? -6 : 1 - day // 월요일 시작
    d.setDate(d.getDate() + diff)
    return d
  }

  // 현재 보고 있는 주간 (독립적인 상태)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(selectedDate))
  const [rangeStart, setRangeStart] = useState<number | null>(null)
  const [rangeEnd, setRangeEnd] = useState<number | null>(null)

  // 초기 진입 시에만 selectedDate가 포함된 주로 이동
  useEffect(() => {
    setCurrentWeekStart(getWeekStart(selectedDate))
  }, []) // 빈 배열로 초기 마운트 시에만 실행

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

  // 현재 선택된 날짜의 인덱스 계산
  const getSelectedIndex = (dates: DateItem[]) => {
    return dates.findIndex(
      (item) => item.date.toISOString().split("T")[0] === selectedDate.toISOString().split("T")[0],
    )
  }

  const selectedMobileIndex = getSelectedIndex(mobileDates)
  const selectedDesktopIndex = getSelectedIndex(desktopDates)

  const handlePrev = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  const getDateRangeClass = (idx: number) => {
    if (rangeStart === null || rangeEnd === null) {
      return "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }

    if (idx === rangeStart && idx === rangeEnd) {
      // Single day selection
      return "bg-[#5D7AA5] text-white rounded-xl"
    } else if (idx === rangeStart) {
      // Start of range
      return "bg-[#5D7AA5] text-white rounded-l-xl"
    } else if (idx === rangeEnd) {
      // End of range
      return "bg-[#5D7AA5] text-white rounded-r-xl"
    } else if (idx > rangeStart && idx < rangeEnd) {
      // Middle of range
      return "bg-blue-100 text-[#5D7AA5]"
    } else {
      // Not in range
      return "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }
  }

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container

    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth)
  }

  useEffect(() => {
    checkScroll()
  }, [mobileDates])

  // 현재 보고 있는 주간의 연월 정보
  const getWeekRangeDisplay = () => {
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(currentWeekStart.getDate() + 6)

    const startMonth = currentWeekStart.toLocaleDateString("en-US", { month: "long" })
    const endMonth = weekEnd.toLocaleDateString("en-US", { month: "long" })
    const year = currentWeekStart.getFullYear()

    // 같은 달인 경우
    if (startMonth === endMonth) {
      return `${startMonth} ${year}`
    }
    // 다른 달에 걸쳐 있는 경우
    return `${startMonth} - ${endMonth} ${year}`
  }

  const weekRangeDisplay = getWeekRangeDisplay()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{weekRangeDisplay}</h2>
      </div>

      <div className="max-w-full rounded-xl border border-white/50 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-2 p-0">
          <Button variant="ghost" size="icon" onClick={handlePrev} className="h-8 w-8 shrink-0 text-gray-500">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="relative min-w-0 flex-1 md:hidden">
            {/* Left fade gradient - only visible when can scroll left */}
            {canScrollLeft && (
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white to-transparent" />
            )}

            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="scrollbar-none flex snap-x snap-mandatory gap-1 overflow-x-auto"
            >
              {mobileDates.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectDate(item.date)}
                  className={cn(
                    "flex h-14 w-14 shrink-0 snap-center flex-col items-center justify-center rounded-lg transition-all",
                    selectedMobileIndex === idx
                      ? "bg-[#5D7AA5] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    item.isToday && "ring-2 ring-[#5D7AA5] ring-offset-2",
                  )}
                >
                  <span className="text-[9px] font-medium uppercase">{item.day}</span>
                  <span className="text-lg font-bold">{item.dayNum}</span>
                </button>
              ))}
            </div>

            {/* Right fade gradient - only visible when can scroll right */}
            {canScrollRight && (
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white to-transparent" />
            )}
          </div>

          <div className="hidden flex-1 grid-cols-7 gap-2 md:grid">
            {desktopDates.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectDate(item.date)}
                className={cn(
                  "flex flex-col items-center rounded-lg px-3 py-2 transition-all",
                  selectedDesktopIndex === idx
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                  item.isToday && "ring-2 ring-gray-900 ring-offset-2",
                )}
              >
                <span className="text-xs font-medium">{item.day}</span>
                <span className="text-lg font-bold">{item.dayNum}</span>
              </button>
            ))}
          </div>

          <Button variant="ghost" size="icon" onClick={handleNext} className="h-8 w-8 shrink-0 text-gray-500">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
