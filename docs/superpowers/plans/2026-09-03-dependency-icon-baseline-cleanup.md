# 의존성·아이콘 기준선 후속 정리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 호환 가능한 보안 패치를 적용하고 실제 사용하는 아이콘만 클라이언트에 포함해 남은 품질 기준선 문제를 정리한다.

**Architecture:** pnpm override는 `fast-uri`의 호환 가능한 패치만 적용한다. 아이콘 생성 로직은 앱 소스의 정적 참조를 수집하고 원본 컬렉션에서 최소 데이터와 좁은 타입을 생성하며, 런타임 `UiIcon` API는 유지한다.

**Tech Stack:** Nuxt 4, Vue 3, TypeScript, pnpm, Iconify JSON, Vitest

**Spec:** `docs/superpowers/specs/2026-09-03-dependency-icon-baseline-cleanup-design.md`

## Global Constraints

- `fast-uri@3.1.5`만 `3.1.6`으로 치환한다.
- `mysql2`와 `deepmerge-ts`에는 강제 override나 패치를 적용하지 않는다.
- 아이콘 데이터는 앱의 정적 참조와 필요한 별칭 부모만 포함한다.
- `UiIcon`의 공개 prop과 렌더링 API를 바꾸지 않는다.
- 생성 결과는 결정적이어야 하며 원본 아이콘 패키지를 런타임 import하지 않는다.
- 제품 페이지·API·Prisma 스키마와 데이터베이스를 변경하지 않는다.
- 커밋과 푸시는 마스터가 별도로 요청한 경우에만 수행한다.

---

### Task 1: 아이콘 생성 로직의 실패 테스트

**Files:**
- Create: `test/icon-generation.test.ts`
- Create: `app/scripts/icon-generation.ts`
- Modify: `app/scripts/generate-icon-types.ts`

**Interfaces:**
- Produces: `extractReferencedIconNames()`, `createMinimalIconSet()`, `createIconDataOutput()`, `createIconTypeOutput()`
- Consumes: `IconifyJSON` 컬렉션과 앱 소스 문자열

- [ ] **Step 1: 정적 참조 추출 테스트 작성**

서로 다른 소스의 지원 아이콘 이름을 추출하고 중복을 제거한 뒤 사전순으로 반환하는 테스트를 작성한다. 지원하지 않는 접두사와 동적으로 조립된 문자열은 결과에 포함하지 않는다.

- [ ] **Step 2: 최소 컬렉션 테스트 작성**

직접 아이콘은 해당 아이콘만, 별칭은 부모 별칭 사슬과 최종 아이콘을 함께 포함하는지 검사한다. 존재하지 않는 이름은 이름을 포함한 오류를 발생시켜야 한다.

- [ ] **Step 3: 생성 출력 테스트 작성**

데이터 출력에 원본 패키지 import가 없고, 타입 출력에는 참조 이름만 있으며 빈 접두사는 `never`가 되는지 검사한다.

- [ ] **Step 4: RED 확인**

Run: `pnpm exec vitest run test/icon-generation.test.ts`

Expected: 생성 모듈이 없어 import 해석이 실패한다.

- [ ] **Step 5: 최소 생성 로직 구현**

테스트가 요구하는 네 함수를 `app/scripts/icon-generation.ts`에 구현한다. 두 개 이상의 인자는 프로젝트 줄바꿈 규칙을 따른다.

- [ ] **Step 6: GREEN 확인**

Run: `pnpm exec vitest run test/icon-generation.test.ts`

Expected: 모든 아이콘 생성 테스트가 통과한다.

### Task 2: 생성기 연결과 산출물 축소

**Files:**
- Modify: `app/scripts/generate-icon-types.ts`
- Modify: `app/data/icons.data.ts`
- Modify: `app/types/icon.generated.ts`
- Modify: `app/components/ui/UiIcon.vue`

**Interfaces:**
- Consumes: Task 1의 생성 함수와 네 Iconify 컬렉션
- Produces: 최소 `iconSets` 데이터와 현재 참조만 포함하는 `UiIconName`

