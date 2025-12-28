"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { cn, generateReportTitle } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/lib/language-context"
import type { DateRange } from "react-day-picker"
import type { Report } from "@/types"
import * as reportService from "@/services/report.service"
import * as todoService from "@/services/todo.service"
import { toast } from "sonner"

interface GenerateReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReportCreated: (report: Report) => void
}

export function GenerateReportDialog({ open, onOpenChange, onReportCreated }: GenerateReportDialogProps) {
  const isMobile = useMobile()
  const { language } = useLanguage()
  const [title, setTitle] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [template, setTemplate] = useState("basic")
  const [generating, setGenerating] = useState(false)
  const userModifiedTitle = useRef(false) // 사용자가 제목을 직접 수정했는지 추적

  // 날짜 범위가 변경되면 자동으로 제목 생성 (사용자가 수정하지 않은 경우에만)
  useEffect(() => {
    if (dateRange?.from && dateRange?.to && !userModifiedTitle.current) {
      const autoTitle = generateReportTitle(dateRange.from, dateRange.to, language as "ko" | "en")
      setTitle(autoTitle)
    }
  }, [dateRange, language])

  // 제목 입력 핸들러 - 사용자가 직접 수정했음을 기록
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
    userModifiedTitle.current = true
  }

  // 다이얼로그가 닫힐 때 상태 초기화
  useEffect(() => {
    if (!open) {
      setTitle("")
      setDateRange(undefined)
      setTemplate("basic")
      userModifiedTitle.current = false
    }
  }, [open])

  const handleGenerate = async () => {
    // 제목이 비어있으면 자동 생성된 제목 사용
    let finalTitle = title.trim()
    if (!finalTitle && dateRange?.from && dateRange?.to) {
      finalTitle = generateReportTitle(dateRange.from, dateRange.to, language as "ko" | "en")
      setTitle(finalTitle)
    }

    // Validation
    if (!finalTitle) {
      toast.error("제목을 입력해주세요")
      return
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast.error("날짜 범위를 선택해주세요")
      return
    }

    try {
      setGenerating(true)

      // 선택된 기간의 모든 투두 가져오기 (완료 + 미완료)
      const allTodos = await todoService.getTodosByDateRange(dateRange.from, dateRange.to)

      // 리포트 생성 (완료/미완료 모두 전달)
      const newReport = await reportService.createReport(finalTitle, dateRange.from, dateRange.to, allTodos)

      // 성공 처리
      onReportCreated(newReport)
      setTitle("")
      setDateRange(undefined)
      setTemplate("basic")
      userModifiedTitle.current = false
    } catch (error) {
      console.error("Failed to generate report:", error)
      toast.error("리포트 생성에 실패했습니다")
    } finally {
      setGenerating(false)
    }
  }

  // 지난주/이번주 빠른 선택
  const handleQuickSelect = (type: "last-week" | "this-week") => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

    if (type === "this-week") {
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() + monday)
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      setDateRange({ from: startOfWeek, to: endOfWeek })
    } else {
      const startOfLastWeek = new Date(today)
      startOfLastWeek.setDate(today.getDate() + monday - 7)
      startOfLastWeek.setHours(0, 0, 0, 0)

      const endOfLastWeek = new Date(startOfLastWeek)
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 6)
      endOfLastWeek.setHours(23, 59, 59, 999)

      setDateRange({ from: startOfLastWeek, to: endOfLastWeek })
    }
  }

  const content = (
    <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Label htmlFor="title">리포트 제목</Label>
        <Input
          id="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="예: 12월 4주차 주간보고"
          className="border-gray-200 bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="date-range">날짜 범위</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect("last-week")}
            className="flex-1"
          >
            지난주
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect("this-week")}
            className="flex-1"
          >
            이번주
          </Button>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                "날짜 범위 선택"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              initialFocus
              numberOfMonths={1}
              classNames={{
                day_range_start: "bg-[#5D7AA5] text-white rounded-l-full hover:bg-[#5D7AA5]",
                day_range_end: "bg-[#5D7AA5] text-white rounded-r-full hover:bg-[#5D7AA5]",
                day_range_middle: "bg-blue-100 text-[#5D7AA5] rounded-none",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="template">템플릿</Label>
        <Select value={template} onValueChange={setTemplate}>
          <SelectTrigger id="template" className="bg-white">
            <SelectValue placeholder="템플릿 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="basic">
              <div className="flex flex-col">
                <span className="font-medium">Basic Markdown</span>
                <span className="text-xs text-gray-500">날짜별 완료된 할 일을 정리합니다</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const footer = (
    <div className="flex gap-2 p-4">
      <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={generating}>
        취소
      </Button>
      <Button onClick={handleGenerate} className="flex-1 bg-[#5D7AA5] hover:bg-[#4d6a95]" disabled={generating}>
        <Sparkles className="mr-2 h-4 w-4" />
        {generating ? "생성 중..." : "생성"}
      </Button>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>새 리포트 만들기</DrawerTitle>
            <DrawerDescription>완료된 할 일들을 바탕으로 리포트를 생성합니다</DrawerDescription>
          </DrawerHeader>
          {content}
          <DrawerFooter>{footer}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/50 bg-white/80 backdrop-blur-md sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 리포트 만들기</DialogTitle>
          <DialogDescription>완료된 할 일들을 바탕으로 리포트를 생성합니다</DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
