# 옴니노드 초기 이력 정리와 진행 추적 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 최초 공개 전 템플릿 작업 이력을 제거하고 옴니노드 제품 정체성, 개발 진행 추적, 공개 소개 문서를 확정한다.

**Architecture:** 제품의 지속 설계는 `docs/project-design/`, 작업 절차와 진행 상태는 `docs/work-design/`, 옴니노드 구현 근거는 2026-09-03 이후 `docs/superpowers/`에 유지한다. README는 제품 설명만 제공하고 진행 상태와 업데이트 이력은 안정된 단일 경로의 추적 문서가 소유한다.

**Tech Stack:** Markdown, JSON, TypeScript configuration, Git static verification

**Spec:** `docs/superpowers/specs/2026-09-03-omninode-initial-history-progress-design.md`

## Global Constraints

- 삭제 대상은 설계 문서에 열거한 21개 파일로 한정한다.
- 2026-09-03 옴니노드 품질 기준선과 후속 정리 문서는 유지한다.
- README에는 기술, 인프라, 설치, 사용 방법, 개발 진행률을 넣지 않는다.
- README의 운영 주소는 `-`로 기록한다.
- 설계 완료와 구현 완료를 구분한다.
- 완료 근거가 없는 작업을 완료로 표시하지 않는다.
- 커밋과 푸시는 정리와 검증 뒤 별도 단계로 남긴다.

---

### Task 1: 템플릿 작업 이력 제거

**Files:**
- Delete: 설계 문서의 계획 문서 11개
- Delete: 설계 문서의 설계 문서 10개

**Interfaces:**
- Consumes: `docs/superpowers/specs/2026-09-03-omninode-initial-history-progress-design.md`의 삭제 목록
- Produces: 옴니노드 관련 작업 이력만 남은 `docs/superpowers/`

- [ ] **Step 1: 삭제 대상과 유지 대상 재확인**

Run: `Get-ChildItem docs/superpowers/plans,docs/superpowers/specs -File | Sort-Object FullName`

Expected: 삭제 대상 21개와 2026-09-03 유지 대상 6개가 구분된다.

- [ ] **Step 2: 정확한 21개 문서 삭제**

설계 문서에 열거한 경로만 삭제하고 다른 제품·작업 설계 문서는 수정하지 않는다.

- [ ] **Step 3: 잔존·참조 검사**

Run: `rg -n "nuxt-template-bootstrap|agent-guidance|default-layout-sidebar|query-composable-pinia|site-config-navigation|site-footer|vue-query-composable|prisma-postgresql-transition|redundant-direct-dependency-cleanup|vue-query-public-generics|default-layout-panels" docs`

Expected: 삭제 목록을 기록한 현재 설계·계획 문서 외에는 결과가 없다.

### Task 2: 프로젝트 정체성과 진행 추적 정리

**Files:**
- Modify: `package.json`
- Modify: `app/config/site.config.ts`
- Modify: `AGENTS.md`
- Modify: `docs/work-design/README.md`
- Create: `docs/work-design/omninode-progress.md`

**Interfaces:**
- Produces: 옴니노드 프로젝트 식별 정보와 단일 개발 진행 추적 문서

- [ ] **Step 1: 프로젝트 식별 정보 수정**

`package.json` 이름을 `omninode-engine`으로 바꾸고 사이트 제목·설명·키워드·이미지 대체 문구를 옴니노드 제품에 맞춘다. `AGENTS.md`의 범용 템플릿 문장을 옴니노드 프로젝트 문장으로 바꾼다.

- [ ] **Step 2: 진행 추적 문서 작성**

`docs/work-design/omninode-progress.md`에 현재 단계, 상태 기준, 단계별 상태, 근거, 다음 작업, 저장소 공개 상태, 날짜별 업데이트 이력을 기록한다.

- [ ] **Step 3: 지속 갱신 규칙 연결**

`AGENTS.md`와 `docs/work-design/README.md`에서 진행 추적 문서를 공식 기준으로 지정한다. 실제 상태가 바뀌는 작업마다 근거와 다음 작업을 함께 갱신하도록 한다.

- [ ] **Step 4: 정체성과 상태 검사**

Run: `rg -n "nuxt-template|Nuxt Minimal Starter|사이트 이름|사이트 설명|앱 템플릿" package.json README.md app/config/site.config.ts AGENTS.md docs/work-design`

Expected: 결과가 없다.

### Task 3: 공개 README 작성

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: 확정된 옴니노드 제품 설계
- Produces: 기술·인프라 설명이 없는 공개 제품 소개

- [ ] **Step 1: 제품 설명 작성**

옴니노드가 세계관 설정을 월드·프로젝트·문서와 관계로 구조화하고 필요한 내용을 공개하는 서비스임을 설명한다.

- [ ] **Step 2: 주요 기능 작성**

월드·프로젝트, 카테고리·템플릿, 문서·리비전, 위키링크·태그, 관계·관계도, 역할·권한, 공개 열람을 기능 단위로 설명한다.

- [ ] **Step 3: 운영 주소 작성**

운영 주소는 결정 전이므로 `-`로 기록한다.

- [ ] **Step 4: 금지 내용 검사**

Run: `rg -n -i "nuxt|vue|typescript|prisma|postgres|pnpm|npm|install|build|deploy|환경변수|개발 서버|사용 방법" README.md`

Expected: 결과가 없다.

### Task 4: 전체 검증

**Files:**
- Verify: 이번 작업의 모든 변경 파일

**Interfaces:**
- Produces: 최초 커밋과 푸시 직전의 검증된 작업 트리

- [ ] **Step 1: 문서 구조와 추적성 검사**

Run:

```powershell
rg --files docs/project-design docs/work-design docs/superpowers
rg -n "omninode-progress.md" AGENTS.md docs/work-design/README.md
```

Expected: 제품 설계, 작업 설계, 옴니노드 작업 이력과 진행 추적 경로가 모두 존재한다.

- [ ] **Step 2: 품질 검증**

Run:

```powershell
pnpm test
pnpm lint
pnpm exec vue-tsc --noEmit
pnpm build
```

Expected: 모든 명령이 exit code 0.

- [ ] **Step 3: Git과 원격 상태 확인**

Run:

```powershell
git diff --check
git status --short --branch
git remote -v
```

Expected: 아직 커밋이 없는 `master`, 의도한 초기 파일 목록, HTTPS `nihilapp/omninode-engine` 원격이 확인된다.

- [ ] **Step 4: 커밋·푸시 대기 상태 기록**

진행 추적 문서에서 저장소 정리는 완료, 최초 커밋·푸시는 대기로 표시한다. 커밋과 푸시는 실행하지 않는다.
