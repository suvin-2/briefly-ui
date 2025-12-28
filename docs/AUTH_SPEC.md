# Authentication Specification: Google OAuth

## 1. 개요
Supabase Auth의 **Google Social Login**을 유일한 인증 수단으로 사용한다.
복잡한 입력 폼 없이 원클릭으로 가입 및 로그인을 처리하여 사용자 경험을 극대화한다.

## 2. 상세 기능 명세

### A. 로그인 페이지 UI (`app/login/page.tsx`)
- **디자인:**
  - 화면 중앙에 깔끔한 카드(Card) UI 배치.
  - 앱 로고와 "Briefly에 오신 것을 환영합니다" 문구.
  - **"Google로 계속하기"** 버튼 (너비 100%, 구글 G 로고 아이콘 포함).
  - 불필요한 이메일/비밀번호 입력창은 제거한다.
- **로직:**
  - 버튼 클릭 시 `supabase.auth.signInWithOAuth({ provider: 'google' })` 호출.
  - `redirectTo` 옵션을 사용하여 로그인 후 메인 페이지(`window.location.origin`)로 돌아오게 설정.

### B. 인증 상태 관리 (Auth Provider)
- **파일:** `components/auth-provider.tsx`
- **역할:**
  - 전역에서 로그인 상태(`user`, `session`)를 관리.
  - 새로고침 시에도 로그인이 풀리지 않도록 세션 유지.

### C. 접근 제어 (Middleware)
- **파일:** `middleware.ts`
- **로직:**
  - `/` (메인), `/report`, `/my-page` 등은 **로그인 필수**. (없으면 `/login` 리다이렉트)
  - `/login` 페이지는 **비로그인 전용**. (이미 로그인했으면 `/` 리다이렉트)

## 3. 마이 페이지 (`app/my-page/page.tsx`)
- **프로필 표시:** 구글 프로필 이미지(`user_metadata.avatar_url`)와 이메일 표시.
- **로그아웃:** 버튼 클릭 시 `supabase.auth.signOut()` 후 로그인 페이지로 이동.

## 4. 구현 가이드
- **UI:** `lucide-react` 대신 구글 로고 SVG를 사용하거나 텍스트로 대체 가능. 버튼은 Shadcn UI `Button`의 `outline` 변형 사용 권장.
- **Supabase:** 클라이언트는 `lib/supabase.ts` 사용.