# 배포 가이드

## 📋 배포 전 준비사항

### 1. Supabase 프로젝트 설정

#### 1.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `kosha-easy` (또는 원하는 이름)
   - Database Password: 안전한 비밀번호 생성 및 저장
   - Region: `Northeast Asia (Seoul)` 선택
4. "Create new project" 클릭 (약 2분 소요)

#### 1.2 데이터베이스 마이그레이션 실행
프로젝트가 생성되면:

1. Supabase Dashboard → SQL Editor 이동
2. `supabase/migrations/0001_initial_schema.sql` 파일 내용을 복사하여 실행
3. `supabase/migrations/0002_add_amount_fields.sql` 파일 내용을 복사하여 실행

또는 Supabase CLI 사용:
```bash
# Supabase CLI 설치 (아직 안했다면)
npm install -g supabase

# Supabase 프로젝트와 연결
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 마이그레이션 실행
supabase db push
```

#### 1.3 Storage 버킷 생성
1. Supabase Dashboard → Storage 이동
2. "Create a new bucket" 클릭
3. 버킷 정보 입력:
   - Name: `submissions`
   - Public bucket: **체크 해제** (private)
4. "Create bucket" 클릭

#### 1.4 Storage 정책 설정
Storage → `submissions` 버킷 → Policies로 이동하여 다음 정책 추가:

**업로드 정책 (INSERT):**
```sql
-- 인증된 사용자만 자신의 파일 업로드 가능
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'submissions');
```

**읽기 정책 (SELECT):**
```sql
-- 인증된 사용자만 파일 읽기 가능
CREATE POLICY "Authenticated users can read files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'submissions');
```

**삭제 정책 (DELETE):**
```sql
-- 인증된 사용자만 자신의 파일 삭제 가능
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'submissions');
```

#### 1.5 관리자 계정 생성
1. Supabase Dashboard → Authentication → Users 이동
2. "Add user" → "Create new user" 클릭
3. 관리자 계정 정보 입력:
   - Email: 관리자 이메일
   - Password: 안전한 비밀번호
   - Auto Confirm User: **체크**
4. "Create user" 클릭
5. 생성된 사용자의 UUID 복사

#### 1.6 관리자 프로필 생성
SQL Editor에서 실행:
```sql
-- 관리자 프로필 생성 (위에서 복사한 UUID 사용)
INSERT INTO profiles (id, name, email, role, status)
VALUES (
  'YOUR_USER_UUID',  -- 위에서 복사한 UUID
  '관리자',
  'admin@example.com',  -- 관리자 이메일
  'admin',
  'active'
);
```

---

### 2. 환경 변수 설정

#### 2.1 로컬 환경 변수 확인
`.env.local` 파일 확인:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 2.2 Supabase 키 가져오기
1. Supabase Dashboard → Project Settings → API
2. 다음 정보 복사:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 3. Vercel 배포

#### 3.1 Vercel 계정 준비
1. [Vercel](https://vercel.com)에 접속 (GitHub 계정으로 로그인 권장)
2. 프로젝트를 GitHub에 푸시 (아직 안했다면)

```bash
# Git 초기화 (아직 안했다면)
git init
git add .
git commit -m "Initial commit"

# GitHub 리포지토리 생성 후
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### 3.2 Vercel에 프로젝트 배포
1. Vercel Dashboard → "Add New..." → "Project" 클릭
2. GitHub 리포지토리 선택
3. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)

4. **Environment Variables** 추가:
   ```
   NEXT_PUBLIC_SUPABASE_URL = your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   ```

5. "Deploy" 클릭

#### 3.3 배포 확인
- 배포가 완료되면 Vercel이 자동으로 URL 제공
- URL 접속하여 정상 작동 확인

---

## 🔍 배포 후 확인사항

### 1. 기본 동작 테스트
- [ ] 로그인 페이지 접속 가능
- [ ] 관리자 로그인 성공
- [ ] 대시보드 정상 표시
- [ ] 참여자 페이지 접속 (로그인 없이)

### 2. 기능 테스트
- [ ] 차수 생성 가능
- [ ] 참여자 추가 가능
- [ ] 문서 제출 가능 (파일 업로드)
- [ ] 알림 발송 가능
- [ ] 대시보드 통계 정상 표시

### 3. 보안 확인
- [ ] 관리자 페이지 로그인 없이 접근 불가
- [ ] 참여자 페이지는 자유롭게 접근 가능
- [ ] 로그아웃 정상 작동

---

## 🐛 문제 해결

### Supabase 연결 오류
```
Error: Invalid Supabase URL
```
**해결방법:**
- `.env.local` 파일의 `NEXT_PUBLIC_SUPABASE_URL` 확인
- Vercel 환경 변수 재확인

### 파일 업로드 실패
```
Error: Storage API not available
```
**해결방법:**
- Supabase Storage 버킷 `submissions` 생성 확인
- Storage 정책 설정 확인

### 로그인 후 리다이렉트 실패
```
Redirect loop or 404
```
**해결방법:**
- 관리자 계정의 `role`이 `admin`으로 설정되었는지 확인
- `profiles` 테이블에 사용자 데이터 존재 확인

---

## 📱 추가 설정 (선택사항)

### 커스텀 도메인 연결
1. Vercel Dashboard → 프로젝트 → Settings → Domains
2. 원하는 도메인 입력
3. DNS 레코드 설정 (Vercel 안내에 따라)

### 이메일 알림 설정 (향후)
현재는 데이터베이스에만 알림 저장. 실제 이메일 발송을 원하면:
- SendGrid, AWS SES, Resend 등 이메일 서비스 연동 필요
- `src/features/notifications/api.ts`의 `sendNotification` 함수 수정

### SMS 알림 설정 (향후)
- Twilio, AWS SNS 등 SMS 서비스 연동
- `src/features/notifications/api.ts`의 `sendNotification` 함수 수정

---

## 🎉 배포 완료!

모든 단계를 완료했다면 시스템이 정상적으로 작동할 것입니다.

### 다음 단계
1. 실제 참여자 데이터 입력
2. 첫 차수 생성 및 테스트
3. 사용자 매뉴얼 작성
4. 피드백 수집 및 개선

문제가 발생하면 Vercel 로그와 Supabase 로그를 확인하세요!
