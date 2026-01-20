"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CalendarIcon, Sparkles, ChevronDown, Eye, AlertTriangle } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { cn, generateReportTitle } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useLanguage } from "@/lib/language-context"
import type { DateRange } from "react-day-picker"
import type { Report, Todo } from "@/types"
import * as reportService from "@/services/report.service"
import * as todoService from "@/services/todo.service"
import { toast } from "sonner"
import { TEMPLATE_CATALOG, type TemplateType, generateReportByTemplate } from "@/lib/report-templates"

// 최대 선택 가능 기간 (일)
const MAX_DATE_RANGE_DAYS = 90

interface GenerateReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReportCreated: (report: Report) => void
}

export function GenerateReportDialog({ open, onOpenChange, onReportCreated }: GenerateReportDialogProps) {
  const isMobile = useMobile()
  const { language, t } = useLanguage()
  const [title, setTitle] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [template, setTemplate] = useState<TemplateType>("basic")
  const [generating, setGenerating] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [showNoTodosAlert, setShowNoTodosAlert] = useState(false)
  const [pendingTodos, setPendingTodos] = useState<Todo[]>([])
  const userModifiedTitle = useRef(false) // 사용자가 제목을 직접 수정했는지 추적

  // 오늘 날짜 (시간 제거)
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  // 미리보기용 샘플 데이터 생성
  const getSamplePreview = () => {
    const sampleTodos = [
      {
        id: "1",
        text: "프로젝트 기획서 작성",
        completed: true,
        targetDate: new Date(),
        memo: "주요 기능 명세 및 타임라인 정리 완료",
        userId: "",
        createdAt: new Date(),
      },
      {
        id: "2",
        text: "클라이언트 미팅",
        completed: true,
        targetDate: new Date(),
        memo: "요구사항 최종 확인 및 승인 받음",
        userId: "",
        createdAt: new Date(),
      },
      {
        id: "3",
        text: "UI/UX 디자인 초안 작성",
        completed: false,
        targetDate: new Date(),
        userId: "",
        createdAt: new Date(),
      },
    ]

    const sampleStartDate = new Date()
    sampleStartDate.setDate(sampleStartDate.getDate() - 7)
    const sampleEndDate = new Date()

    return generateReportByTemplate(template, sampleTodos, sampleStartDate, sampleEndDate)
  }

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
      setPreviewOpen(false)
      setShowNoTodosAlert(false)
      setPendingTodos([])
      userModifiedTitle.current = false
    }
  }, [open])

  /**
   * 날짜 범위 유효성 검사
   * - 미래 날짜 불가
   * - 최대 90일(3개월) 제한
   */
  const validateDateRange = (range: DateRange | undefined): string | null => {
    if (!range?.from || !range?.to) return null

    // 미래 날짜 체크 (종료일이 오늘보다 미래인 경우)
    if (range.to > today) {
      return t.futureDateNotAllowed
    }

    // 최대 기간 체크
    const daysDiff = differenceInDays(range.to, range.from)
    if (daysDiff > MAX_DATE_RANGE_DAYS) {
      return t.maxDateRangeExceeded
    }

    return null
  }

  // 날짜 범위 변경 핸들러 (유효성 검사 포함)
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.to && range.to > today) {
      // 종료일이 미래면 오늘로 조정
      range = { ...range, to: today }
    }

    const error = validateDateRange(range)
    if (error) {
      toast.error(error)
      return
    }

    setDateRange(range)
  }

  /**
   * 리포트 생성 핸들러
   * 1. 제목/날짜 유효성 검사
   * 2. Todo 조회 후 없으면 확인 다이얼로그 표시
   * 3. 사용자 확인 후 실제 생성 진행
   */
  const handleGenerate = async () => {
    // 제목이 비어있으면 자동 생성된 제목 사용
    let finalTitle = title.trim()
    if (!finalTitle && dateRange?.from && dateRange?.to) {
      finalTitle = generateReportTitle(dateRange.from, dateRange.to, language as "ko" | "en")
      setTitle(finalTitle)
    }

    // Validation
    if (!finalTitle) {
      toast.error(t.taskTitleRequired)
      return
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast.error(t.selectDateRange)
      return
    }

    // 날짜 범위 유효성 재검사
    const dateError = validateDateRange(dateRange)
    if (dateError) {
      toast.error(dateError)
      return
    }

    try {
      setGenerating(true)

      // 선택된 기간의 모든 투두 가져오기 (완료 + 미완료)
      const allTodos = await todoService.getTodosByDateRange(dateRange.from, dateRange.to)

      // Todo가 없으면 확인 다이얼로그 표시
      if (allTodos.length === 0) {
        setPendingTodos(allTodos)
        setShowNoTodosAlert(true)
        setGenerating(false)
        return
      }

      // Todo가 있으면 바로 생성
      await createReport(finalTitle, allTodos)
    } catch (error) {
      console.error("Failed to generate report:", error)
      toast.error("리포트 생성에 실패했습니다")
      setGenerating(false)
    }
  }

  /**
   * 실제 리포트 생성 로직 (Todo 확인 후 호출)
   */
  const createReport = async (finalTitle: string, todos: Todo[]) => {
    if (!dateRange?.from || !dateRange?.to) return

    try {
      setGenerating(true)

      // 리포트 생성 (완료/미완료 모두 전달, 선택된 템플릿 타입 포함)
      const newReport = await reportService.createReport(finalTitle, dateRange.from, dateRange.to, todos, template)

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

  // Todo 없음 확인 후 생성 계속
  const handleConfirmNoTodos = async () => {
    setShowNoTodosAlert(false)
    const finalTitle = title.trim() || generateReportTitle(dateRange!.from!, dateRange!.to!, language as "ko" | "en")
    await createReport(finalTitle, pendingTodos)
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
    <div className="max-h-[60vh] overflow-y-auto pr-2">
      <div className="space-y-6 p-4">
      <div className="space-y-2">
        <Label htmlFor="title">{t.reportTitleLabel}</Label>
        <Input
          id="title"
          value={title}
          onChange={handleTitleChange}
          placeholder={t.reportTitlePlaceholder}
          disabled={generating}
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
            disabled={generating}
            className="flex-1"
          >
            {t.lastWeek}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuickSelect("this-week")}
            disabled={generating}
            className="flex-1"
          >
            {t.thisWeek}
          </Button>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={generating}
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
                t.selectDateRangePlaceholder
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={1}
              disabled={(date) => date > today}
              classNames={{
                day_range_start: "bg-[#5D7AA5] text-white rounded-l-full hover:bg-[#5D7AA5]",
                day_range_end: "bg-[#5D7AA5] text-white rounded-r-full hover:bg-[#5D7AA5]",
                day_range_middle: "bg-blue-100 text-[#5D7AA5] rounded-none",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">템플릿 선택</Label>

        <RadioGroup value={template} onValueChange={(value) => setTemplate(value as TemplateType)} className="gap-3">
          {/* 일반 템플릿 */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.generalTemplates}</p>
            {(["basic", "detailed", "summary"] as TemplateType[]).map((templateId) => {
              const info = TEMPLATE_CATALOG[templateId]
              const isSelected = template === templateId
              return (
                <div
                  key={templateId}
                  className={cn(
                    "relative flex items-start space-x-3 rounded-xl border-2 p-4 transition-all cursor-pointer",
                    isSelected
                      ? "border-[#5D7AA5] bg-[#5D7AA5]/5"
                      : "border-gray-200 bg-white hover:border-[#5D7AA5]/50",
                  )}
                  onClick={() => setTemplate(templateId)}
                >
                  <RadioGroupItem value={templateId} id={templateId} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={templateId}
                      className="flex items-center gap-2 text-base font-semibold text-gray-900 cursor-pointer"
                    >
                      <span className="text-xl">{info.icon}</span>
                      {language === "ko" ? info.name : info.nameEn}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {language === "ko" ? info.description : info.descriptionEn}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 팀별 템플릿 */}
          <div className="space-y-2 pt-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.teamTemplates}</p>
            {(["dev-team", "sales-team"] as TemplateType[]).map((templateId) => {
              const info = TEMPLATE_CATALOG[templateId]
              const isSelected = template === templateId
              return (
                <div
                  key={templateId}
                  className={cn(
                    "relative flex items-start space-x-3 rounded-xl border-2 p-4 transition-all cursor-pointer",
                    isSelected
                      ? "border-[#5D7AA5] bg-[#5D7AA5]/5"
                      : "border-gray-200 bg-white hover:border-[#5D7AA5]/50",
                  )}
                  onClick={() => setTemplate(templateId)}
                >
                  <RadioGroupItem value={templateId} id={templateId} className="mt-1" />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={templateId}
                      className="flex items-center gap-2 text-base font-semibold text-gray-900 cursor-pointer"
                    >
                      <span className="text-xl">{info.icon}</span>
                      {language === "ko" ? info.name : info.nameEn}
                    </Label>
                    <p className="text-sm text-gray-600">
                      {language === "ko" ? info.description : info.descriptionEn}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </RadioGroup>
      </div>

      {/* 템플릿 미리보기 섹션 */}
      <div className="space-y-2">
        <Collapsible open={previewOpen} onOpenChange={setPreviewOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between border-gray-200 bg-white hover:bg-gray-50"
              type="button"
            >
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{t.templatePreview || "템플릿 미리보기"}</span>
              </span>
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", previewOpen && "rotate-180")}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  {language === "ko" ? TEMPLATE_CATALOG[template].name : TEMPLATE_CATALOG[template].nameEn}
                </p>
                <span className="text-xs text-gray-500">샘플 데이터</span>
              </div>
              <div className="max-h-64 overflow-y-auto rounded-lg bg-white p-4">
                <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono">
                  {getSamplePreview()}
                </pre>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      </div>
    </div>
  )

  /**
   * 다이얼로그 닫기 핸들러
   * 생성 중일 때는 닫기 방지
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (generating && !newOpen) {
      // 생성 중에는 닫기 방지
      return
    }
    onOpenChange(newOpen)
  }

  const footer = (
    <div className="flex gap-2 p-4">
      <Button variant="outline" onClick={() => handleOpenChange(false)} className="flex-1" disabled={generating}>
        {t.cancel}
      </Button>
      <Button onClick={handleGenerate} className="flex-1 bg-[#5D7AA5] hover:bg-[#4d6a95]" disabled={generating}>
        <Sparkles className="mr-2 h-4 w-4" />
        {generating ? t.generatingInProgress : t.generateReport}
      </Button>
    </div>
  )

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={handleOpenChange}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle>{t.createNewReport}</DrawerTitle>
              <DrawerDescription>완료된 할 일들을 바탕으로 리포트를 생성합니다</DrawerDescription>
            </DrawerHeader>
            {content}
            <DrawerFooter>{footer}</DrawerFooter>
          </DrawerContent>
        </Drawer>

        {/* Todo 없음 확인 다이얼로그 */}
        <AlertDialog open={showNoTodosAlert} onOpenChange={setShowNoTodosAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {t.noTodosInRange}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t.noTodosInRangeDesc}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmNoTodos} className="bg-[#5D7AA5] hover:bg-[#4d6a95]">
                {t.continueGenerate}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="border-white/50 bg-white/80 backdrop-blur-md sm:max-w-125 max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{t.createNewReport}</DialogTitle>
            <DialogDescription>완료된 할 일들을 바탕으로 리포트를 생성합니다</DialogDescription>
          </DialogHeader>
          {content}
          <DialogFooter>{footer}</DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Todo 없음 확인 다이얼로그 */}
      <AlertDialog open={showNoTodosAlert} onOpenChange={setShowNoTodosAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t.noTodosInRange}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t.noTodosInRangeDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmNoTodos} className="bg-[#5D7AA5] hover:bg-[#4d6a95]">
              {t.continueGenerate}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
