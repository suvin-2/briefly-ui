# Backend Specification: Supabase Integration

## 1. 개요 (Overview)
이 프로젝트는 **Supabase**를 BaaS(Backend-as-a-Service)로 사용하여 데이터베이스, 인증, 실시간 통신을 처리한다.
프론트엔드에서 Supabase Client SDK(`@supabase/supabase-js`)를 통해 직접 DB와 통신하는 방식을 사용한다.

## 2. 데이터베이스 스키마 (Database Schema)

### Table: `todos`
사용자의 할 일 데이터를 저장하는 핵심 테이블.

| Column Name | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary Key |
| `user_id` | `uuid` | `auth.uid()` | Foreign Key (Supabase Auth Users) |
| `content` | `text` | - | 할 일 내용 (Not Null) |
| `completed` | `boolean` | `false` | 완료 여부 |
| `target_date` | `date` | `now()` | 해당 할 일의 수행 날짜 |
| `memo` | `text` | `null` | 상세 메모 |
| `created_at` | `timestamptz` | `now()` | 생성일 (정렬 기준) |

### Table: `reports` (Optional for MVP)
생성된 주간 리포트 저장용.

| Column Name | Type | Default | Description |
|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | Primary Key |
| `user_id` | `uuid` | `auth.uid()` | Foreign Key |
| `period_start` | `date` | - | 리포트 시작일 |
| `period_end` | `date` | - | 리포트 종료일 |
| `summary` | `text` | - | AI 요약 내용 (Markdown) |
| `created_at` | `timestamptz` | `now()` | 생성일 |

## 3. 보안 정책 (RLS - Row Level Security)
Supabase는 클라이언트에서 직접 DB에 접근하므로 **RLS 설정이 필수**적이다.
모든 테이블은 다음 정책을 따라야 한다:

1.  **Enable RLS:** 모든 테이블에 RLS를 활성화한다.
2.  **Select/Insert/Update/Delete:** `auth.uid() = user_id` 조건이 참인 경우에만 허용한다.
    (즉, 사용자는 본인이 작성한 데이터만 보고 수정할 수 있다.)

## 4. 클라이언트 구현 가이드 (Implementation)

### A. 환경 변수 설정
`.env.local` 파일에 다음 키가 있어야 한다.
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### B. Supabase Client Setup
- `lib/supabase.ts` 파일을 생성하여 클라이언트를 초기화한다.
- 인증 세션 관리를 위해 Next.js SSR 환경을 고려한 방식(또는 간단한 CSR 방식)을 선택한다.

### C. 데이터 서비스 레이어 (Service Layer)
컴포넌트에서 직접 `supabase.from('todos')`를 호출하지 말고, **Service 함수**로 분리한다.

- 파일 위치: `services/todo.service.ts`
- 필수 함수:
  - `getTodosByDate(date: Date)`
  - `createTodo(todo: Omit<Todo, 'id'>)`
  - `updateTodo(id: string, updates: Partial<Todo>)`
  - `deleteTodo(id: string)`
  - `toggleTodo(id: string)`

## 5. 인증 (Authentication) [MVP Strategy]
- 빠르고 간편한 테스트를 위해 **이메일 로그인** 또는 **소셜 로그인(Google)** 중 가장 설정이 간단한 것을 우선 구현한다.
- `app/login/page.tsx`에서 Supabase Auth를 연결한다.