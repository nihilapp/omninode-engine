# M02 제품 데이터베이스 기반 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 빈 PostgreSQL 데이터베이스에 옴니노드의 35개 제품 테이블, DB 무결성 제약, 최초 운영자와 재실행 가능한 시스템 카탈로그 초기화를 구축한다.

**Architecture:** Prisma는 35개 모델의 타입·일반 외래 키·일반 및 부분 고유 키를 선언하고, 최초 마이그레이션의 PostgreSQL SQL은 대소문자 비구분 슬러그·행 단위 검사·지연 FK·범위·카테고리·관계 트리거를 추가한다. 명시적 CLI bootstrap이 최초 운영자와 동결 시스템 카탈로그를 한 트랜잭션에 만들고, 별도 system-seed가 같은 스냅샷을 비교·재실행한다.

**Tech Stack:** Nuxt 4, TypeScript, Prisma ORM 7.9.1, PostgreSQL, `@prisma/adapter-pg`, Vitest 4, Node.js `tsx`, Argon2id.

**Spec:**
- `docs/project-design/2026-08-29-omninode-data-schema.md`
- `docs/superpowers/specs/2026-09-10-m01-login-session-storage-design.md`
- `docs/superpowers/specs/2026-09-10-m01-default-data-source-design.md`
- `docs/project-design/2026-09-10-omninode-system-template-catalog.md`
- `docs/superpowers/specs/2026-09-10-m01-postgresql-constraint-enforcement-design.md`
- `docs/superpowers/specs/2026-09-10-m01-bootstrap-and-system-seed-design.md`

## Global Constraints

- 이 계획의 구현 시작 전에는 마스터의 구현 승인을 다시 받는다. 현재 계획 작성은 구현 승인이 아니다.
- 기존 임시 `User` 모델과 access·refresh 토큰 원문 컬럼은 제품 스키마에 남기지 않는다.
- 모든 테이블은 UUID v7 `id`, `use_yn`, `del_yn`, `creatr_id`, `crt_dt`, `mdfr_id`, `mdfcn_dt`, `dltr_id`, `del_dt`를 가진다. 새 행은 `Y`, `N`으로 시작한다.
- UUID v7은 PostgreSQL 기본값이 아니라 애플리케이션에서 생성한다. 날짜는 `TIMESTAMPTZ(3)`으로 저장한다.
- `partialIndexes` Prisma 미리보기 기능을 켠다. 부분 고유성은 제품 스키마가 명시한 같은 행의 조건에만 쓴다.
- 범위·카테고리 계층·관계 카디널리티는 서비스 검증과 PostgreSQL 제약·트리거로 함께 방어한다. 상태 전이의 여러 행 변경은 서비스 트랜잭션이 소유한다.
- 시스템 카탈로그는 공통 카테고리 97개, 관계 유형 936개, 대상 역할 2,813개, 공통 템플릿 11종만 포함한다. 실제 월드·프로젝트·문서, 프로젝트 위그드라실·룩스테라·엘드로스 데이터는 만들지 않는다.
- 최초 운영자만 생성 시 `creatr_id`가 비어 있고, 그 뒤 생성하는 모든 역할·허가·시스템 카탈로그 행은 최초 운영자 ID를 생성자로 기록한다.
- `TEST_DATABASE_URL`을 쓴 테스트는 대상 DB 이름이 `_test`로 끝나는 경우에만 연결·초기화한다. 운영·개발 DB에는 파괴적 테스트를 실행하지 않는다.
- API·페이지·인증 핸들러·이메일 발송·실제 세계관 이관은 이 M02 범위에 넣지 않는다.
- 마스터가 요청하지 않았으므로 이 계획의 구현 과정에서는 커밋·푸시를 하지 않는다.

---

## File Structure

