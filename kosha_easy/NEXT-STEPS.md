# 다음 작업 안내 (RPV3)

## MCP 사용 준비(로컬)
- Codex CLI 업데이트 후 `codex -c experimental_use_rmcp_client=true chat`
- MCP 패널에서 `vooster-ai` 선택 → 프롬프트 실행 → 결과 공유

## 인코딩(UTF-8) 교정
- 대상: `PROJECT-STATUS.md`, `src/app/participant/rounds/page.tsx`, `src/app/participant/rounds/[id]/submit/page.tsx`, `src/app/admin/rounds/[id]/dashboard/page.tsx`
- 저장 형식: UTF-8(BOM 없이)

## AGENTS.md 규칙 보강
- `page.tsx` 동적 라우트에 `params: Promise<{ id: string }>` 적용
- 레이아웃/페이지 상단 `use client` 점검(레이아웃은 영향 분석 후 결정)

## 문서 복구
- `T-002-COMPLETED.md` → `T-002-COMPLETED.utf8.md`로 재작성(한글 정상화)

## 품질 확인
- 브라우저로 텍스트 확인(한글 깨짐 여부)
- Tailwind 컬러/타이포 적용 확인

## 선택사항
- 디자인 토큰 프리뷰 페이지 추가(`/design/preview`)

