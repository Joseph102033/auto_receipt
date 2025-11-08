# 문서 제출 관리 시스템 (KOSHA Easy)

차수별로 변동되는 참석자의 문서를 효율적으로 수집하고 관리하는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 👨‍💼 관리자 (로그인 필요)
- ✅ 차수 생성/수정/삭제
- ✅ 참석자 선택 및 관리
- ✅ 제출 현황 대시보드 (실시간 차트, 통계)
- ✅ 알림 발송 시스템 (이메일/SMS/시스템)
- ✅ 알림 센터 (읽음/읽지않음 관리)
- 🚧 제출 문서 ZIP 다운로드

### 👤 참여자 (로그인 불필요)
- ✅ 본인 참석 차수 확인
- ✅ 문서 제출 (다중 파일 업로드)
- ✅ 금액 정보 입력 (교통비, 숙박비, 기타)
- ✅ 미해당 처리 및 사유 입력
- ✅ 제출 현황 실시간 확인
- ✅ 알림 수신

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.local` 파일 생성:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📦 배포하기

**프로덕션 배포를 위한 상세 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.**

배포 단계:
1. ✅ Supabase 프로젝트 생성 및 설정
2. ✅ 데이터베이스 마이그레이션 실행
3. ✅ Storage 버킷 생성 (`submissions`)
4. ✅ 관리자 계정 생성
5. ✅ Vercel에 배포

---

## 🔐 인증 시스템

- **관리자 페이지** (`/admin/*`, `/notifications`): 로그인 필수, admin 권한 필요
- **참여자 페이지** (`/participant/*`): 로그인 불필요, 누구나 접근 가능
- **로그인 페이지** (`/login`): 관리자 전용 로그인

Middleware를 통한 자동 라우트 보호 (`src/middleware.ts`)

---

## 🛠️ 기술 스택

### Frontend
- [Next.js 15](https://nextjs.org) - React 프레임워크 (App Router)
- [React 19](https://react.dev) - UI 라이브러리
- [TypeScript](https://www.typescriptlang.org) - 타입 안전성
- [Tailwind CSS](https://tailwindcss.com) - 유틸리티 CSS
- [Shadcn UI](https://ui.shadcn.com) - UI 컴포넌트 라이브러리
- [Radix UI](https://www.radix-ui.com) - 접근성 있는 UI 프리미티브
- [Lucide Icon](https://lucide.dev) - 아이콘
- [Recharts](https://recharts.org) - 차트 라이브러리

### Backend & Database
- [Supabase](https://supabase.com) - BaaS (Backend as a Service)
  - PostgreSQL 데이터베이스
  - 인증 (Authentication)
  - 스토리지 (File Storage)
  - 실시간 구독 (Realtime)

### State Management & Data Fetching
- [TanStack Query (React Query)](https://tanstack.com/query/latest) - 서버 상태 관리
- [React Hook Form](https://react-hook-form.com) - 폼 관리
- [Zod](https://zod.dev) - 스키마 검증

### Utilities
- [date-fns](https://date-fns.org) - 날짜 처리
- [react-use](https://github.com/streamich/react-use) - React hooks 유틸리티
- [es-toolkit](https://github.com/toss/es-toolkit) - JavaScript 유틸리티
- [TS Pattern](https://github.com/gvergnaud/ts-pattern) - 패턴 매칭

### Development Tools
- [ESLint](https://eslint.org) - 코드 린팅
- [Prettier](https://prettier.io) - 코드 포매팅

---

## 📁 프로젝트 구조

```
kosha_easy/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── admin/             # 관리자 페이지 (로그인 필요)
│   │   ├── participant/       # 참여자 페이지 (공개)
│   │   ├── login/             # 로그인 페이지
│   │   └── notifications/     # 알림 페이지
│   ├── components/            # 공통 컴포넌트
│   │   ├── layout/           # 레이아웃 컴포넌트
│   │   └── ui/               # Shadcn UI 컴포넌트
│   ├── features/             # 기능별 모듈
│   │   ├── participants/     # 참여자 관리
│   │   ├── rounds/           # 차수 관리
│   │   ├── submissions/      # 문서 제출
│   │   └── notifications/    # 알림 시스템
│   ├── lib/                  # 유틸리티 라이브러리
│   │   └── supabase/        # Supabase 클라이언트
│   └── middleware.ts         # 라우트 보호 미들웨어
├── supabase/
│   └── migrations/           # 데이터베이스 마이그레이션
├── DEPLOYMENT.md             # 배포 가이드
└── README.md                 # 이 파일
```

---

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

This project is licensed under the MIT License.

---

## 📧 문의

문제가 발생하거나 질문이 있으시면 이슈를 등록해주세요.
