# 📄 마크다운 템플릿 시스템 가이드

## 개요

Briefly는 이제 **5가지 마크다운 템플릿**을 제공하여 사용자가 다양한 형식의 리포트를 생성할 수 있습니다.

---

## 🎨 제공되는 템플릿

### 1. 📄 기본형 (Basic)
**용도**: 날짜별로 완료된 할 일을 정리
**특징**:
- 날짜별 완료 작업 그룹화
- 요약 통계 (전체/완료/진행중/달성률)
- 이슈 & 인사이트 섹션 (메모가 있는 항목)
- 다음 주 계획 섹션

**적합한 사용자**: 일반 사용자, 기본적인 주간 보고가 필요한 경우

---

### 2. 📋 상세형 (Detailed)
**용도**: 메모와 이슈를 포함한 상세 리포트
**특징**:
- 메모가 있는 작업은 상세하게 확장 표시
- 테이블 형식의 현황 요약
- 각 작업에 날짜 + 상태 명시
- 종합 의견 섹션

**적합한 사용자**: 상세한 업무 내용을 공유해야 하는 관리자, PM

---

### 3. ⚡ 요약형 (Summary)
**용도**: 핵심 성과만 간결하게 요약
**특징**:
- 최소한의 정보만 포함
- 완료된 작업 중 최근 5개만 표시
- 간결한 핵심 지표
- 빠른 리뷰용

**적합한 사용자**: 임원진 보고, 빠른 스탠드업 미팅용

---

### 4. 💻 개발팀용 (Dev Team)
**용도**: 이슈 트래킹과 기술 블로커 중심
**특징**:
- Sprint Overview 테이블
- 이슈 & 블로커를 **이슈 카드 형식**으로 표시
- Resolved/Active 상태 구분
- Technical Notes 섹션

**적합한 사용자**: 개발팀, 스프린트 리뷰, 애자일 팀

---

### 5. 📊 영업팀용 (Sales Team)
**용도**: 완료율과 성과 지표 중심
**특징**:
- 성과 등급 자동 계산 (우수/양호/보통/미흡)
- 날짜별 영업 활동 상세 기록
- 이슈 및 특이사항 섹션
- 다음 주 목표를 테이블 형식으로 정리

**적합한 사용자**: 영업팀, 세일즈 매니저

---

## 🛠️ 기술 구현

### 파일 구조

```
lib/
  report-templates.ts          # 템플릿 카탈로그 및 생성 함수
  i18n.ts                       # 템플릿 이름 다국어 지원

services/
  report.service.ts             # 템플릿 타입을 받아 리포트 생성

components/
  generate-report-dialog.tsx    # RadioGroup으로 템플릿 선택 UI
```

### 템플릿 타입 정의

```typescript
export type TemplateType = "basic" | "detailed" | "summary" | "dev-team" | "sales-team"

export interface TemplateInfo {
  id: TemplateType
  name: string              // 한글 이름
  nameEn: string            // 영문 이름
  description: string       // 한글 설명
  descriptionEn: string     // 영문 설명
  icon: string              // 이모지 아이콘
  category: "general" | "team-specific"
}
```

### 사용 방법

#### 1. 템플릿으로 리포트 생성

```typescript
import { generateReportByTemplate } from "@/lib/report-templates"

const markdown = generateReportByTemplate(
  "dev-team",      // 템플릿 타입
  todos,           // Todo 목록
  startDate,       // 시작 날짜
  endDate          // 종료 날짜
)
```

#### 2. 새 템플릿 추가하기

`lib/report-templates.ts`에서:

1. `TemplateType`에 새 타입 추가
2. `TEMPLATE_CATALOG`에 템플릿 정보 등록
3. `generateXxxTemplate()` 함수 작성
4. `generateReportByTemplate()` switch문에 케이스 추가

```typescript
export type TemplateType = "basic" | "detailed" | "summary" | "dev-team" | "sales-team" | "my-new-template"

export const TEMPLATE_CATALOG: Record<TemplateType, TemplateInfo> = {
  // ...
  "my-new-template": {
    id: "my-new-template",
    name: "내 템플릿",
    nameEn: "My Template",
    description: "설명",
    descriptionEn: "Description",
    icon: "🎯",
    category: "general",
  },
}

export function generateMyNewTemplate(todos: Todo[], startDate: Date, endDate: Date): string {
  // 마크다운 생성 로직
  return markdown
}

export function generateReportByTemplate(...) {
  switch (templateType) {
    // ...
    case "my-new-template":
      return generateMyNewTemplate(todos, startDate, endDate)
  }
}
```

---

## 🎨 UI/UX

### 템플릿 선택 화면

- **RadioGroup 방식**: 각 템플릿을 카드 형태로 표시
- **2개 섹션**: 일반 템플릿 / 팀별 템플릿
- **선택 시 하이라이트**: 선택된 템플릿은 파란색 테두리 + 배경
- **아이콘 + 이름 + 설명**: 한눈에 템플릿 특징 파악
- **다국어 지원**: 한글/영어 자동 전환

### 예시 화면

```
┌────────────────────────────────────────┐
│  일반 템플릿                            │
│                                         │
│  ○ 📄 기본형                            │
│     날짜별 완료된 할 일을 정리합니다     │
│                                         │
│  ● 📋 상세형 (선택됨)                   │
│     메모와 이슈를 포함한 상세 리포트     │
│                                         │
│  팀별 템플릿                            │
│                                         │
│  ○ 💻 개발팀용                          │
│     이슈 트래킹과 기술 블로커 중심       │
└────────────────────────────────────────┘
```

---

## 📊 향후 확장 계획

### Phase 1 (완료) ✅
- [x] 5가지 마크다운 템플릿 구현
- [x] RadioGroup UI 적용
- [x] 다국어 지원

### Phase 2 (다음 단계)
- [ ] 템플릿 미리보기 기능
- [ ] 사용자 커스텀 템플릿 저장
- [ ] 템플릿별 사용 통계

### Phase 3 (장기)
- [ ] 엑셀/워드 템플릿 업로드
- [ ] AI 자동 레이아웃 매핑
- [ ] 템플릿 마켓플레이스

---

## 💡 팁

1. **템플릿 선택 기준**:
   - 일반 사용자 → 기본형
   - 상세 리포트 필요 → 상세형
   - 빠른 요약 → 요약형
   - 개발 스프린트 → 개발팀용
   - 영업 실적 → 영업팀용

2. **메모 활용**:
   - 상세형/개발팀용 템플릿은 메모가 핵심!
   - Todo 작성 시 메모를 적극 활용하면 더 풍부한 리포트 생성

3. **다운로드 형식**:
   - 모든 템플릿은 `.md` (Markdown) 파일로 다운로드 가능
   - PDF로도 변환 가능 (기존 기능 유지)

---

## 🐛 트러블슈팅

### Q1. 템플릿이 선택되지 않아요
**A**: 브라우저 캐시를 지우고 다시 로드해보세요.

### Q2. 새 템플릿을 추가했는데 UI에 안 나와요
**A**: `lib/i18n.ts`에 번역 키를 추가했는지 확인하세요.

### Q3. 리포트 내용이 비어있어요
**A**: 선택한 날짜 범위에 Todo가 있는지 확인하세요.

---

## 📝 라이센스

이 템플릿 시스템은 Briefly 프로젝트의 일부입니다.