- [ ] **Step 1: 앱 소스 수집 구현**

`app/`을 재귀 탐색해 `.ts`, `.vue` 파일을 읽되 `app/scripts/`와 두 생성 산출물을 제외한다.

- [ ] **Step 2: 생성기에서 두 산출물 작성**

수집한 참조를 검증해 `app/data/icons.data.ts`와 `app/types/icon.generated.ts`를 함께 작성한다.

`UiIcon.vue`의 접두사 타입도 생성 파일에서 가져와 아이콘 관련 타입을 한 경계로 통합한다.

- [ ] **Step 3: 생성과 결정성 검증**

Run:

```powershell
pnpm icon:gen
git diff -- app/data/icons.data.ts app/types/icon.generated.ts
pnpm icon:gen
git diff --check
```

Expected: 두 번째 실행 뒤 추가 변경이 없고 형식 오류가 없다.

- [ ] **Step 4: 집중 테스트와 타입 검사**

Run:

```powershell
pnpm exec vitest run test/icon-generation.test.ts
pnpm exec vue-tsc --noEmit
```

Expected: 두 명령 모두 exit code 0.

### Task 3: 호환 가능한 의존성 패치

**Files:**
- Modify: `pnpm-workspace.yaml`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces: `fast-uri@3.1.6`이 해석되는 pnpm 잠금 상태
- Excludes: `mysql2`, `deepmerge-ts` 강제 변경

- [ ] **Step 1: RED 감사 결과 기록**

Run: `pnpm audit --json`

Expected: `fast-uri@3.1.5` 권고가 포함된다.

- [ ] **Step 2: 패치 override 적용**

`pnpm-workspace.yaml`에 `fast-uri@3.1.5`를 `3.1.6`으로 치환하는 override를 추가하고 `pnpm install`로 잠금 파일을 갱신한다.

- [ ] **Step 3: GREEN 감사 결과 확인**

Run: `pnpm audit --json`

Expected: `fast-uri` 권고가 사라지고 남은 항목은 `mysql2`, `deepmerge-ts`뿐이다.

- [ ] **Step 4: 실제 해석 버전 확인**

Run: `pnpm why fast-uri mysql2 deepmerge-ts`

Expected: `fast-uri`는 `3.1.6`, 나머지는 상위 Prisma 의존 경로로 표시된다.

### Task 4: 전체 회귀와 산출물 검증

**Files:**
- Verify: Task 1~3의 모든 변경 파일
- Verify: `.output/public/_nuxt/`

**Interfaces:**
- Consumes: 최소 아이콘 산출물과 패치된 잠금 파일
- Produces: 후속 제품 구현을 막지 않는 검증된 품질 기준선

- [ ] **Step 1: 전체 품질 검증**

Run:

```powershell
pnpm test
pnpm lint
pnpm exec vue-tsc --noEmit
pnpm exec nuxi prepare
pnpm build
git diff --check
```

Expected: 모든 명령이 exit code 0.

- [ ] **Step 2: 런타임 import와 대형 청크 확인**

Run:

```powershell
rg -n "@iconify-json" app/data/icons.data.ts .output/public/_nuxt
Get-ChildItem .output/public/_nuxt -File | Sort-Object Length -Descending | Select-Object -First 5 Name, Length
```

Expected: 생성 데이터와 클라이언트 산출물에 아이콘 패키지 import가 없고 가장 큰 JavaScript 파일이 500 kB 미만이다.

- [ ] **Step 3: 변경 범위 확인**

Run:

```powershell
git diff --name-only
git diff --name-only -- prisma app/pages server/api
git status --short
```

Expected: 설계·계획, 아이콘 생성 관련 파일, 테스트, `pnpm-workspace.yaml`, `pnpm-lock.yaml`만 변경되고 제품 페이지·API·Prisma 파일은 출력되지 않는다.

- [ ] **Step 4: 잔여 권고 분리 기록**

최종 보고에 `mysql2`와 `deepmerge-ts`가 상위 의존성 문제이며 프로덕션 산출물에 포함되지 않아 이번 범위에서 종료했음을 명시한다.
