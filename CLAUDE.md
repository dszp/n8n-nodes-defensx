# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run build` — Regenerates OpenAPI data (`tools/generate-openapi.cjs`), compiles TypeScript from `src/` to `dist/`, and copies the `DefensX.svg` icon into `dist/nodes/DefensX/` and `dist/credentials/`. **Always run a build after changing `src/` or the OpenAPI spec** — n8n loads the package from `dist/`.
- `npm run generate:openapi` — Regenerates `src/generated/openapi.generated.ts` from `tools/openapi/defensx-partner.yaml` without a full TypeScript compile.
- `npm run dev` — `tsc --watch` (does not re-run `generate:openapi`; re-run that manually when the YAML spec changes).
- `npm link` then `npm link n8n-nodes-defensx` in your n8n install to load the node locally.

There is no test or lint script configured. CI (`.github/workflows/ci.yml`) only runs `npm run build` on PRs to `main`.

## Release flow

- Publishing is triggered by a GitHub Release (or manual `workflow_dispatch` with a tag), not by `npm publish` from a developer machine. See `.github/workflows/release-publish.yml`.
- The workflow **verifies the git tag matches `package.json` version** and publishes via npm Trusted Publishing (OIDC, `--provenance`). Bump `package.json` before tagging, or the publish job fails.
- `CHANGELOG.md` follows Keep a Changelog. When updating it, follow `.windsurf/workflows/update-changelog-md.md`: add to the in-progress `[Unreleased]` / current-version entry, bumping date to today if needed. Do not invent a new version header just for an intermediate change.

## Architecture

This is an n8n community node for the DefensX Partner API. The package ships a single programmatic node plus credential type:

- `src/credentials/DefensXApi.credentials.ts` — Credential with `apiRoot` + `apiKey`. Auth is `Authorization: Bearer <apiKey>`. The credential **test request hits `/api/partner/v1/status`** and strips a trailing `/api/partner/v1` from user-entered roots so both forms work.
- `src/nodes/DefensX/DefensX.node.ts` — The `DefensX` node class. Two execution modes (selected by the `resource` dropdown):
  - `resource === 'raw'` → Raw Request / Custom API Query. User supplies method, endpoint under `/api/partner/v1`, query JSON, body JSON.
  - Any other resource → Drives the OpenAPI-generated operation machinery.

### OpenAPI-driven UI pipeline

The node's resource/operation/parameter UI is generated from the DefensX OpenAPI spec. The pipeline is:

1. **Spec** — `tools/openapi/defensx-partner.yaml` (vendored from DefensX).
2. **Code generator** — `tools/generate-openapi.cjs` parses the YAML, resolves `$ref`s, extracts `path` + `query` parameters and JSON request bodies, derives stable IDs (either the spec's `operationId` or `METHOD_path_with_by_param`), adds date-format hints, and writes `src/generated/openapi.generated.ts` as a single exported `generatedOperations` array. **Never hand-edit `src/generated/openapi.generated.ts`** — re-run the generator.
3. **UI builder** — `src/nodes/DefensX/openapiProperties.ts` reads `generatedOperations`, applies `src/overrides/openapiOverrides.ts` (per-operationId renames or hides), and builds n8n `INodeProperties` for the Resource dropdown, the Operation dropdown (one per resource, with `displayOptions.show.resource` gating), and every path/query/body field. Field names follow the pattern `{in}_{sanitizedOperationId}_{sanitizedParamName}` — use `getParamName(prefix, opId, name)` to look them up at runtime.
4. **Dynamic load options** — `methods.loadOptions` on the node class exposes `getCustomerOptions`, `getBrowserExtensionOptions`, `getPolicyGroupOptions`. These call the API themselves using `helpers.httpRequestWithAuthentication` (or the legacy `requestWithAuthentication`) and depend on `getCurrentNodeParameter('operation')` plus the already-selected customer field.

### Customizing an operation

Prefer overrides over code changes:

- Hide an endpoint from the UI → add `{ hidden: true }` to `operationOverrides` keyed by operationId.
- Rename an operation or move it to a different resource → `operationName` / `resourceName` in the same override map.
- Change how responses are split → the node's execute loop in `DefensX.node.ts` has per-operation branches (see the `isUsageOperation`, `isLogsOperation`, `isUsersListOperation`, `isBrowserExtensionsListOperation`, `shouldSkipPaginationParam`, `enrichResponseWithId`, `extractUsageBySubscriptions` helpers). Pagination, special response shapes, and ID-enrichment (e.g. injecting `customerId` into browser-extension items) live here rather than in the generator.

### Output modes

For non-raw operations the node exposes `outputMode`: `items` (one n8n item per array element; objects passed through, primitives wrapped as `{ value }`) or `raw` (full response as single item; arrays/primitives wrapped as `{ items }`). Raw Request always returns a single item.

### Error handling

`formatDefensXError` produces friendlier messages for 401/403 (mentioning IP allowlist as a likely cause). Use it whenever raising `NodeOperationError` from a request path.

## Conventions

- **TypeScript strict mode is off** (`tsconfig.json`) — the codebase uses `any` casts around n8n helper typing deliberately (`helpersAny`, `requestWithAuth`) because `httpRequestWithAuthentication` vs. legacy `requestWithAuthentication` varies across n8n versions. Keep that compatibility shim.
- Resource label normalization (`URL` / `URLs` casing, `of` lowercase, `ID` uppercase) happens in multiple places — if you add a new label transform, update both `openapiProperties.ts` (`normalizeLabel`, `toTitleCaseWord`) and `openapiUi.ts` (`normalizeResourceName`) so the Resource dropdown and the operation UI stay consistent.
- The Raw Request resource value is the literal string `'raw'`; operation IDs for generated operations come from the spec and must not collide with it.
- `src/index.ts` only re-exports the credential and node classes; the `n8n` block in `package.json` is what n8n actually loads, and it points at compiled `dist/` paths.

## Reference docs

- DefensX Partner API: https://kb.defensx.com/docs/categories/72-Partner-API/topics/91d5908c-ee58-4e51-8397-ba6823407ff8
- n8n node-building guide (extensive): `.windsurf/rules/n8n-nodes-building-guide.md`
- Planned improvements: `ROADMAP.md`

# Additional Behavior Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.