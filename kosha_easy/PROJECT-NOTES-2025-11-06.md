# 작업 기록 (2025-11-06)

## 변경 사항 요약
- 디자인 토큰 개선: `src/theme.config.ts` 색상 팔레트 WCAG AA 기준 반영 (primary/secondary/accent base 톤 조정).
- 한글 깨짐(인코딩) 정리 1차:
  - `src/app/layout.tsx` 메타데이터 텍스트 정상 한글로 재작성.
  - `src/app/page.tsx` 루트 안내 문구 한글로 재작성.
  - `src/app/login/page.tsx` 로그인 문구/레이블 한글로 재작성.
  - `src/components/layout/navbar.tsx` 타이틀/메뉴 한글로 재작성.
  - `src/app/admin/rounds/page.tsx` 헤더/대화상자/에러/로딩 문구 한글로 재작성.
- T-002 요약 문서(`T-002-COMPLETED.md`)는 심각한 깨짐이 많아 임시 삭제(백업 필요 시 Git 히스토리 참조) — 추후 UTF-8로 재생성 예정.

## 파일 변경 내역
- 수정: `src/theme.config.ts:1`
- 재작성: `src/app/layout.tsx:1`
- 재작성: `src/app/page.tsx:1`
- 재작성: `src/app/login/page.tsx:1`
- 재작성: `src/components/layout/navbar.tsx:1`
- 재작성: `src/app/admin/rounds/page.tsx:1`
- 삭제: `T-002-COMPLETED.md`

## 미해결/추가 작업(TODO)
- 인코딩(UTF-8) 정리 계속 진행 필요:
  - `src/app/admin/rounds/[id]/dashboard/page.tsx`
  - `src/app/participant/rounds/page.tsx`
  - `src/app/participant/rounds/[id]/submit/page.tsx`
  - `PROJECT-STATUS.md` (문서 전반 한글 깨짐)
- AGENTS.md 준수 보강:
  - 모든 `app/**/page.tsx`에서 `params`를 Promise로 받는 형태로 전환 예: `export default async function Page({ params }: { params: Promise<{ id: string }> }) { ... }`
  - 모든 레이아웃/컴포넌트에 `use client` 적용 여부 점검. 현재 `app/layout.tsx`는 서버 컴포넌트이므로 전환 영향 검토 필요.
  - placeholder 이미지는 `https://picsum.photos/seed/<uuid>/800/600` 규칙 사용 지점 준비.
- T-002 완료 문서 재생성(UTF-8): 핵심 내용은 유지하되 한글 표기 정상화하여 `T-002-COMPLETED.utf8.md`로 복구 제안.

## MCP(Vooster) 관련 메모
- 현재 이 환경은 MCP 세션을 직접 열 수 없음(서버 등록만 가능). 실제 호출은 로컬 Codex CLI가 수행해야 함.
- 로컬에서 사용 방법:
  1) Codex CLI 최신 버전 설치/업데이트
  2) `codex mcp list`로 `vooster-ai` 확인
  3) RMCP 클라이언트 활성화: `codex -c experimental_use_rmcp_client=true chat`
  4) 채팅 내 MCP 패널에서 `vooster-ai` 선택 후 프롬프트 실행
  5) 출력 결과를 이 채팅에 붙여넣으면, 코드 반영을 이어서 진행

## 다음 단계 제안
1) 위 미해결 파일들의 한글 깨짐을 일괄 정리(UTF-8 저장) 및 텍스트 교정
2) 동적 라우트 페이지의 `params: Promise<...>` 시그니처 전환
3) T-002 완료 문서 UTF-8로 재생성
4) 필요 시 팔레트/타이포 시각 확인용 미니 프리뷰 페이지 추가(옵션)

