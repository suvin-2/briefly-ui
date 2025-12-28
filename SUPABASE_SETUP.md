# Supabase 설정 가이드

## 🔧 필수 설정 (반드시 확인하세요!)

Google 로그인이 정상적으로 작동하려면 Supabase Dashboard에서 다음 설정을 정확히 해야 합니다.

### 1️⃣ Site URL 설정 (매우 중요!)

1. Supabase Dashboard 접속: https://app.supabase.com
2. 프로젝트 선택: `pwjbsjeimimagxvmtlph`
3. 왼쪽 메뉴에서 **Authentication** → **URL Configuration** 선택
4. **Site URL** 설정:
   - 개발 환경: `http://localhost:3000`
   - 프로덕션: `https://your-domain.com`

### 2️⃣ Redirect URLs 설정

**Redirect URLs** 섹션에 다음 URL을 추가하세요:

개발 환경:
```
http://localhost:3000/auth/callback
```

프로덕션 (배포 후):
```
https://your-domain.com/auth/callback
```

### 3️⃣ Google Provider 설정

1. **Authentication** → **Providers** 선택
2. **Google** Provider 활성화
3. Client ID와 Client Secret 입력 (Google Cloud Console에서 발급)

### ✅ 확인 체크리스트

- [ ] **Site URL**이 `http://localhost:3000`으로 정확히 설정됨
- [ ] **Redirect URLs**에 `http://localhost:3000/auth/callback` 추가됨
- [ ] **Google Provider**가 활성화됨
- [ ] **.env.local** 파일에 Supabase URL과 Anon Key가 설정됨

## 로그인 플로우

1. 사용자가 `/login` 페이지에서 "Google로 계속하기" 클릭
2. Google OAuth 인증 페이지로 리다이렉트
3. 인증 완료 후 `/auth/callback`로 리다이렉트
4. 서버에서 OAuth 코드를 세션으로 교환
5. 홈페이지(`/`)로 최종 리다이렉트
6. Middleware가 인증된 사용자를 확인하고 페이지 접근 허용

## 테스트

1. 개발 서버 실행: `npm run dev`
2. http://localhost:3000/login 접속
3. "Google로 계속하기" 버튼 클릭
4. Google 계정 선택 후 인증
5. 자동으로 홈페이지로 리다이렉트되는지 확인
6. `/my-page`에서 프로필 정보가 표시되는지 확인
