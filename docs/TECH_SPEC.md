# Technical Specification & UX Rules: Briefly

## 1. 프론트엔드 아키텍처
- **State Management:**
  - Global: `LanguageContext` (i18n)
  - Local Page: `useState`를 이용해 `selectedDate`, `todos` 관리.
  - **날짜 선택 로직:** `selectedDate` 변경 시 전체 데이터를 메모리에 두고 뷰(View)에서만 필터링하여 보여주는 방식 사용.

## 2. 상세 UX/UI 동작 시나리오 (Interaction Details)

### A. 초기 진입 (Initialization)
1. 앱 로드 시 `new Date()`를 호출하여 **오늘 날짜**를 즉시 계산한다.
2. `WeeklyDateStrip` 컴포넌트는 오늘이 포함된 주(Week)를 계산하여 렌더링한다.
3. '오늘'에 해당하는 날짜 탭은 자동으로 `active` 스타일이 적용된다.

### B. 날짜 변경 및 데이터 조회
1. **Optimistic UI:** 날짜 클릭 시 로딩 없이 즉시 해당 날짜의 리스트로 전환된다.
2. **Empty State:** 해당 날짜에 데이터가 없으면 "할 일이 없습니다" 같은 안내 UI를 노출한다.

### C. 투두 입력 (Input Experience)
1. 입력 후 엔터를 쳐도 `input` 포커스는 유지되어야 한다 (연속 입력).
2. 공백(`trim()`) 입력 시 추가되지 않도록 방어 로직을 넣는다.

### D. 리포트 생성 및 다운로드 로직 (Report Logic) [중요]
**목표:** 템플릿 파일 유무와 관계없이 사용자는 항상 리포트를 가져갈 수 있어야 한다.

1. **상태 분기 (Conditional Rendering):**
   - **Case 1 (커스텀 템플릿 있음):** 원본 파일 형식(.xlsx 등)으로 다운로드 기능 제공.
   - **Case 2 (템플릿 없음/삭제됨):** 버튼을 `Disabled` 처리하지 **말고**, **"텍스트로 다운로드(.md)"** 기능이 활성화되어야 한다.
   
2. **구현 상세:**
   - `ReportCard` 컴포넌트 내부에서 `templateDeleted` props가 `true`일 경우, 버튼 텍스트를 "Download Text"로 변경하고 클릭 시 텍스트 파일 생성 로직을 실행한다.
   - (현재 코드는 비활성화되어 있으므로 이 로직을 우선적으로 수정해야 함).

## 3. 데이터 스키마 (TypeScript Interfaces)
```typescript
interface Todo {
  id: string;
  text: string;
  completed: boolean;
  targetDate: Date;
  memo?: string;
}

interface Report {
  id: string;
  content: string; // 마크다운 텍스트
  period: { start: Date, end: Date };
  templateType: 'custom' | 'basic'; // 기본 양식인지 구분
}