| 경로 | 책임 |
| --- | --- |
| `prisma/schema.prisma` | 35개 Prisma 모델, 열거형, 테이블·컬럼 매핑, 기본 FK·고유 키·부분 고유 인덱스 선언 |
| `prisma/migrations/<timestamp>_product_database_foundation/migration.sql` | Prisma 생성 SQL에 더하는 PostgreSQL `CHECK`, 표현식 인덱스, 지연 FK, 범위·계층·관계 트리거 |
| `server/db/client.ts` | 생성된 Prisma Client의 단일 서버 접근점과 일반 `client()` 접근자 |
| `server/db/test-database.ts` | `TEST_DATABASE_URL`의 URL·이름 검증, 테스트 전용 Prisma Client 생성·정리 |
| `server/catalog/v1/*.json` | 동결된 시스템 카테고리·관계 유형·역할·허용 카테고리·템플릿·섹션·매핑의 버전 1 스냅샷 |
| `server/catalog/catalog.types.ts` | JSON 스냅샷의 명시적 TypeScript 타입 |
| `server/catalog/validate-system-catalog.ts` | 수량, 불변 코드, 부모·역할·섹션·매핑 정합성 검증 |
| `server/bootstrap/bootstrap.types.ts` | bootstrap·seed 입력과 결과 타입 |
| `server/bootstrap/password.ts` | 임시 비밀번호 형식 검사와 Argon2id PHC 해시 생성 |
| `server/bootstrap/bootstrap-environment.ts` | 필수 bootstrap 환경 변수 읽기, 비밀값 비노출 오류 처리 |
| `server/bootstrap/system-seed.ts` | 시스템 카탈로그 비교·추가·불일치 거부 트랜잭션 |
| `server/bootstrap/bootstrap-database.ts` | 최초 운영자·전역 역할·전역 허가·초기 카탈로그를 묶는 트랜잭션 |
| `scripts/db/bootstrap.ts` | `db:bootstrap` 전용 CLI 진입점 |
| `scripts/db/seed-system.ts` | `db:seed:system` 전용 CLI 진입점 |
| `test/database/*.test.ts` | 환경 안전장치, 시스템 카탈로그, bootstrap 단위 테스트 |
| `test/database/*.integration.test.ts` | 실제 PostgreSQL 마이그레이션·제약·bootstrap 통합 테스트 |
| `.env.example`, `.env.dev.example`, `.env.prod.example` | 비밀값 없는 bootstrap·seed 환경 변수 키 문서화 |
| `package.json`, `vitest.config.ts` | 명시적 CLI·DB 테스트 명령 및 Node 테스트 환경 등록 |
| `docs/work-design/omninode-progress.md` | M02 구현과 검증 결과의 실제 완료 상태 기록 |

### Task 1: DB 테스트 안전장치와 명시적 실행 기반

**Files:**
- Create: `server/db/test-database.ts`
- Create: `test/database/test-database.test.ts`
- Modify: `package.json`
- Modify: `vitest.config.ts`
- Modify: `.env.example`
- Modify: `.env.dev.example`
- Modify: `.env.prod.example`

**Interfaces:**
- Produces: `onRequireTestDatabaseUrl(value: string | undefined): URL`
- Produces: `onCreateTestDatabaseClient(): PrismaClient`
- Produces: `onDisconnectTestDatabaseClient(client: PrismaClient): Promise<void>`
- Consumes: `process.env.TEST_DATABASE_URL`, generated `PrismaClient`, `PrismaPg`

- [ ] **Step 1: Add failing unit tests for the database-name safety rule**

