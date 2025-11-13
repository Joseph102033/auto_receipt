# T-006: 알림 UI 구현 - 완료 보고서

## 작업 개요
참여자들에게 알림을 보내고, 받은 알림을 확인할 수 있는 완전한 알림 시스템 UI를 구현했습니다.

## 완료 날짜
2025-11-04

## 구현된 기능

### 1. 알림 데이터 구조 및 타입

#### types.ts
- **경로**: `src/features/notifications/types.ts`
- **Notification 타입**: 알림 기본 정보
  - type: 'email' | 'sms' | 'system'
  - status: 'unread' | 'read'
  - priority: 'low' | 'medium' | 'high'
  - 제목, 메시지, 발신자, 수신자 정보
  - 차수 연결 정보 (roundId, roundTitle)
  - 타임스탬프 (createdAt, readAt)
- **NotificationTemplate**: 알림 템플릿
- **SendNotificationRequest**: 알림 발송 요청
- **NotificationStats**: 알림 통계

#### schema.ts
- **경로**: `src/features/notifications/schema.ts`
- Zod 기반 validation
- 한국어 에러 메시지
- sendNotificationSchema: 알림 발송 폼 검증
- notificationTemplateSchema: 템플릿 폼 검증

### 2. API Stub 구현

#### api.ts
- **경로**: `src/features/notifications/api.ts`
- Mock 데이터 3개 알림 포함
- Mock 템플릿 2개 포함

**API 함수들**:
- `fetchNotifications(userId, status?)`: 사용자 알림 목록 조회
- `fetchNotification(id)`: 단일 알림 조회
- `markAsRead(id)`: 알림 읽음 처리
- `markAllAsRead(userId)`: 모든 알림 읽음 처리
- `deleteNotification(id)`: 알림 삭제
- `sendNotification(request)`: 알림 발송
- `getNotificationStats(userId)`: 알림 통계 조회
- `fetchTemplates()`: 템플릿 목록 조회
- `fetchTemplate(id)`: 단일 템플릿 조회

### 3. React Query Hooks

#### useNotifications.ts
- **경로**: `src/features/notifications/hooks/useNotifications.ts`
- React Query 기반 상태 관리
- 자동 캐싱 및 재검증
- Toast 알림 통합

**Hooks**:
- `useNotifications(userId, status?)`: 알림 목록 조회
- `useNotification(id)`: 단일 알림 조회
- `useNotificationStats(userId)`: 통계 조회
- `useMarkAsRead()`: 읽음 처리 mutation
- `useMarkAllAsRead()`: 전체 읽음 처리 mutation
- `useDeleteNotification()`: 삭제 mutation
- `useSendNotification()`: 발송 mutation
- `useTemplates()`: 템플릿 목록 조회
- `useTemplate(id)`: 단일 템플릿 조회

### 4. UI 컴포넌트

#### NotificationItem
- **경로**: `src/features/notifications/components/NotificationItem.tsx`
- 단일 알림 항목 렌더링
- 읽음/안읽음 상태 표시 (파란색 배경, 점 표시)
- 우선순위별 색상 코딩 (높음: 빨강, 보통: 노랑, 낮음: 파랑)
- 타입별 아이콘 (이메일, SMS, 시스템)
- 상대 시간 표시 ("방금 전", "3시간 전" 등)
- 삭제 버튼 (hover시 표시)
- 클릭시 자동 읽음 처리

#### NotificationList
- **경로**: `src/features/notifications/components/NotificationList.tsx`
- 알림 목록 렌더링
- 로딩 상태 처리
- 빈 상태 메시지
- "모두 읽음" 버튼
- 읽지 않은 알림 카운트 표시

#### NotificationCenter
- **경로**: `src/features/notifications/components/NotificationCenter.tsx`
- 헤더 벨 아이콘 버튼
- 읽지 않은 알림 배지 (빨간색 원, 숫자 표시)
- 애니메이션 효과 (pulse animation)
- 드롭다운 메뉴 (최근 5개 알림 표시)
- "모두 보기" 링크 (전체 알림 페이지로 이동)
- 자동 업데이트 (30초마다)

