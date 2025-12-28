-- ========================================
-- Reports 테이블에 title 컬럼 추가
-- ========================================
-- 기존 reports 테이블에 title 컬럼을 추가합니다.
-- 원본 스키마는 period_start, period_end를 사용하므로 이를 유지합니다.

-- 1. title 컬럼 추가
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'title'
  ) THEN
    ALTER TABLE reports ADD COLUMN title TEXT;
    RAISE NOTICE '✅ title 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'ℹ️  title 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 2. 기존 레코드에 기본값 설정 (NULL인 경우)
UPDATE reports
SET title = 'Weekly Report'
WHERE title IS NULL;

-- 3. 향후 레코드를 위한 기본값 설정
ALTER TABLE reports ALTER COLUMN title SET DEFAULT 'Weekly Report';

-- 4. 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Reports 테이블 업데이트 완료!';
  RAISE NOTICE '- title 컬럼 추가됨';
  RAISE NOTICE '- 기존 레코드에 기본값 설정됨';
  RAISE NOTICE '========================================';
END $$;
