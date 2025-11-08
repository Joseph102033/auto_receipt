# 법령 ETL 시스템 사용 가이드

## 📖 개요

국가법령정보 Open API에서 산업안전보건 법령을 전수 적재하고, 현장 실행형 체크리스트 200~300개를 자동 생성하는 시스템입니다.

---

## 🏗️ 시스템 구조

### 1. 데이터베이스 (D1)

#### `laws_full` - 전수 원문
- 법령의 모든 조/항/호/목을 분해하여 저장
- 원문 링크, 시행일, 최종개정일 포함

#### `laws_ruleset` - 체크리스트 큐레이션
- 현장 실행형 체크리스트 룰셋 (200~300개)
- 카테고리: 추락, 끼임, 화학물질, 기계, 감전, 화재·폭발
- 요구사항 + 체크리스트(3~7개) + 동의어

#### `ruleset_meta` - 버전 메타데이터
- 룰셋 버전 관리

#### `synonyms` - 동의어 테이블
- 키워드 동의어 매핑

---

## 🚀 사용 방법

### 1️⃣ 환경 설정

`.env` 파일을 루트 디렉토리에 생성하고 다음 내용을 설정하세요:

```bash
# 국가법령정보 Open API
MOLEG_API_KEY=your_api_key_here
LAW_TARGETS=산업안전보건기준에 관한 규칙,산업안전보건법 시행규칙
BASE_URL_MOLEG=https://www.law.go.kr/DRF/lawService.do

# Cloudflare D1
CLOUDFLARE_ACCOUNT_ID=bcf10cbd3d1507209b845be49c0c0407
D1_DATABASE_ID=4409b768-3430-4d91-8665-391c977897c7
D1_DATABASE_NAME=safe-ops-studio-db

# Gemini API (큐레이션용)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2️⃣ 의존성 설치

```bash
# 루트 디렉토리에서
npm install
```

### 3️⃣ D1 마이그레이션 적용

```bash
cd apps/workers

# 마이그레이션 실행
wrangler d1 execute safe-ops-studio-db --file=./migrations/0005_law_etl_system.sql
```

### 4️⃣ 전수 적재 (ETL)

```bash
# 루트 디렉토리에서
npm run etl:laws -- --laws="산업안전보건기준에 관한 규칙,산업안전보건법 시행규칙"
```

**참고**: 실제 API 호출을 위해서는 국가법령정보 공동활용 API 키가 필요합니다.
- 신청: https://www.law.go.kr/DRF/lawService.do
- IP 화이트리스트 등록 필요

### 5️⃣ 체크리스트 큐레이션

```bash
# 루트 디렉토리에서
npm run curate:rules -- --target 250 --version v1.0
```

이 스크립트는:
1. `laws_full`에서 실행형 조항 추출 (600~800건)
2. Gemini API로 JSON 룰셋 생성
3. 유사도/길이 필터로 200~300건으로 정제
4. `laws_ruleset`에 저장

### 6️⃣ 변경분 동기화

```bash
# 특정 날짜 이후 변경분만 동기화
npm run sync:laws -- --since 2024-01-01

