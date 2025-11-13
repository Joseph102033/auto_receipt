# 파일 업로드 문제 해결 로그

## 📋 현재 상황

**문제:** 사용자가 파일을 첨부하고 저장하려고 할 때 실패
**에러:** `파일 업로드 실패: new row violates row-level security policy`

## 🔍 원인 분석

1. **Supabase Storage 버킷은 생성됨** ✅
   - 버킷 이름: `documents`
   - 위치: https://zputggbcwulksuxsbrvy.supabase.co

2. **문제:** Row Level Security (RLS) 정책이 제대로 작동하지 않음
   - 인증된 사용자가 파일 업로드를 시도하지만 정책이 차단

## 🛠️ 해결 방법

### 방법 1: Supabase Dashboard에서 정책 완전 재설정

1. **Supabase Dashboard 접속**
   ```
   https://supabase.com/dashboard/project/zputggbcwulksuxsbrvy/sql/new
   ```

2. **아래 SQL 실행**
   ```sql
   -- 모든 storage.objects 정책 삭제
   DO $$
   DECLARE
       r RECORD;
   BEGIN
       FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects')
       LOOP
           EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
       END LOOP;
   END $$;

   -- documents 버킷에 대한 완전 공개 정책 생성
   CREATE POLICY "Public Access to documents"
   ON storage.objects
   FOR ALL
   USING (bucket_id = 'documents')
   WITH CHECK (bucket_id = 'documents');
   ```

3. **버킷 설정 확인**
   - Storage > documents 버킷 > Configuration
   - **Public bucket**: ✅ 반드시 체크

4. **테스트**
   - 브라우저 완전 종료 후 재시작
   - 로그아웃 후 다시 로그인
   - 파일 첨부 시도

### 방법 2: 버킷을 UI에서 완전 공개로 설정

1. **Storage 페이지 접속**
   ```
   https://supabase.com/dashboard/project/zputggbcwulksuxsbrvy/storage/buckets
   ```

2. **documents 버킷 클릭**

3. **Policies 탭**
   - "New Policy" 클릭
   - "Full customization" 선택
   - 설정:
     ```
     Policy name: Allow all operations
     Target roles: public (또는 authenticated)
     Policy command: All
     USING expression: bucket_id = 'documents'
     WITH CHECK expression: bucket_id = 'documents'
     ```

### 방법 3: 서비스 역할 키로 임시 우회 (권장하지 않음)

만약 위 방법들이 모두 실패하면, 서버 사이드에서 업로드하도록 변경 필요.

## 📝 변경된 파일 목록

1. **supabase/migrations/0006_create_storage_bucket.sql**
   - Storage 버킷 및 정책 생성

2. **src/features/submissions/api.ts**
   - uploadFile 함수에 로깅 추가
   - 더 자세한 에러 정보 출력

3. **src/app/participant/rounds/[id]/submit/page.tsx**
   - "해당 없음"일 때 금액 필드 제외하도록 수정
   - 제출 데이터 로깅 추가

## 🔎 디버깅 체크리스트

파일 첨부 시도 시 브라우저 Console (F12)에서 확인할 것:

- [ ] `Upload - Current user:` - 사용자 ID가 null이 아닌지
- [ ] `Upload - Participant ID:` - 참가자 ID가 있는지
- [ ] `Upload - Attempting to upload:` - 파일 경로 확인
- [ ] `Upload error details:` - 정확한 에러 메시지
- [ ] `Submitting document:` - 제출 데이터 확인
- [ ] `Final submission data:` - 최종 데이터에 amountTransport, amountAccommodation 포함되는지

## ⚠️ 주의사항

1. **로그인 토큰 갱신 필수**
   - 정책 변경 후 반드시 로그아웃 → 재로그인

2. **브라우저 캐시 완전 삭제**
   - Ctrl + Shift + Delete
   - "캐시된 이미지 및 파일" 삭제

3. **Network 탭에서 Disable cache 체크**
   - F12 > Network 탭 > "Disable cache" ✅

## 🎯 최종 목표

- [x] 로컬 Supabase에 버킷 생성 완료
- [x] 원격 Supabase에 버킷 생성 완료
- [ ] 원격 Supabase RLS 정책 수정 필요 ⬅️ **여기서 막힘**
- [ ] 파일 업로드 테스트 성공

## 📞 다음 작업 시 확인 사항

1. Supabase Dashboard > Storage > documents > Policies 스크린샷
2. 정책이 몇 개 있는지, 이름이 무엇인지
3. 정책의 USING/WITH CHECK 조건 확인
4. 버킷이 Public으로 설정되어 있는지

## 🔗 참고 링크

- Supabase Storage 문서: https://supabase.com/docs/guides/storage
- RLS 정책 가이드: https://supabase.com/docs/guides/auth/row-level-security
- Storage 정책 예제: https://supabase.com/docs/guides/storage/security/access-control
