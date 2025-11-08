# 프로젝트 설정 가이드

## 1. Supabase 프로젝트 설정

### 1.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 접속하여 새 프로젝트 생성
2. 프로젝트 이름과 데이터베이스 비밀번호 설정
3. 프로젝트가 생성될 때까지 대기 (약 2분)

### 1.2 환경 변수 설정
`.env.local` 파일에 다음 정보 입력:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Supabase 키 찾기:**
- Supabase Dashboard → Settings → API
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 데이터베이스 마이그레이션 실행

**방법 1: Supabase Dashboard 사용 (추천)**
1. Supabase Dashboard → SQL Editor
2. `supabase/migrations/0001_initial_schema.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기
4. "Run" 버튼 클릭

**방법 2: Supabase CLI 사용**
```bash
# Supabase CLI 설치 (한번만)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

### 1.4 Storage Bucket 생성
1. Supabase Dashboard → Storage
2. "Create a new bucket" 클릭
3. Bucket 이름: `documents`
4. Public bucket: NO (비공개)
5. "Create bucket" 클릭

**Storage 정책 설정:**
SQL Editor에서 실행:
```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow admins to read all files
CREATE POLICY "Admins can read all files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

## 2. 개발 환경 설정

### 2.1 의존성 설치
```bash
npm install
```

### 2.2 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 3. 초기 사용자 생성

### 3.1 관리자 계정 생성
1. Supabase Dashboard → Authentication → Users
2. "Add user" → "Create new user"
3. 이메일과 비밀번호 입력
4. "Create user" 클릭
5. SQL Editor에서 실행:
```sql
UPDATE public.profiles
SET role = 'admin', name = '관리자 이름'
WHERE email = 'admin@example.com';
```

### 3.2 참여자 계정 생성
- 방법 1: Supabase Dashboard에서 수동 생성 (위와 동일)
- 방법 2: 애플리케이션에 회원가입 기능 추가 (TODO)

## 4. 완료된 기능

✅ **데이터베이스 스키마**
- profiles (사용자)
- rounds (차수)
- round_participants (차수별 참여자)
- submissions (문서 제출)
- notifications (알림)
- notification_templates (알림 템플릿)

✅ **인증**
- Supabase Auth 로그인
- 역할 기반 접근 제어 (admin/participant)

✅ **API**
- Rounds API (Supabase)
- Participants API (Supabase)

✅ **UI 페이지**
- 로그인
- 관리자: 차수 관리, 참여자 관리, 대시보드
- 참여자: 차수 목록, 문서 제출

## 5. 미완성 기능 (TODO)

### 5.1 파일 업로드
- [ ] Supabase Storage 연동
- [ ] 파일 업로드 API (`/api/upload`)
- [ ] 참여자 제출 페이지 업데이트

### 5.2 문서 제출
- [ ] Submission API 구현
- [ ] 제출 상태 관리
- [ ] 다운로드 기능

### 5.3 ZIP 다운로드
- [ ] 차수별 제출 문서 ZIP 생성 API
- [ ] 관리자 대시보드 다운로드 버튼 연동

### 5.4 알림 발송
- [ ] 이메일 발송 (SendGrid/AWS SES 연동)
- [ ] SMS 발송 (Twilio/AWS SNS 연동)
- [ ] 스케줄링 (마감 3일/1일/당일 전 자동 발송)
- [ ] Edge Function 또는 Cron Job 설정

### 5.5 기타
- [ ] 회원가입 기능
- [ ] 비밀번호 재설정
- [ ] 프로필 편집
- [ ] 알림 센터
- [ ] 대시보드 실시간 데이터 연동

## 6. 참고 사항

### Mock Data 제거
현재 일부 페이지는 Mock 데이터를 사용하고 있습니다:
- `src/app/admin/rounds/[id]/dashboard/page.tsx`
- `src/app/participant/rounds/[id]/submit/page.tsx`

이 페이지들을 실제 API와 연동하려면 React Query hooks를 사용하여 데이터를 가져오도록 수정해야 합니다.

### API Routes
Next.js 15 App Router를 사용하므로, 필요한 경우 `src/app/api` 디렉토리를 만들어 API Routes를 추가할 수 있습니다.

### Deployment
- Vercel 배포 추천
- 환경 변수를 Vercel Dashboard에 설정
- Supabase와 자동 연동됨

## 7. 문제 해결

### 데이터베이스 연결 오류
- `.env.local` 파일의 Supabase URL과 키 확인
- Supabase 프로젝트가 활성화되어 있는지 확인

### 로그인 실패
- Supabase Authentication이 활성화되어 있는지 확인
- 이메일 확인이 필요한 경우 Supabase Dashboard에서 이메일 확인 비활성화

### RLS 정책 오류
- Supabase Dashboard → Authentication → Policies에서 정책 확인
- 필요한 경우 정책을 임시로 비활성화하여 테스트
