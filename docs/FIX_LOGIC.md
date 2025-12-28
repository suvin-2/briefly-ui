# Hotfix Specification: Date Logic & UX Improvements

## 1. 개요
현재 백엔드 연동은 성공했으나, 프론트엔드에서 **날짜별 데이터 조회**가 안 되고 **오늘 날짜 선택**이 안 되는 치명적인 UX 이슈를 해결한다.

## 2. 수정 대상 및 요구사항

### A. 날짜 선택 및 초기화 (`WeeklyDateStrip` + `HomePage`)
1.  **State Lifting (상태 끌어올리기):**
    - 현재 `WeeklyDateStrip` 내부에 갇혀 있는 날짜 상태를 `app/page.tsx`로 끌어올려야 한다.
    - `page.tsx`에서 `selectedDate` 상태를 관리하고, 이를 `WeeklyDateStrip`에 Props로 내려준다.
2.  **초기값 (Default Value):**
    - `page.tsx` 로드 시, `selectedDate`는 무조건 **시스템의 오늘 날짜(Today)**로 초기화되어야 한다.
    - `WeeklyDateStrip`은 전달받은 `selectedDate`가 포함된 주(Week)를 자동으로 계산해서 렌더링해야 한다.

### B. 날짜별 데이터 조회 (Data Filtering)
1.  **Effect Hook:**
    - `selectedDate`가 변경될 때마다 `todoService.getTodosByDate(selectedDate)`를 호출하여 데이터를 새로 가져와야 한다.
    - (기존에는 `getAllTodos`를 호출하거나 더미 데이터를 쓰고 있어서 필터링이 안 되는 상태임)
2.  **UI 반영:**
    - 날짜를 클릭하면 -> `selectedDate` 변경 -> 데이터 Fetch -> 리스트 갱신 과정이 즉시 이루어져야 한다.

### C. 삭제 안전장치 (Delete Confirmation)
1.  **컨펌 창:**
    - 투두 삭제 버튼 클릭 시, 브라우저 기본 `confirm("정말 삭제하시겠습니까?")` 또는 Shadcn UI `AlertDialog`를 띄워야 한다.
    - 사용자가 '확인'을 눌렀을 때만 `todoService.deleteTodo`가 실행되어야 한다.

## 3. 작업 파일
- `app/page.tsx`: 상태 관리 및 데이터 Fetching 로직 수정.
- `components/weekly-date-strip.tsx`: Props 인터페이스 수정 (`selectedDate`, `onSelectDate` 추가).
- `services/todo.service.ts`: (필요 시) 날짜 쿼리 로직 점검.