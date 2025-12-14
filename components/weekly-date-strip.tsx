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

export function WeeklyDateStrip() {
  const [startDate, setStartDate] = useState(new Date())
  const [rangeStart, setRangeStart] = useState<number | null>(null)
  const [rangeEnd, setRangeEnd] = useState<number | null>(null)

  // Generate dates for the strip (7 days on mobile, 14 on desktop)
  const generateDates = (count: number): DateItem[] => {
    const dates: DateItem[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < count; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
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

  const [selectedDate, setSelectedDate] = useState<number>(generateDates(14).findIndex((d) => d.isToday))

  const mobileDates = generateDates(7)
  const desktopDates = generateDates(14)

  const handlePrev = () => {
    const newDate = new Date(startDate)
    newDate.setDate(startDate.getDate() - 7)
    setStartDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(startDate)
    newDate.setDate(startDate.getDate() + 7)
    setStartDate(newDate)
  }

  const getDateRangeClass = (idx: number) => {
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

  const currentMonth = startDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">{currentMonth}</h2>
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
                  onClick={() => setSelectedDate(idx)}
                  className={cn(
                    "flex h-14 w-14 shrink-0 snap-center flex-col items-center justify-center rounded-lg transition-all",
                    selectedDate === idx ? "bg-[#5D7AA5] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200",
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
                onClick={() => setSelectedDate(idx)}
                className={cn(
                  "flex flex-col items-center rounded-lg px-3 py-2 transition-all",
                  selectedDate === idx ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200",
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