```ts
import { describe, expect, it } from 'vitest';

import {
  onRequireTestDatabaseUrl,
} from '../../server/db/test-database';

describe('onRequireTestDatabaseUrl', () => {
  it('rejects an undefined URL', () => {
    expect(() => onRequireTestDatabaseUrl(undefined)).toThrow(
      'TEST_DATABASE_URL is required.',
    );
  });

  it('rejects a database name without the _test suffix', () => {
    expect(() => onRequireTestDatabaseUrl(
      'postgresql://user:password@localhost:5432/omninode',
    )).toThrow('must end with _test');
  });

  it('accepts a database name with the _test suffix', () => {
    expect(onRequireTestDatabaseUrl(
      'postgresql://user:password@localhost:5432/omninode_test',
    ).pathname).toBe('/omninode_test');
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the missing-module failure**

Run: `pnpm vitest run test/database/test-database.test.ts`

Expected: FAIL because `server/db/test-database.ts` does not exist.

- [ ] **Step 3: Implement the strict URL guard and test-only Prisma adapter factory**

```ts
export const onRequireTestDatabaseUrl = (
  value: string | undefined,
): URL => {
  if (!value) {
    throw new Error('TEST_DATABASE_URL is required.');
  }

  const url = new URL(value);
  const databaseName = url.pathname.replace(/^\//, '');

  if (!databaseName.endsWith('_test')) {
    throw new Error('TEST_DATABASE_URL database name must end with _test.');
  }

  return url;
};
```

Create a `PrismaPg` adapter with the validated URL string, make the client factory create no global singleton, and always disconnect only the client it created.

- [ ] **Step 4: Add explicit command entries and non-secret environment keys**

Add these `package.json` scripts without attaching them to `postinstall`, `dev`, `build`, or Prisma migration scripts:

```json
{
  "db:bootstrap": "tsx scripts/db/bootstrap.ts",
  "db:seed:system": "tsx scripts/db/seed-system.ts",
  "test:db": "vitest run test/database"
}
```

Add only empty keys to all three example env files:

```dotenv
TEST_DATABASE_URL=''
BOOTSTRAP_OPERATOR_EMAIL=''
BOOTSTRAP_OPERATOR_DISPLAY_NAME=''
BOOTSTRAP_OPERATOR_PASSWORD=''
SYSTEM_SEED_ACTOR_EMAIL=''
```

Configure `test/database/**/*.integration.test.ts` for Vitest's `node` environment; leave existing UI tests in `happy-dom`.

- [ ] **Step 5: Run the focused test and static configuration checks**

Run: `pnpm vitest run test/database/test-database.test.ts`

Expected: PASS.

Run: `pnpm lint && pnpm exec vue-tsc --noEmit`

Expected: PASS before product-model changes.

### Task 2: Replace the temporary Prisma model with the 35-model product schema

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `server/db/client.ts`
- Create: `test/database/product-schema.contract.test.ts`

**Interfaces:**
- Produces: generated Prisma delegates for `Admin`, `AdminRole`, `AdminPermissionRule`, `AdminSession`, `AdminSessionClient`, `World`, `Project`, `Category`, `ProjectCategory`, `TemplateSection`, `Template`, `ProjectTemplate`, `TemplateRevision`, `TemplateRevisionSection`, `Document`, `DocumentRevision`, `DocumentRevisionSection`, `Tag`, `DocumentRevisionTag`, `DocumentRevisionLink`, `RelationType`, `WorldRelationType`, `RelationTypeRole`, `RelationTypeRoleCategory`, `Relation`, `RelationParticipant`, `RelationReferenceDocument`, `RelationLink`, `RelationHistory`, `AdminInvitation`, `AdminInvitationPermissionRule`, `AdminHistory`, `AdminPasswordResetRequest`, `AdminWithdrawalRequest`, `AdminWithdrawalWorldSuccession`
- Produces: `DB.client(): PrismaClient`
- Consumes: all table·column·FK definitions from `2026-08-29-omninode-data-schema.md`

- [ ] **Step 1: Write the failing schema contract test**

```ts
import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

describe('product Prisma schema', () => {
  it('contains the complete product model set and no temporary User model', async () => {
    const schema = await readFile('prisma/schema.prisma', 'utf8');

    expect(schema).not.toContain('model User');
    expect(schema).toContain('model Admin');
    expect(schema).toContain('model AdminSession');
    expect(schema).toContain('model DocumentRevision');
    expect(schema).toContain('model AdminWithdrawalWorldSuccession');
    expect(schema).toContain('previewFeatures = ["partialIndexes"]');
  });
});
```

- [ ] **Step 2: Run the contract test and confirm the temporary schema fails it**

Run: `pnpm vitest run test/database/product-schema.contract.test.ts`

Expected: FAIL because `model User` is still present and `model Admin` is absent.

- [ ] **Step 3: Replace `User` with the mapped product model set**

Remove `User` and `UserRole`. Declare `YnCode` only for `Y`·`N` columns and separate typed code enums only where the product state document has a closed value set. Put `previewFeatures = ["partialIndexes"]` in the generator block.

Use PascalCase model names mapped to these exact physical tables:

```text
Admin -> admins                         AdminRole -> admin_roles
AdminPermissionRule -> admin_prmsn_ruls AdminSession -> admin_ssns
AdminSessionClient -> admin_ssn_clnts   World -> worlds
Project -> prjs                         Category -> ctgrys
ProjectCategory -> prj_ctgrys           TemplateSection -> tmplt_sects
Template -> tmplts                      ProjectTemplate -> prj_tmplts
TemplateRevision -> tmplt_rvss          TemplateRevisionSection -> tmplt_rvs_sects
Document -> docs                        DocumentRevision -> doc_rvss
DocumentRevisionSection -> doc_rvs_sects
Tag -> tags                             DocumentRevisionTag -> doc_rvs_tags
DocumentRevisionLink -> doc_rvs_lnks    RelationType -> rel_types
WorldRelationType -> world_rel_types    RelationTypeRole -> rel_type_roles
RelationTypeRoleCategory -> rel_type_role_ctgrys
Relation -> rels                        RelationParticipant -> rel_prtpnts
RelationReferenceDocument -> rel_rfrnc_docs
RelationLink -> rel_lnks                RelationHistory -> rel_hstrys
AdminInvitation -> admin_invits         AdminInvitationPermissionRule -> admin_invit_prmsn_ruls
AdminHistory -> admin_hstrys            AdminPasswordResetRequest -> admin_pswd_rst_reqs
AdminWithdrawalRequest -> admin_whdwl_reqs
AdminWithdrawalWorldSuccession -> admin_whdwl_world_scsns
```

For every model, map product columns exactly as specified. Declare application-generated `String @id @db.Uuid` IDs, `@db.Timestamptz(3)` time columns, and the eight mapped audit columns. `creatrId`, `mdfrId`, and `dltrId` are nullable at the DB type level because an account's complete deletion preserves other historical rows by setting these references to `NULL`; creation services still require a real creator except for bootstrap's first `Admin`.

Declare ordinary full unique keys for immutable codes, revision sequences, section sequences, link sequences, hashes, and mapping pairs. Declare Prisma partial unique keys for the exact scopes in the PostgreSQL constraint spec, including active account email, active roles and permission scopes, valid session, soft-delete-excluded names, soft-delete-excluded relation hash, pending invitation, and pending password-reset request.

- [ ] **Step 4: Expose the general Prisma client, not a `users()` delegate**

Replace the temporary delegate with this public shape:

```ts
export class DB {
  public static client(): PrismaClient {
    // Preserve the existing PrismaPg adapter and non-production singleton behavior.
  }
}
```

No application code may read access or refresh token fields because product models contain no token original columns.

- [ ] **Step 5: Validate and generate the Prisma client**

Run: `pnpm prisma:format && pnpm prisma:validate && pnpm prisma:generate`

Expected: all commands PASS and `server/generated/prisma` contains delegates for the 35 product models.

Run: `pnpm vitest run test/database/product-schema.contract.test.ts && pnpm exec vue-tsc --noEmit`

Expected: PASS.

### Task 3: Create the PostgreSQL migration and enforce non-ORM constraints

**Files:**
- Create: `prisma/migrations/<timestamp>_product_database_foundation/migration.sql`
- Create: `test/database/product-constraints.integration.test.ts`
- Modify: `prisma/schema.prisma` only if migration validation reveals a missing relation or index declaration

**Interfaces:**
- Consumes: final Prisma schema from Task 2 and the M01 PostgreSQL constraint specification
- Produces: a migration that creates all 35 tables and rejects invalid direct SQL writes
- Produces: database errors mapped later by services; this task does not add API handlers

- [ ] **Step 1: Write failing integration tests for direct SQL constraint bypass**

```ts
it('rejects case-insensitive duplicate active world codes but allows a replacement after soft deletion', async () => {
  await insertWorld({ worldCd: 'Lux-Terra', delYn: 'N' });

  await expect(insertWorld({ worldCd: 'lux-terra', delYn: 'N' }))
    .rejects.toThrow();

  await softDeleteWorldByCode('Lux-Terra');

  await expect(insertWorld({ worldCd: 'lux-terra', delYn: 'N' }))
    .resolves.toBeDefined();
});

it('rejects a fourth category depth and an indirect parent cycle', async () => {
  const root = await insertCategory({ parentId: null });
  const child = await insertCategory({ parentId: root.id });
  const grandchild = await insertCategory({ parentId: child.id });

  await expect(insertCategory({ parentId: grandchild.id })).rejects.toThrow();
  await expect(updateCategoryParent(root.id, grandchild.id)).rejects.toThrow();
});
```

Make every fixture create an actual first operator first so its audit columns satisfy the schema.

- [ ] **Step 2: Generate an editable initial migration without applying it to a shared DB**

Run in PowerShell against an empty local development DB only after the master approves implementation:

```powershell
pnpm exec prisma migrate dev --create-only --name product_database_foundation --config prisma.config.ts
```

Expected: a single new migration directory with Prisma's generated table, basic FK, index, and enum SQL. Do not run `db push`; it would omit the reviewed migration history and custom SQL.

- [ ] **Step 3: Add database-only keys and checks to the generated migration**

Before naming any new trigger function or trigger, verify its physical identifier components in the common-standard-term Sheets source and record the verified names in the migration review. Do not invent a physical identifier.

Add these SQL groups after Prisma's table creation statements:

```sql
-- Representative row-local checks; apply the Y/N form to every applicable column.
CHECK (use_yn IN ('Y', 'N'));
CHECK (del_yn IN ('Y', 'N'));
CHECK (expry_dt > lgn_dt);
CHECK ((prj_id IS NULL) OR (world_id IS NOT NULL));

-- Representative slug uniqueness; use the exact mapped table and column names.
CREATE UNIQUE INDEX ON worlds (lower(world_cd)) WHERE del_yn = 'N';
CREATE UNIQUE INDEX ON prjs (world_id, lower(prj_cd)) WHERE del_yn = 'N';
```

Add `prjs(id, world_id)` as a non-partial unique target key. Add composite foreign keys from `docs(prj_id, world_id)` and project-scoped `admin_prmsn_ruls(prj_id, world_id)` to that target. Keep normal FK reference indexes on the referencing side.

Alter the template/current-revision and document/current-or-release-revision FKs to `DEFERRABLE INITIALLY DEFERRED`. Add a commit-time guard that a template current revision belongs to the same template and a document current or released revision belongs to the same document.

- [ ] **Step 4: Add scope, hierarchy, and relationship constraint triggers**

Implement these trigger groups exactly as the M01 specification defines:

```text
category_scope_and_tree:
  custom category project is immutable after insert
  parent is same-project custom category or system category
  recursive parent path has no self ID and depth is at most 3
  structure writes acquire a transaction advisory lock derived from project UUID

project_reference_scope:
  custom category/template belongs to the project reference
  project category template link belongs to its project and only root categories link a template

revision_scope:
  previous revision, persistent section, revision section, current revision and released revision stay in their own template/document lineage

document_and_relation_scope:
  document tag/link target and relation participant/reference/link document stay in the expected world
  relationship participant role belongs to the relation type

relation_participant_completion:
  deferred at commit; 2..4 participants, no repeated document, no duplicate non-repeatable role

invitation_and_withdrawal_scope:
  invitation project is in invitation world
  withdrawal succession world belongs to withdrawing admin and successor is that world's sub-admin
```

Do not encode active, deletion, permission, public-release, template-review, or category-movement-review status into these triggers. Services own those contextual checks; triggers preserve static scope and final cardinality.

- [ ] **Step 5: Apply the migration only to the protected test database and run constraint tests**

Run in PowerShell:

```powershell
$env:DATABASE_URL = $env:TEST_DATABASE_URL
pnpm prisma:migrate:deploy
pnpm vitest run test/database/product-constraints.integration.test.ts
```

Expected: migration PASS; each direct duplicate, cross-world reference, depth-four, cycle, wrong current revision, incomplete relation, and invalid role write FAILS inside the test while valid fixtures commit.

### Task 4: Add versioned catalog data and pure catalog validation

**Files:**
- Create: `server/catalog/v1/manifest.json`
- Create: `server/catalog/v1/categories.json`
- Create: `server/catalog/v1/relation-types.json`
- Create: `server/catalog/v1/templates.json`
- Create: `server/catalog/catalog.types.ts`
- Create: `server/catalog/validate-system-catalog.ts`
- Create: `test/database/system-catalog.test.ts`

**Interfaces:**
- Produces: `TSystemCatalogV1`, `TSystemCategory`, `TSystemRelationType`, `TSystemTemplate`
- Produces: `onValidateSystemCatalog(catalog: TSystemCatalogV1): void`
- Consumes: frozen Yggdrasil source, source SHA-256, exact counts 97/936/2,813/11

- [ ] **Step 1: Write failing pure validator tests**

```ts
it('accepts the frozen v1 counts and rejects a missing role', () => {
  expect(() => onValidateSystemCatalog(validCatalog)).not.toThrow();

  expect(() => onValidateSystemCatalog({
    ...validCatalog,
    relationTypes: validCatalog.relationTypes.slice(1),
  })).toThrow('936');
});

it('rejects a category parent that is not in the catalog', () => {
  expect(() => onValidateSystemCatalog({
    ...validCatalog,
    categories: [{
      categoryCode: 'person',
      parentCategoryCode: 'not-present',
      sequence: 1,
      name: '인물',
    }],
  })).toThrow('parentCategoryCode');
});
```

- [ ] **Step 2: Run the focused test and confirm its imports do not exist yet**

Run: `pnpm vitest run test/database/system-catalog.test.ts`

Expected: FAIL because catalog types and validator do not exist.

- [ ] **Step 3: Convert the frozen source into repository-owned v1 JSON**

Read the exact sources named in `2026-09-10-m01-default-data-source-design.md`. Write source path, SHA-256, catalog version, and all expected counts into `manifest.json`. Preserve only these system definitions:

```text
categories.json: 97 common categories, code, name, parent code, display sequence
relation-types.json: 936 COMMON relation types, 2,813 roles, role order/repetition rule, allowed category codes
templates.json: 11 common templates, persistent section code/label/sequence/level/required flag,
                category-code to template-code default mapping
```

Exclude all real world/project/document rows and Luxterra/Eldros extension inputs. Do not execute historical PostgreSQL or SQLite seed SQL.

- [ ] **Step 4: Implement schema validation before any DB write**

```ts
export const onValidateSystemCatalog = (
  catalog: TSystemCatalogV1,
): void => {
  if (catalog.categories.length !== 97) {
    throw new Error('System category count must be 97.');
  }

  if (catalog.relationTypes.length !== 936) {
    throw new Error('System relation type count must be 936.');
  }

  const roleCount = catalog.relationTypes.reduce(
    (count, relationType) => count + relationType.roles.length,
    0,
  );

  if (roleCount !== 2813) {
    throw new Error('System relation role count must be 2813.');
  }

  if (catalog.templates.length !== 11) {
    throw new Error('System template count must be 11.');
  }
};
```

Extend this validator to reject duplicate immutable codes, missing parent codes, duplicate role codes per type, unknown allowed category codes, invalid template first section, invalid template last section, duplicate section codes, and category-template mappings that do not cover exactly the 11 common main categories.

- [ ] **Step 5: Run catalog validation tests**

Run: `pnpm vitest run test/database/system-catalog.test.ts`

Expected: PASS for the frozen snapshot and FAIL for each malformed fixture.

### Task 5: Implement bootstrap credentials, catalog seed, and non-HTTP CLI entry points

**Files:**
- Modify: `package.json`
- Modify: `server/db/client.ts`
- Create: `server/bootstrap/bootstrap.types.ts`
- Create: `server/bootstrap/password.ts`
- Create: `server/bootstrap/bootstrap-environment.ts`
- Create: `server/bootstrap/system-seed.ts`
- Create: `server/bootstrap/bootstrap-database.ts`
- Create: `scripts/db/bootstrap.ts`
- Create: `scripts/db/seed-system.ts`
- Create: `test/database/bootstrap-environment.test.ts`
- Create: `test/database/bootstrap-database.integration.test.ts`

**Interfaces:**
- Produces: `TBootstrapInput`, `TBootstrapResult`, `TSystemSeedInput`, `TSystemSeedResult`
- Produces: `onReadBootstrapInput(environment: NodeJS.ProcessEnv): TBootstrapInput`
- Produces: `onValidateBootstrapPassword(value: string): void`
- Produces: `onHashBootstrapPassword(value: string): Promise<string>`
- Produces: `onBootstrapDatabase(client: PrismaClient, input: TBootstrapInput): Promise<TBootstrapResult>`
- Produces: `onSeedSystemCatalog(client: PrismaClient, input: TSystemSeedInput): Promise<TSystemSeedResult>`
- Consumes: Task 2 delegates, Task 3 DB constraints, Task 4 validated catalog

- [ ] **Step 1: Write failing tests for secret handling and first-operator semantics**

```ts
it('does not include the bootstrap password in validation errors', () => {
  expect(() => onReadBootstrapInput({
    BOOTSTRAP_OPERATOR_EMAIL: 'operator@example.com',
    BOOTSTRAP_OPERATOR_DISPLAY_NAME: '운영자',
    BOOTSTRAP_OPERATOR_PASSWORD: 'short',
  })).toThrow('BOOTSTRAP_OPERATOR_PASSWORD does not satisfy the password policy.');
});

it('creates exactly one initial operator and marks it as temporary-password only', async () => {
  const result = await onBootstrapDatabase(client, input);
  const admins = await client.admin.findMany();

  expect(result.status).toBe('initialized');
  expect(admins).toHaveLength(1);
  expect(admins[0]?.creatrId).toBeNull();
  expect(admins[0]?.tmprPswdYn).toBe('Y');
  expect(admins[0]?.pswdHash).not.toBe(input.password);
});
```

- [ ] **Step 2: Run bootstrap tests and confirm they fail before implementation**

Run: `pnpm vitest run test/database/bootstrap-environment.test.ts test/database/bootstrap-database.integration.test.ts`

Expected: FAIL because bootstrap modules and CLI entry points do not exist.

- [ ] **Step 3: Implement password and environment helpers without secret output**

Use Argon2id and return its PHC string. Reject values unless they are 8–128 non-whitespace ASCII characters and contain at least one digit, lower-case English letter, upper-case English letter, and special character.

```ts
export const onValidateBootstrapPassword = (
  value: string,
): void => {
  const isValid = /^(?=.{8,128}$)(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[^0-9A-Za-z\s])[!-~]+$/.test(value);

  if (!isValid) {
    throw new Error('BOOTSTRAP_OPERATOR_PASSWORD does not satisfy the password policy.');
  }
};
```

Add the Argon2id package as an explicit runtime dependency. Verify its selected package can produce `argon2id` PHC strings in the project Node runtime before using it in bootstrap. Do not add a password to any example environment file or test snapshot.

- [ ] **Step 4: Implement the atomic bootstrap flow**

Acquire one transaction-level PostgreSQL advisory lock for bootstrap before inspecting data. Inside one Prisma interactive transaction:

```ts
export type TBootstrapResult = {
  status: 'initialized' | 'already_initialized';
  categoryCount: number;
  relationTypeCount: number;
  relationRoleCount: number;
  templateCount: number;
};
```

For an empty `admins` and empty system catalog, insert the initial `Admin` with `creatrId: null`, then one global `AdminRole`, then one global `AdminPermissionRule` with each of the 24 permission fields `Y`. Pass the new admin ID as `actorAdminId` to the catalog seed so every system row has that creator. If any catalog insertion or validation fails, let the interactive transaction roll back all rows.

If the configured bootstrap operator plus the complete catalog already match, return `already_initialized` without writes. If only one side exists or any immutable catalog item differs, throw without writing. Never create a replacement administrator or reset a password on rerun.

- [ ] **Step 5: Implement idempotent system-seed behavior and CLI wrappers**

`onSeedSystemCatalog` must require an existing active global operator resolved by `SYSTEM_SEED_ACTOR_EMAIL`. For every immutable system code:

```text
absent in DB                  -> insert with actorAdminId
present and equal to snapshot -> no write
present but differs           -> throw before any catalog row changes
DB-only system code           -> throw before any catalog row changes
```

The bootstrap CLI calls `onReadBootstrapInput(process.env)` and prints only result status and four counts. The system-seed CLI reads `SYSTEM_SEED_ACTOR_EMAIL`, validates the catalog before DB work, and prints only status and counts. Neither CLI is imported by a Nitro handler.

- [ ] **Step 6: Run bootstrap and seed tests**

Run: `pnpm vitest run test/database/bootstrap-environment.test.ts test/database/bootstrap-database.integration.test.ts`

Expected: PASS for initial bootstrap, repeat bootstrap, repeat system seed, invalid password, partial DB refusal, and snapshot mismatch refusal.

### Task 6: Verify full DB behavior against a disposable PostgreSQL database

**Files:**
- Modify: `test/database/product-constraints.integration.test.ts`
- Modify: `test/database/bootstrap-database.integration.test.ts`
- Modify: `docs/work-design/omninode-progress.md`

**Interfaces:**
- Consumes: complete migration, bootstrap CLI service, catalog snapshot
- Produces: evidence that all M02 schema, constraint, catalog, bootstrap, and safety requirements work in a test database

- [ ] **Step 1: Add failing integration tests for the remaining required invariants**

```ts
it('creates template and initial revision in one transaction but rejects a current revision from another template', async () => {
  await expect(createTemplateWithInitialRevision(fixture)).resolves.toBeDefined();
  await expect(pointTemplateAtAnotherTemplatesRevision()).rejects.toThrow();
});

it('rejects a relation with fewer than two or more than four participants at commit', async () => {
  await expect(createRelationWithParticipantCount(1)).rejects.toThrow();
  await expect(createRelationWithParticipantCount(5)).rejects.toThrow();
  await expect(createRelationWithParticipantCount(2)).resolves.toBeDefined();
});

it('leaves no actual world, project, document, or project-default reference after bootstrap', async () => {
  await onBootstrapDatabase(client, input);

  await expect(client.world.count()).resolves.toBe(0);
  await expect(client.project.count()).resolves.toBe(0);
  await expect(client.document.count()).resolves.toBe(0);
  await expect(client.projectCategory.count()).resolves.toBe(0);
  await expect(client.projectTemplate.count()).resolves.toBe(0);
});
```

- [ ] **Step 2: Apply migrations to a freshly reset protected test database**

Run in PowerShell:

```powershell
if (-not $env:TEST_DATABASE_URL) { throw 'TEST_DATABASE_URL is required.' }
if ($env:TEST_DATABASE_URL -notmatch '/[^/?]+_test(?:\?|$)') { throw 'TEST_DATABASE_URL must target a database ending in _test.' }
$env:DATABASE_URL = $env:TEST_DATABASE_URL
pnpm prisma:migrate:deploy
```

Expected: PASS only for a test database name ending in `_test`.

- [ ] **Step 3: Run all database tests**

Run: `pnpm test:db`

Expected: PASS for schema contract, safety guard, catalog validation, custom PostgreSQL constraints, bootstrap, rerun, and mismatch behavior.

- [ ] **Step 4: Run repository-wide verification**

Run: `pnpm prisma:validate && pnpm prisma:generate && pnpm lint && pnpm exec vue-tsc --noEmit && pnpm test && pnpm build`

Expected: all commands PASS. If a pre-existing unrelated failure appears, re-run the focused changed-file or changed-suite command and record the exact unrelated failure separately.

- [ ] **Step 5: Update the public progress record only with verified results**

Change `DATA-02` to `완료` only when the migration, bootstrap, seed, DB integration tests, lint, type check, test suite, and build have all passed. Record the exact commands and counts in `docs/work-design/omninode-progress.md`; otherwise keep it `진행 중` or `검증 중` with the remaining failed command.

## Plan Self-Review

### Spec coverage

| M01 requirement | Plan task |
| --- | --- |
| 35-table Prisma conversion and UUID v7 common columns | Task 2 |
| Prisma/PostgreSQL/service constraint split | Tasks 2 and 3 |
| soft-delete uniqueness and case-insensitive slugs | Task 3 |
| scope integrity, category depth, deferred revisions, relationship cardinality | Task 3 and Task 6 |
| frozen 97/936/2,813/11 default data | Task 4 |
| first operator, temporary password, creator exception, atomic seed | Task 5 |
| no secret leakage, explicit commands, test DB safety | Tasks 1 and 5 |
| rerun, conflict, and full verification evidence | Task 6 |

### Placeholder scan

The plan contains no prohibited placeholder wording or unqualified test-writing step. Dynamic migration timestamps and common-standard physical trigger names are intentionally resolved at execution time because the project rule requires current standard-term verification before a new physical identifier is created.

### Type consistency

`onRequireTestDatabaseUrl` is introduced in Task 1; all test-only clients rely on it. Task 4 introduces `onValidateSystemCatalog`, Task 5 consumes it through `onSeedSystemCatalog`, and `onBootstrapDatabase` calls the same seed implementation inside its transaction. `DB.client()` replaces the removed temporary `DB.users()` delegate in Task 2 before bootstrap code uses a general client.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-10-m02-product-database-foundation.md`. Implementation is not started by this plan. On the master’s implementation approval, execute the tasks inline in this task, with a review and verification checkpoint after each task.
