# Delivery ledger

Planning baseline established on 26 November 2026. Audited source SHA e76f4f4b82b587eb30c3dd6f93f2711d5cf28be8. **Planning merged; F1 merged; owner authorized local-only F2/F3 and a static review preview. S1 remains gated by P0 human comparison.** Current evidence includes the repository audit, desk research, eight proposed GDDs, baseline unit/Chromium results and design review. Planning validation resolved all 145 internal Markdown references from the 26 documents and rendered all 11 Mermaid diagrams to SVG. No hosted pilot, case sale, capacity promise, paid deployment, live inference or ad activation has been verified.

| Tasks | Status | Evidence or blocker | Next action when authorized |
|---|---|---|---|
| P0 | Planning corrections requested by owner; field evidence pending | [Executive decision](MASTER_PLAN.md), [open assumptions](RISKS.md) | Record review, operator/domain facts, budget and staffed pilot dates. |
| F1 | Merged | PR #3; CI 63 unit / 24 browser checks passed on F1 | Preserve explicit public artifact boundary. |
| F2 | Review | Provisional typed schemas, strict runtime validation, deterministic fixture and private views | Review integration checks; do not freeze broader engine contracts before R2. |
| F3 | Review | Local HTTP/WS and SQLite synthetic fixture, real transport tests, browser recovery coverage; see receipt below | Review actual CI and local-only limitations. No hosted pilot. |
| P1, A1, I1 | Queued | Contract and content dependencies in [backlog](TASK_BACKLOG.md) | Build shell and static rules independently · integrate after first slice. |
| S1, R1, O1, L1 | Queued | [Friend Court](../games/friend-court.md), no pilot evidence | Complete selected slice, provisional R1, rehearse intact restart/lost-disk abandonment then invite pilot. |
| G2 | Conditional | R1 + accepted L1 | Second executable engine and fixtures. |
| R2 | Conditional | G2 + accepted L1 | Two-engine and contested-action contract gate. |
| G3, G4, G5 | Conditional | R2 + title-specific demand | Implement only when justified, one limited release at a time. |
| G6/E1, G7/V1, G8/C1 | Conditional | R2; venue ops, text-first/optional media, corpus proof respectively | Produce per-specialty release evidence. |
| B1 | Conditional | No demonstrated buyer or commercial support owner | Test paid intent and quantify support before checkout work. |

## Resume and reporting

Integrator edits the ledger at each checkpoint. Split a row when a task starts. Record task ID, status (queued/active/blocked/review/verified/released/retired), accountable owner, worktree branch, base and last commit SHA, exact files, commands/seed, evidence link, reviewer, blocker, next command, rollback version and update date. Keep sensitive traces/keys, private content and participant data out of the repository. A PR that passes tests is “verified” only after reviewer signoff. “Released” requires deploy version, enabled cap and a completed end-to-end production smoke using a private test room. An interruption is resumable from the last SHA and evidence. Compare current main and rerun the failing command before changing shared contracts.

**The product owner reviews** the planning PR and chooses approve, revise or hold. Record the decision and scoped service budget before application work begins.

## Independent review receipt

Original PR #1 head `1e1783d017b2d33158eb865ac076e0bbf341bcf3`, parent main `e76f4f4b82b587eb30c3dd6f93f2711d5cf28be8`. Owner requested planning corrections; see [independent review](INDEPENDENT_REVIEW.md) and D11–D15. No application code, paid service, deployment or game implementation changed. Prior review inspected PR merge-check log with 58 Node and 21 Chromium passes; local Tamil failure remains unresolved. No fresh local execution claimed in resumed environment. Render service configuration requires owner workspace confirmation, invoice and AdSense dashboard unknown. Next action: P0 candidate tests and hosting/retention/budget evidence, then explicit F1 authorization. No automatic merge.

## F2/F3 review receipt — 26 November 2026

Owner authorized F1 ahead of comparative P0, then authorized F2/F3 and GitHub Pages preview. Existing main `53749592f562d0f1c3a5704c4ba9621bc094919f` contains merged F1. Branch `feat/f2-f3-room-foundation` implements provisional wire types and runtime validators in src/contracts, synthetic sealed-choice and contention logic in src/platform/server, migration 001, local HTTP/WS entry in scripts/room-server.mjs, tests/live and independent-browser/Room Lab checks in e2e/room-lab.spec.mjs. [Reference-led workflow](GAME_DEVELOPMENT_WORKFLOW.md) is adopted; no external example assets or code copied.

Run Node 24.22.3, `npm ci`, `npm test`, `npm run typecheck`, `npm run test:live`, `npx playwright install chromium`, `npm run test:e2e`. Local-only transport: `npm run serve:live` binds 127.0.0.1:8766; POST /api/session, /api/rooms, /api/join, /api/rooms/:id/socket-ticket; /ws requires authenticated session and first-frame ticket. Local HTTP cookies intentionally lack Secure; public HTTPS/WSS and production cookie setup are not enabled. To discard all transient state after known stale-volume restore, use `npm run build:live && node scripts/room-server.mjs --discard-transient` with the intended local DB after stopping the existing writer. This is an explicit destructive recovery operation, not automatic stale-volume detection. Never restore a production guest DB blindly.

CI [initial integration run](https://github.com/dungnguyenq237/party-paper/actions/runs/45774698640) succeeded; full browser acceptance added at source `ae67929ab3246714e0c0b195ebf8ca7755bd66c6` ([run](https://github.com/dungnguyenq237/party-paper/actions/runs/45774794526)). The new run must be checked before merge. [Pages deployment](https://github.com/dungnguyenq237/party-paper/actions/runs/45774828794) succeeded for public-only branch commit `e3e839b20135c19b426a2d9a76dae253bac27fa7` (70 existing public blobs unchanged + 3 original lab files). [Room Lab](https://dungnguyenq237.github.io/party-paper/review/room-lab/) is a synthetic EN/VI single-browser demonstration, not a real room, full game, or multiplayer/privacy test. No storage or network activity in lab logic. It is not in Render dist, public game catalog or sitemap. Roll back preview by creating a revert of that Pages commit or publishing its prior public tree; never change main or Render merely to roll back a preview. Actual browser accessibility, crash/restore and production capacity remain separate acceptance gates. F2/F3 remain in review pending CI and independent owner review; no production release. P0 six human comparative groups outstanding; P1 and S1 not implemented. No new resources or incremental infrastructure spending.