#### SendNotificationDialog
- **경로**: `src/features/notifications/components/SendNotificationDialog.tsx`
- 알림 발송 다이얼로그
- 템플릿 선택 기능 (템플릿 선택시 자동 채우기)
- 알림 유형 선택 (시스템/이메일/SMS)
- 우선순위 선택
- 제목 및 메시지 입력
- 수신자 선택 (체크박스, 전체 선택/해제)
- 발송 대상자 카운트 표시
- 발송 진행 상태 표시 (로딩 스피너)

### 5. 레이아웃 통합

#### Navbar 업데이트
- **경로**: `src/components/layout/navbar.tsx`
- NotificationCenter 추가
- userId prop 추가
- 사용자 메뉴 옆에 알림 센터 배치

### 6. 페이지 구현

#### 알림 전체 페이지
- **경로**: `src/app/notifications/page.tsx`
- 알림 통계 카드 (전체, 읽지 않음, 읽음, 시스템)
- 탭 네비게이션 (전체/읽지 않음/읽음)
- 알림 목록 표시
- "모두 읽음 처리" 버튼
- 반응형 레이아웃

#### 대시보드 페이지 업데이트
- **경로**: `src/app/admin/rounds/[id]/dashboard/page.tsx`
- "알림 보내기" 버튼 클릭시 SendNotificationDialog 열기
- 미제출자만 자동 선택
- 차수 정보 자동 전달

## 구현된 파일 목록

```
src/
├── features/
│   └── notifications/
│       ├── types.ts                                    (새로 생성)
│       ├── schema.ts                                   (새로 생성)
│       ├── api.ts                                      (새로 생성)
│       ├── hooks/
│       │   └── useNotifications.ts                     (새로 생성)
│       └── components/
│           ├── NotificationItem.tsx                    (새로 생성)
│           ├── NotificationList.tsx                    (새로 생성)
│           ├── NotificationCenter.tsx                  (새로 생성)
│           └── SendNotificationDialog.tsx              (새로 생성)
├── components/
│   ├── layout/
│   │   └── navbar.tsx                                  (업데이트)
│   └── ui/
│       └── tabs.tsx                                     (새로 생성 - shadcn)
└── app/
    ├── notifications/
    │   └── page.tsx                                     (새로 생성)
    └── admin/
        └── rounds/
            └── [id]/
                └── dashboard/
                    └── page.tsx                         (업데이트)
```

## 주요 기능 상세

### 1. 알림 센터 (Notification Center)
- 헤더 우측 상단에 벨 아이콘
- 읽지 않은 알림 개수 배지 (99+ 처리)
- Pulse 애니메이션으로 새 알림 강조
- 드롭다운에서 최근 5개 알림 미리보기
- 클릭시 알림 읽음 처리
- 전체 알림 페이지 링크

### 2. 알림 발송 (Send Notification)
- 관리자가 참여자에게 알림 발송
- 템플릿 기반 메시지 작성
- 다중 수신자 선택 (최대 100명)
- 알림 유형 선택 (시스템/이메일/SMS)
- 우선순위 지정
- 차수 정보 자동 연결
- 발송 성공시 Toast 알림

### 3. 알림 관리
- 알림 목록 필터링 (전체/읽지 않음/읽음)
- 개별 알림 읽음 처리
- 모든 알림 일괄 읽음 처리
- 알림 삭제
- 통계 대시보드

### 4. 알림 템플릿
- 사전 정의된 메시지 템플릿
- 변수 치환 기능 ({{participantName}}, {{roundTitle}} 등)
- 템플릿 선택시 자동 채우기

## 기술적 특징

### React Query 최적화
- 30초 staleTime으로 자동 재검증
- Optimistic updates
- 자동 캐시 무효화
- 에러 처리 및 재시도

### 사용자 경험
- 실시간 알림 배지 업데이트
- 부드러운 애니메이션 효과
- 상대 시간 표시 ("3시간 전")
- Toast 알림으로 즉각적인 피드백
- 로딩 상태 표시
- 빈 상태 메시지

### 접근성
- 키보드 네비게이션 지원
- 시맨틱 HTML
- ARIA 레이블
- 색상 대비 (WCAG AA)

### 반응형 디자인
- 모바일 최적화
- 드롭다운 위치 자동 조정
- 터치 친화적 버튼 크기
- 스크롤 가능한 긴 목록

