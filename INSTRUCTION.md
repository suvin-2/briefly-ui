# Sprint 1: Frontend Structure Analysis & Refactoring

## 🎯 목표
현재 프로젝트의 구조를 먼저 정밀 분석한 뒤, 유지보수가 용이한 구조로 리팩토링하고 CRUD 기능을 구현한다.

## 🛠️ 기술 스택 및 환경
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS
- Language: TypeScript
- State Management: React useState (Local)
- i18n: Custom Dictionary (`lib/i18n.ts`)

---

## 📋 진행 단계 (Step-by-Step)

### Step 0: 프로젝트 구조 분석 (Structure Analysis) [최우선]
**목표:** 코드 수정을 시작하기 전에 현재 파일 구조와 코드 패턴을 파악한다.

1. **파일 탐색:** `app`, `components`, `lib` 폴더를 스캔하여 컴포넌트 의존 관계를 파악한다.
2. **패턴 확인:**
   - 타입(`interface`) 정의가 어디에 위치해 있는지 (`page.tsx` 내부인지, 별도 파일인지) 확인한다.
   - 더미 데이터(초기값)가 하드코딩 되어 있는지 확인한다.
   - 다국어(`i18n`) 처리가 컴포넌트 내부에 잘 적용되어 있는지, 아니면 하드코딩된 텍스트가 남아있는지 진단한다.
3. **보고:** 위 분석 내용을 바탕으로 **"어떤 파일을 어떻게 리팩토링할지"** 요약해서 나에게 먼저 보고한다. (승인 후 Step 1 진행)

### Step 1: 타입 중앙화 (Type Centralization)
**목표:** 분석 결과에 따라 흩어진 타입들을 한곳으로 모은다.

1. `types/index.ts` 파일을 생성한다.
2. `Todo` 인터페이스 및 관련 타입들을 이곳으로 이동시킨다.
3. `app/page.tsx`와 `components/todo-item.tsx` 등에서 이 타입을 import 하여 사용하도록 수정한다.

### Step 2: 더미 데이터 분리 (Mock Data Separation)
**목표:** 컴포넌트 내부에 하드코딩된 데이터를 별도 파일로 분리한다.

1. `data/mock-todos.ts` 파일을 생성한다.
2. `MOCK_TODOS` 상수를 정의하고 초기 데이터를 이곳으로 옮긴다.
3. `page.tsx`에서 `useState` 초기값으로 이 데이터를 불러오도록 연결한다.

### Step 3: 컴포넌트 순수화 및 i18n 적용
**목표:** 컴포넌트를 UI 렌더링 전용으로 만들고 다국어를 적용한다.

1. `components/todo-item.tsx` 등을 리팩토링한다.
2. **Props 정의:** 이벤트 핸들러(`onToggle` 등)를 Props로 명확히 받는다.
3. **i18n 적용:** 하드코딩된 텍스트가 있다면 `lib/i18n.ts`를 참조하도록 변경한다.

### Step 4: 메인 로직 구현
**목표:** `page.tsx`에서 CRUD 핸들러 함수를 완성한다.

1. `handleAdd`, `handleToggle`, `handleDelete`, `handleUpdate` 함수를 구현한다.
2. 각 컴포넌트에 핸들러를 올바르게 전달하여 기능이 동작하도록 만든다.