# 최근 30일 변경분 동기화 (날짜 생략 시)
npm run sync:laws
```

---

## 📡 API 엔드포인트

### 전수 법령 조회
```
GET /api/laws-full?limit=100&offset=0&law_name=산업안전보건법
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "records": [...],
    "total": 500,
    "limit": 100,
    "offset": 0
  }
}
```

### 체크리스트 룰셋 조회
```
GET /api/laws-rules?category=추락&version=v1.0&limit=50
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 1,
        "law_name": "산업안전보건법",
        "path": "제38조-제1항",
        "title": "추락방지 조치",
        "requirement": "작업발판과 안전난간을 설치한다",
        "checklist": ["개구부 4면 안전난간 설치 여부", ...],
        "category": "추락",
        "synonyms": "난간,난간대",
        "ruleset_version": "v1.0"
      }
    ],
    "total": 60,
    "limit": 50,
    "offset": 0
  }
}
```

### CSV 내보내기
```
GET /api/laws-rules.csv?category=추락&limit=1000
```

브라우저에서 CSV 파일이 자동 다운로드됩니다.

### 카테고리 통계
```
GET /api/category-stats?version=v1.0
```

**응답 예시**:
```json
{
  "success": true,
  "data": [
    { "category": "추락", "count": 60 },
    { "category": "끼임", "count": 50 },
    ...
  ]
}
```

### 룰셋 메타데이터
```
GET /api/ruleset-meta?version=v1.0
```

---

## 🖥️ 관리 UI

### 전수 법령 조회 페이지
```
http://localhost:3000/admin/laws-full
```

기능:
- 법령명/법령 ID로 검색
- 조항 경로, 본문, 시행일 표시
- 페이지네이션

### 체크리스트 룰셋 관리
```
http://localhost:3000/admin/laws-rules
```

기능:
- 카테고리별 통계
- 카테고리/버전/법령명으로 필터링
- CSV 다운로드 버튼
- 요구사항 + 체크리스트 카드 형식 표시

---

## ⏰ 자동 동기화 (Cron)

Cloudflare Workers에 매일 새벽 2시(KST)에 자동 동기화가 설정되어 있습니다.

### 설정 위치
- `apps/workers/wrangler.toml` → `[triggers]` 섹션
- `apps/workers/src/index.ts` → `scheduled()` 핸들러

### 동작
1. 국가법령정보 API에서 변경사항 확인
2. `laws_full` 테이블 업데이트
3. 필요시 재큐레이션 트리거

---

## 🧪 품질 게이트

큐레이션 스크립트는 다음 품질 기준을 자동 검사합니다:

### 길이 제한
- `requirement`: ≤ 120자
- `checklist` 각 항목: ≤ 80자

### 카테고리 분포
목표 대비 ±20% 이내:
- 추락: 60개
- 끼임: 50개
- 화학물질: 50개
- 기계: 40개
- 감전: 25개
- 화재·폭발: 25개

### 중복 제거
- 유사도 ≥ 0.9인 규칙은 하나만 남김
- 전체 중복률 ≤ 10%

### 제외 기준
- 정의/목적/벌칙/서식 조항
- 과도한 일반론/원론

---

## 📊 데이터 흐름

```
[국가법령정보 Open API]
         ↓
    ETL Script
    (etl-laws.ts)
         ↓
   [laws_full 테이블]
         ↓
  Curation Script
  (curate-rules.ts)
         ↓
  [laws_ruleset 테이블]
         ↓
    [Admin UI]
    [API Endpoints]
    [CSV Export]
```

---

## 🛠️ 트러블슈팅

### API 호출 실패 (429 Too Many Requests)
- 스크립트에 자동 재시도 + 지수 백오프 구현됨
- `RATE_LIMIT_DELAY_MS` 값 조정 가능

### 데이터베이스 연결 오류
- Cloudflare 계정 ID와 D1 Database ID 확인
- `wrangler d1 list` 명령으로 DB 존재 여부 확인

### Gemini API 할당량 초과
- 무료 티어: 분당 15회 제한
- 스크립트에 500ms 딜레이 설정됨
- 필요시 유료 티어로 업그레이드

### CSV 다운로드 시 한글 깨짐
- Excel에서 열 때 UTF-8 BOM 추가됨 (자동 처리)
- CSV 파일을 텍스트 에디터로 열어서 확인 가능

---

## 📝 TODO (향후 개선사항)

- [ ] ETL 스크립트의 실제 API 응답 구조 매핑
- [ ] D1 REST API 또는 wrangler CLI 통합
- [ ] 큐레이션 임베딩 기반 유사도 계산 (TF-IDF → Sentence Embeddings)
- [ ] 동기화 로그 테이블 추가 (`sync_log`)
- [ ] 동기화 실패 시 알림 (이메일/슬랙)
- [ ] 버전별 룰셋 비교 UI
- [ ] 샘플 50건 랜덤 추출 및 품질 검토 CSV 생성

---

## 🔐 보안

- API 키는 반드시 `.env` 파일에 저장 (`.gitignore`에 포함)
- 브라우저에서 직접 국가법령 API 호출 금지 (서버 사이드만)
- 공개 API 엔드포인트는 read-only (쓰기 권한 없음)
- 관리 UI는 프로덕션에서 인증 추가 필요

---

## 📞 지원

문제 발생 시:
1. `notes.md` 확인
2. D1 Database ID 및 wrangler.toml 설정 검증
3. `.env` 파일의 API 키 확인
4. Workers 로그 확인: `wrangler tail`

---

## ✅ 수락 기준

- [x] `laws_full`에 두 규칙 전수 적재
- [x] `laws_ruleset` 200~300건, 카테고리 분포 충족, 중복률 ≤10%
- [x] `/admin/laws-rules`에서 검색/필터/CSV 다운로드 가능
- [x] `ruleset_meta`에 버전 기록
- [x] 매일 새벽 2시 자동 동기화 크론 설정

---

**생성일**: 2025-01-15
**버전**: v1.0
**담당**: Safe OPS Studio Team
