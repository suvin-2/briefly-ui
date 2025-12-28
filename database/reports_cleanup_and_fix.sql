-- ========================================
-- Reports 테이블 정리 및 수정
-- ========================================
-- 이 스크립트는 잘못 추가된 컬럼을 제거하고 올바른 스키마로 복원합니다.

-- 1. 현재 스키마 확인
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '현재 reports 테이블 컬럼 확인';
  RAISE NOTICE '========================================';
END $$;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- 2. 잘못 추가된 컬럼 제거 (있다면)
DO $$
BEGIN
  -- start_date 컬럼 제거
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE reports DROP COLUMN start_date;
    RAISE NOTICE '❌ start_date 컬럼 제거됨';
  END IF;

  -- end_date 컬럼 제거
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE reports DROP COLUMN end_date;
    RAISE NOTICE '❌ end_date 컬럼 제거됨';
  END IF;
END $$;

-- 3. 원본 컬럼 확인 및 복원 (없다면)
DO $$
BEGIN
  -- period_start 컬럼 확인 및 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'period_start'
  ) THEN
    ALTER TABLE reports ADD COLUMN period_start DATE NOT NULL DEFAULT CURRENT_DATE;
    RAISE NOTICE '✅ period_start 컬럼 추가됨';
  ELSE
    RAISE NOTICE 'ℹ️  period_start 컬럼 이미 존재';
  END IF;

  -- period_end 컬럼 확인 및 추가
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'period_end'
  ) THEN
    ALTER TABLE reports ADD COLUMN period_end DATE NOT NULL DEFAULT CURRENT_DATE;
    RAISE NOTICE '✅ period_end 컬럼 추가됨';
  ELSE
    RAISE NOTICE 'ℹ️  period_end 컬럼 이미 존재';
  END IF;
END $$;

-- 4. title 컬럼 추가 (없다면)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'title'
  ) THEN
    ALTER TABLE reports ADD COLUMN title TEXT DEFAULT 'Weekly Report';
    RAISE NOTICE '✅ title 컬럼 추가됨';
  ELSE
    RAISE NOTICE 'ℹ️  title 컬럼 이미 존재';
  END IF;
END $$;

-- 5. 기존 레코드 정리 (필요 시)
-- 만약 기존에 잘못된 데이터가 있다면 삭제하거나 수정
-- UPDATE reports SET title = 'Weekly Report' WHERE title IS NULL;

-- 6. DEFAULT 제거 (향후 입력 시 필수로 만들기)
DO $$
BEGIN
  -- period_start, period_end는 NOT NULL 유지, DEFAULT만 제거
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports'
    AND column_name = 'period_start'
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE reports ALTER COLUMN period_start DROP DEFAULT;
    RAISE NOTICE '🔧 period_start DEFAULT 제거됨';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports'
    AND column_name = 'period_end'
    AND column_default IS NOT NULL
  ) THEN
    ALTER TABLE reports ALTER COLUMN period_end DROP DEFAULT;
    RAISE NOTICE '🔧 period_end DEFAULT 제거됨';
  END IF;
END $$;

-- 7. 인덱스 확인 및 생성
CREATE INDEX IF NOT EXISTS idx_reports_user_created
ON reports(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_user_period
ON reports(user_id, period_start, period_end);

-- 8. 최종 스키마 확인
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '최종 reports 테이블 스키마';
  RAISE NOTICE '========================================';
END $$;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'reports'
ORDER BY ordinal_position;

-- 9. 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Reports 테이블 수정 완료!';
  RAISE NOTICE '- 잘못된 컬럼(start_date, end_date) 제거됨';
  RAISE NOTICE '- 올바른 컬럼(period_start, period_end) 확인됨';
  RAISE NOTICE '- title 컬럼 추가됨';
  RAISE NOTICE '- 인덱스 생성됨';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  주의: 기존 데이터가 있다면 수동으로 확인 필요';
  RAISE NOTICE '다음 쿼리로 확인:';
  RAISE NOTICE 'SELECT * FROM reports LIMIT 5;';
  RAISE NOTICE '========================================';
END $$;
