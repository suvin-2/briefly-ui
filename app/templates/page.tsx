"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Eye, Clock } from "lucide-react"
import { toast } from "sonner"
import { useLanguage } from "@/lib/language-context"
import { TEMPLATE_CATALOG, type TemplateType, generateReportByTemplate } from "@/lib/report-templates"
import { MarkdownPreview } from "@/components/markdown-preview"
import type { Todo } from "@/types"

export default function TemplatesPage() {
  const { t, language } = useLanguage()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null)

  const generalTemplates = Object.values(TEMPLATE_CATALOG).filter((template) => template.category === "general")
  const teamTemplates = Object.values(TEMPLATE_CATALOG).filter((template) => template.category === "team-specific")

  const handleUploadClick = () => {
    toast.info(t.templateUploadComingSoon, {
      description: "곧 사용하실 수 있습니다!",
      icon: <Clock className="h-4 w-4" />,
    })
  }

  const handlePreview = (templateId: TemplateType) => {
    setSelectedTemplate(templateId)
    setPreviewOpen(true)
  }

  // 미리보기용 샘플 데이터 생성
  const getSamplePreview = (templateId: TemplateType) => {
    // 날짜 생성 (지난주 월요일 ~ 일요일)
    const today = new Date()
    const dayOfWeek = today.getDay()
    const monday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

    const lastMonday = new Date(today)
    lastMonday.setDate(today.getDate() + monday - 7)
    lastMonday.setHours(0, 0, 0, 0)

    const lastSunday = new Date(lastMonday)
    lastSunday.setDate(lastMonday.getDate() + 6)
    lastSunday.setHours(23, 59, 59, 999)

    // 요일별 날짜 생성
    const getDateByOffset = (offset: number) => {
      const date = new Date(lastMonday)
      date.setDate(lastMonday.getDate() + offset)
      return date
    }

    const sampleTodos: Todo[] = [
      // 월요일
      {
        id: "1",
        text: "주간 회의 진행 및 목표 설정",
        completed: true,
        targetDate: getDateByOffset(0),
        memo: "팀원들과 이번 주 목표 공유 및 역할 분담 완료. Q4 목표 달성을 위한 마일스톤 설정",
      },
      {
        id: "2",
        text: "신규 프로젝트 기획서 초안 작성",
        completed: true,
        targetDate: getDateByOffset(0),
        memo: "고객 요구사항 분석 및 주요 기능 명세 작성. MVP 범위 정의 완료",
      },
      // 화요일
      {
        id: "3",
        text: "데이터베이스 스키마 설계 및 ERD 작성",
        completed: true,
        targetDate: getDateByOffset(1),
        memo: "사용자, 주문, 상품 테이블 관계 정의. 정규화 3단계까지 적용",
      },
      {
        id: "4",
        text: "클라이언트 미팅 (요구사항 확인)",
        completed: true,
        targetDate: getDateByOffset(1),
        memo: "추가 기능 요청사항 3건 확인. 일정 재조정 필요",
      },
      // 수요일
      {
        id: "5",
        text: "RESTful API 설계 및 문서화",
        completed: true,
        targetDate: getDateByOffset(2),
        memo: "Swagger를 활용한 API 문서 작성. 인증/인가 플로우 정의",
      },
      {
        id: "6",
        text: "UI/UX 프로토타입 검토 미팅",
        completed: true,
        targetDate: getDateByOffset(2),
        memo: "디자이너와 협업하여 사용자 플로우 개선. A/B 테스트 계획 수립",
      },
      // 목요일
      {
        id: "7",
        text: "백엔드 코어 로직 구현 시작",
        completed: true,
        targetDate: getDateByOffset(3),
        memo: "사용자 인증 모듈 구현 완료. JWT 토큰 기반 인증 적용",
      },
      {
        id: "8",
        text: "단위 테스트 작성 및 코드 리뷰",
        completed: true,
        targetDate: getDateByOffset(3),
      },
      // 금요일
      {
        id: "9",
        text: "프론트엔드 컴포넌트 개발",
        completed: true,
        targetDate: getDateByOffset(4),
        memo: "로그인, 회원가입 페이지 구현. React Hook Form 적용",
      },
      {
        id: "10",
        text: "CI/CD 파이프라인 구축",
        completed: false,
        targetDate: getDateByOffset(4),
        memo: "GitHub Actions 설정 중. Docker 이미지 빌드 자동화 진행중",
      },
      // 토요일 (진행중)
      {
        id: "11",
        text: "성능 테스트 및 최적화",
        completed: false,
        targetDate: getDateByOffset(5),
      },
      // 일요일 (진행중)
      {
        id: "12",
        text: "주간 리포트 작성 및 다음 주 계획",
        completed: false,
        targetDate: getDateByOffset(6),
      },
    ]

    return generateReportByTemplate(templateId, sampleTodos, lastMonday, lastSunday)
  }

  return (
    <AppShell>
      <div className="w-full space-y-8 px-4 md:px-0">
        {/* Header with Upload Button */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-balance text-3xl font-bold text-gray-900">{t.templates}</h1>
            <p className="text-pretty text-gray-600">{t.templatesLibrary}</p>
          </div>
          <div className="relative">
            <Button
              onClick={handleUploadClick}
              className="hidden bg-[#5D7AA5] text-white hover:bg-[#4d6a95] md:flex"
              aria-label={t.uploadTemplate}
            >
              <Plus className="mr-2 h-5 w-5" />
              {t.uploadTemplate}
            </Button>
            <span className="absolute -right-2 -top-2 hidden rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white md:block">
              준비중
            </span>
          </div>
        </div>

        {/* General Templates Section */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">{t.generalTemplates}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {generalTemplates.map((template) => (
              <Card
                key={template.id}
                className="group relative flex flex-col border-gray-200 bg-white shadow-lg transition-all hover:shadow-xl hover:shadow-gray-200/60"
              >
                <CardHeader className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-3">
                    {/* Template Icon */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#5D7AA5] text-3xl shadow-md shadow-[#5D7AA5]/20">
                      {template.icon}
                    </div>
                    <Badge variant="outline" className="shrink-0 border-[#5D7AA5] text-[#5D7AA5]">
                      {t.builtIn || "내장"}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {language === "ko" ? template.name : template.nameEn}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {language === "ko" ? template.description : template.descriptionEn}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(template.id)}
                    className="w-full rounded-xl border-gray-200 bg-white font-medium text-gray-700 shadow-sm transition-all hover:border-[#5D7AA5] hover:bg-[#5D7AA5] hover:text-white"
                    aria-label={`${language === "ko" ? template.name : template.nameEn} 미리보기`}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t.preview || "미리보기"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team-Specific Templates Section */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">{t.teamTemplates}</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teamTemplates.map((template) => (
              <Card
                key={template.id}
                className="group relative flex flex-col border-gray-200 bg-white shadow-lg transition-all hover:shadow-xl hover:shadow-gray-200/60"
              >
                <CardHeader className="flex-1 p-6">
                  <div className="flex items-start justify-between gap-3">
                    {/* Template Icon */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-3xl shadow-md shadow-purple-500/30">
                      {template.icon}
                    </div>
                    <Badge variant="outline" className="shrink-0 border-purple-500 text-purple-600">
                      {t.teamSpecific || "팀 전용"}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {language === "ko" ? template.name : template.nameEn}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {language === "ko" ? template.description : template.descriptionEn}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(template.id)}
                    className="w-full rounded-xl border-gray-200 bg-white font-medium text-gray-700 shadow-sm transition-all hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white"
                    aria-label={`${language === "ko" ? template.name : template.nameEn} 미리보기`}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {t.preview || "미리보기"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Mobile FAB for Upload */}
        <div className="fixed bottom-20 right-4 z-40 md:hidden">
          <button
            onClick={handleUploadClick}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5D7AA5] text-white shadow-lg transition-colors hover:bg-[#4A6285]"
            aria-label={t.uploadTemplate}
          >
            <Plus className="h-6 w-6" />
          </button>
          <span className="absolute -right-1 -top-1 rounded-full bg-amber-500 px-1 py-0.5 text-[8px] font-bold text-white">
            준비중
          </span>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {t.templatePreview}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate && (
                <>
                  {language === "ko" ? TEMPLATE_CATALOG[selectedTemplate].name : TEMPLATE_CATALOG[selectedTemplate].nameEn}
                  {" - "}
                  {language === "ko"
                    ? TEMPLATE_CATALOG[selectedTemplate].description
                    : TEMPLATE_CATALOG[selectedTemplate].descriptionEn}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6">
            <div className="py-4">
              <div className="mb-3 flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2">
                <span className="text-sm font-medium text-amber-800">샘플 데이터로 생성된 미리보기</span>
                <Badge variant="outline" className="border-amber-600 text-amber-700">
                  Preview
                </Badge>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
                {selectedTemplate && <MarkdownPreview content={getSamplePreview(selectedTemplate)} />}
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button onClick={() => setPreviewOpen(false)} className="bg-[#5D7AA5] hover:bg-[#4d6a95]">
              {t.closePreview}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