## Mock 데이터

### 알림 샘플 (3개)
1. 시스템 알림 - "문서 제출 마감 임박" (읽지 않음, 높은 우선순위)
2. 이메일 알림 - "새로운 차수가 시작되었습니다" (읽지 않음, 보통 우선순위)
3. 시스템 알림 - "제출이 완료되었습니다" (읽음, 낮은 우선순위)

### 템플릿 샘플 (2개)
1. "제출 마감 알림" - 이메일 템플릿
2. "제출 완료 확인" - 시스템 알림 템플릿

## 다음 단계 (Backend 연동 시)

1. **API 통합**
   - `src/features/notifications/api.ts`의 stub 함수를 실제 API 호출로 교체
   - WebSocket 또는 SSE로 실시간 알림 구현
   - 푸시 알림 통합 (Service Worker)

2. **이메일/SMS 발송**
   - 이메일 발송 서비스 연동 (SendGrid, AWS SES 등)
   - SMS 발송 서비스 연동 (Twilio, 알리고 등)
   - 템플릿 엔진 구현 (변수 치환)

3. **고급 기능**
   - 알림 스케줄링 (예약 발송)
   - 자동 리마인더 (마감일 기준)
   - 알림 설정 (사용자별 알림 선호도)
   - 알림 그룹화 및 요약

4. **보안**
   - 알림 발송 권한 체크
   - Rate limiting (스팸 방지)
   - 민감 정보 마스킹

## 검증 방법

```bash
# 개발 서버 실행
npm run dev

# 브라우저에서 확인
# http://localhost:3000
```

### 테스트 시나리오

1. **알림 센터 확인**
   - 헤더 우측 상단의 벨 아이콘 클릭
   - 알림 목록 확인 (2개 읽지 않음 알림 표시)
   - 알림 클릭시 읽음 처리 확인
   - 배지 카운트 업데이트 확인

2. **알림 전체 페이지**
   - `/notifications` 접속
   - 통계 카드 확인 (전체 3, 읽지 않음 2, 읽음 1)
   - 탭 전환 확인
   - "모두 읽음 처리" 버튼 클릭
   - 알림 삭제 버튼 클릭

3. **알림 발송**
   - `/admin/rounds/1/dashboard` 접속
   - "알림 보내기" 버튼 클릭
   - 미제출자 2명 자동 선택 확인
   - 템플릿 선택 → 자동 채우기 확인
   - 수신자 선택/해제 확인
   - 알림 발송 → Toast 메시지 확인

4. **반응형 확인**
   - 모바일 뷰로 전환 (DevTools)
   - 알림 센터 드롭다운 위치 확인
   - 알림 목록 스크롤 확인
   - 터치 동작 확인

## 성능 최적화

- React Query 캐싱으로 불필요한 API 호출 방지
- 알림 목록 가상화 (향후 추가 가능)
- 이미지 lazy loading
- 코드 스플리팅

## 알려진 제한사항

1. 현재는 Mock 데이터 사용 (Backend 연동 필요)
2. 실시간 알림 없음 (폴링 방식, WebSocket 필요)
3. 푸시 알림 미구현 (Service Worker 필요)
4. 알림 검색 기능 없음
5. 알림 필터링 제한적 (날짜, 타입 등 추가 필요)

## 추가 패키지

```json
{
  "@radix-ui/react-tabs": "^1.x.x"
}
```

## 노트

- 모든 알림은 한국어로 표시됩니다
- 알림 발송 시 Toast로 즉각적인 피드백을 제공합니다
- 읽지 않은 알림은 파란색 배경으로 강조됩니다
- 우선순위에 따라 다른 색상의 아이콘이 표시됩니다
- 상대 시간 표시로 사용자 친화적입니다

## 다음 작업 (추천)

1. **Backend API 연동** - 알림 시스템 실제 구현
2. **WebSocket 통합** - 실시간 알림
3. **푸시 알림** - Service Worker + Web Push API
4. **이메일 템플릿** - HTML 이메일 디자인
5. **알림 설정 페이지** - 사용자별 알림 선호도
6. **알림 히스토리** - 페이지네이션, 검색, 필터링
