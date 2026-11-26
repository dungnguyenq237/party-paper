# Validation and production release gates

On Node 24.22.3 with locked dependencies, all 58 Node tests and posttest succeeded. The local Chromium suite **passed 20 of 21 tests**. Tamil (`ta`) at 320 CSS pixels reported scrollWidth 326 vs allowed 321. A targeted repeat reproduced 326. The 390 px sweep and remaining checks passed. CI at the audited revision reported success. Independent review inspected [PR merge-check logs](https://github.com/dungnguyenq237/party-paper/actions/runs/45757135648/job/139698298930): merge SHA 35e42c05d1fd8c7d0837c5cbbf457ff3f09ce4ff, Node 24.22.3, Chromium 158.0.8127.18, 58 Node + 21 browser passes. Earlier interrupted independent review reported local 58/58 and 20/21, Tamil 325px, settings grid intrinsic size implicated. Raw local logs/browser version unavailable after interruption; resumed container cannot resolve github.com to clone. No fresh local test claimed; defect unresolved. Investigate viewport/font metrics under both environments before changing layout. Preserve the assertion. Existing mixed-project preview JSON is historical. [Audited CI](https://github.com/dungnguyenq237/party-paper/actions/runs/44835568172) · [Browser test](../../e2e/playwright.spec.mjs)

## Commands and ownership

Existing commands run today. The rest are **proposed npm scripts** the indicated task must create before the corresponding gate can pass. Publish script usage, CI artifact location and pinned tool/browser versions. Never treat a proposed command as a green check.

| Run | Owner and acceptance |
|---|---|
| `npm ci && npm test` | Existing core/print/locale/ad guard suite and SEO copy step pass. |
| `npx playwright install --with-deps chromium && npm run test:e2e` | Existing routes, drafts, export/PDF, narrow RTL, denied storage, print-only output and query links. Also run at a project subpath. For the baseline issue run `npm run test:e2e -- --grep 'all 38 locales fit 320px'`. |
| `npm run check:types && npm run build:live` | F1 introduces strict compilation, separate public/server manifests and allowlisted assets. Old routes load without the new backend. |
| `npm run test:contracts` | F2 checks schemas, previous-protocol negotiation, stable seed, all viewer projections, public bundle exclusions and phase-scoped receipt deduplication. |
| `npm run test:rooms` | F3 uses real sockets and a temporary SQLite file. Create/join/ready/start, two concurrent submissions and a trade collision, duplicate ack, host loss, revoked seat, same-browser refresh, crash between commit and send, startup with old snapshot, expired room and cleanup. |
| `npm run test:game -- <slug>` | Each game team implements Node unit fixtures for all actions, powers, minimum/maximum seats, win/loss/ties, all-pass, timeouts, no-op invalids, reset and hand secrecy. Use each GDD's examples as named fixtures. |
| `npm run simulate -- <slug> --seeds 1000` | Seeded stateful command generation using Node tests initially. Record seed, failing sequence, minimized trace and engine version. Valid games terminate by their turn/lease bound, arithmetic bounded and deterministic, resource equations balance, no unsafe reveal. |
| `npm run test:e2e:live -- <slug>` | Two to twelve independent Playwright contexts (use game minimum, then boundary fixtures), real backend and storage. Compare public state at equal revisions, kill/reconnect host, rematch, keyboard-only play and narrow EN/VI UI. For Wedding use browsers for MC/display/table and socket clients for scale. |
| `npm run check:content && npm run check:public` | P1/A1 validate pack references, locale tokens, answer solvability, content licensing/provenance, accessibility alternatives, one H1, titles, sitemaps, alternate pairs, no secrets in public files. Crawl routes with JS disabled. |
| `npm run test:load -- --rooms 50 --players 6` and `npm run test:load -- --event 300 --burst 5` | O1 uses synthetic local/staging clients with no production data. Start with 10 rooms and 40 guests, then 100 and 300, then test the cost model's full overlap independently. Record region, host tier, connection count, memory, CPU, disk, egress, expiry lag and backpressure. |
| `npm run test:restore` and `npm run test:retention` | O1 restarts intact synthetic DB across compatible migration, resolves at most one elapsed phase, then separately simulates lost/rolled-back disk and proves stale credentials, deleted rooms and withdrawn grants never revive. Validate retention/alarm; media purge belongs to V1. No personally identifying test fixtures. |

## Product-specific acceptance

| Module | Required invariant / beyond example tests |
|---|---|
| Friend Court | Exactly two advocacy turns per seat, tie/pass rules at four seats, jury only, server never sends a ballot map. |
| Corporate Chaos | Raw base effort always 2N, role modifications explain the difference, runway bounded, no double bonus, every mandate attainable for all seat counts. |
| Night Market | Incoming goods + starting hand = sales + waste + closing hand after net trades. Accepted offers swap exactly once and no negative inventory. |
| Cold Case | ID graph and evidence survive locale change, distinct clue pairs support each conclusion, missing holder cannot lock the case, no private solutions in public assets. |
| Inheritance War | Every lot has one final custodian, spent influence cannot be reused, fallback/archive and tie paths always terminate. |
| Wedding Arena | Per-round frozen denominator, one seat answer, co-host only, no duplicate points on void, projector sees no answer key. Rehearse venue loss and reconnect storm. |
| Voice Telephone | Real iOS Safari and Android Chrome exchange audio in both directions, permission refusal runs text match, old/revoked grant fails, deletion lag bounded. Verify container mismatch/oversize refusal and accessible text mode. |
| AI Battle Arena | Actual pre-generated versioned corpus, same recipe same output, objective parity, 2-player voting exception, zero live inference. Funded extension must enforce quotas on duplicate/abandoned calls. |

## Interpreting results

During rehearsal, target regional p95 click-to-ack <=750 ms in ordinary rooms and <=1.5 s for a 300-answer/5 s burst. These keep feedback within an action beat and leave most of a 30 s quiz for guests. Compare server commit latency to end-to-end mobile RTT. No lost acknowledged actions, duplicated scores or forbidden field is acceptable. Soak 60 minutes at target concurrency, run a reconnect burst, then two-hour churn including expirations. Seek <75% sustained memory/CPU on the chosen tier for burst/recovery headroom. If a threshold fails, publish the lower measured cap. Initial client budget <=100 KiB compressed JS for the live shell plus one small game's first view, excluding on-demand media. Report transfer, long tasks and LCP on a low-end Android/slow network. Require landing instructions and navigation before game JS.

Balance checks use strategies described per GDD, seeded seat permutations and confidence intervals for win share by seat/role. A reproducible seat advantage, unwinnable pledge or broadly dominant strategy blocks ranked release even if unit tests pass. Human mixed-language and accessibility sessions remain essential for humour and deduction. Test keyboard focus, screen-reader announcements, zoom 200%, loss of storage, reduced motion, 320 px and a physical phone. Exercise join/start/play/reconnect/rematch with the ads adapter blocked. [Release checklist](IMPLEMENTATION_ROADMAP.md)

## Review counterexamples (IR-C01–02, IR-H01–06)

Tamil F1: record OS/browser/version/fonts, locale, viewport/clientWidth/scrollWidth and first overflowing rectangles after document.fonts.ready; compare same setup before/after. Current test measures after locale change without waiting for fonts. Candidate minmax(0,1fr) workspace grid and/or .settings { min-width:0 } with actual control wrapping; no blanket overflow:hidden. Run all 38 at 320/390, after generation, RTL/dark/print and physical phone.

Add deterministic seeded reducer hashes/explicit clock, phase/match epoch rollover, exact deadline, queued kick vs vote, host change vs start, stale timer/socket, two tabs, duplicate ID/different body, grace race/all-offline, quota/DB failure, crash after commit before ACK, skipped full snapshot rev, old-match frame, unavailable pack/reader, concurrent rooms and slow consumer. Assert no unauthorized mutation, receipt or hidden sentinel in projections/errors/logs. Synthetic exclusive-resource contention in F3/R2; actual trade at G4, not required for S1. Cookie-disabled recovery, keyboard/screen reader, iOS/Android, old static URL with live disabled, private path traversal, runtime migrations. New scripts/scenarios are requirements, not passing tests.
