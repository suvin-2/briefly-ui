-- ========================================
-- Briefly - Supabase Database Setup
-- ========================================
-- 이 파일을 Supabase SQL Editor에서 실행하세요.
-- 실행 순서: 테이블 생성 → RLS 활성화 → 정책 설정

-- ========================================
-- 1. todos 테이블 생성
-- ========================================
CREATE TABLE IF NOT EXISTS public.todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  completed boolean DEFAULT false,
  target_date date DEFAULT CURRENT_DATE,
  memo text,
  created_at timestamptz DEFAULT now()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_target_date ON public.todos(target_date);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at DESC);

-- ========================================
-- 2. reports 테이블 생성 (Optional - 향후 확장용)
-- ========================================
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_period ON public.reports(period_start, period_end);

-- ========================================
-- 3. Row Level Security (RLS) 활성화
-- ========================================
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. RLS 정책 설정 - todos 테이블
-- ========================================

-- SELECT 정책: 본인의 데이터만 조회 가능
CREATE POLICY "Users can view their own todos"
  ON public.todos
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT 정책: 본인의 user_id로만 생성 가능
CREATE POLICY "Users can insert their own todos"
  ON public.todos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE 정책: 본인의 데이터만 수정 가능
CREATE POLICY "Users can update their own todos"
  ON public.todos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE 정책: 본인의 데이터만 삭제 가능
CREATE POLICY "Users can delete their own todos"
  ON public.todos
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 5. RLS 정책 설정 - reports 테이블
-- ========================================

-- SELECT 정책
CREATE POLICY "Users can view their own reports"
  ON public.reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT 정책
CREATE POLICY "Users can insert their own reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE 정책
CREATE POLICY "Users can update their own reports"
  ON public.reports
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE 정책
CREATE POLICY "Users can delete their own reports"
  ON public.reports
  FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- 6. 완료 메시지
-- ========================================
-- 모든 테이블과 RLS 정책이 성공적으로 생성되었습니다!
-- 다음 단계: 프론트엔드에서 Supabase Client 연결
