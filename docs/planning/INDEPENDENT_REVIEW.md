# Independent architecture and product review

26 November 2026 · **CONDITIONAL GO for corrected planning and P0 discovery; application implementation remains gated.** Owner requested all planning corrections in the independent review branch. This is not proof of hosting, playtest or commercial readiness.

## Baseline and evidence

[PR #1](https://github.com/dungnguyenq237/party-paper/pull/1), planning head `1e1783d017b2d33158eb865ac076e0bbf341bcf3`, parent main `e76f4f4b82b587eb30c3dd6f93f2711d5cf28be8`. All 26 original documents reviewed, together with baseline source. Retain one catalog, modular monolith, Node 24, WebSocket, single SQLite writer, per-viewer projections, deterministic rules, strict new TS, static legacy print and EN/VI live UI. No generic engine, permanent event sourcing, Redis, microservices, accounts, billing or media runtime for first slice.

Verified source: [package](../../package.json) has no runtime dependencies or bundler; [SEO copy](../../prepare-seo.js) does not build entire application; [app](../../app.js) keeps drafts in memory, [i18n](../../assets/i18n.js) scans DOM, [core](../../core.js) and [print engine](../../assets/game-engine.js) intentionally expose local answers. [Privacy](../../privacy.html) promises local print processing, [ads config](../../assets/ads-config.json) is disabled/empty slot, [sitemap](../../sitemap.xml) identifies current Render canonicals. No backend, DB, auth or room protocol in main.

Earlier review inspected [PR merge-check logs](https://github.com/dungnguyenq237/party-paper/actions/runs/45757135648/job/139698298930) for merge SHA `35e42c05d1fd8c7d0837c5cbbf457ff3f09ce4ff`: 58/58 Node + posttest, 21/21 Chromium, Node 24.22.3/Chromium 158.0.8127.18. Earlier interrupted review reported local 58/58 and 20/21, Tamil width 325px at 320px with settings grid intrinsic sizing implicated; original author measured 326px. Raw local logs/browser unavailable in resumed environment; no fresh local execution claimed. No multiplayer tests exist. F1 must reproduce and repair, never weaken assertion. No app source changed in this review.

Provider evidence: [Render disks](https://render.com/docs/disks) paid, single instance, runtime only, no zero-downtime deploy, daily snapshots retained seven days; [free tier](https://render.com/docs/free) ephemeral storage and spin-down; [WebSocket](https://render.com/docs/websocket) reconnect/egress constraints; [SQLite backup API](https://sqlite.org/backup.html) consistent backups. Actual account service type, tariff, region, disk, deploy configuration and domain rights are unknown. Render connector requires workspace confirmation. [Pricing](https://render.com/pricing) illustrative only; no purchase/config changes.

## Findings and traceability

CRITICAL blocks planning approval; HIGH must be resolved before affected implementation; MEDIUM before affected milestone; LOW optional. These are planning defects or hypotheses, not confirmed exploits in nonexistent multiplayer code. Documentation correction does not mean implementation acceptance.

| ID / severity | Affected files and evidence | Why it matters | Concrete fix and impact | Blocks |
|---|---|---|---|---|
| IR-C01 CRITICAL | [Deployment](DEPLOYMENT.md), [Security](SECURITY.md), [Testing](TESTING.md): old backup can predate revocation markers. | Deleted state/credentials may resurrect. | Intact restart only for transient rooms; lost/rolled-back volume abandons matches and rotates guest namespace, commercial backup separate and consistent. F2/F3/O1 tests; D11. | Planning approval |
| IR-C02 CRITICAL | [Module](../contracts/game-module-contract.md), [Lifecycle](../contracts/room-lifecycle.md): apply/expire alone do not model system mutations. | Out-of-band writes, incompatible agents, leakage/races. | Trusted system events with deterministic clock, serialized mutation and generation keys. F2/F3 contracts, D12. | Planning approval |
| IR-H01 HIGH | [Wire](../contracts/multiplayer-events.md): receipt and epoch rules incomplete. | Stale frames, duplicate scoring/deadline races. | Explicit epochs, room revision, semantic digest, auth before receipt, deadline queue precedence and skip-safe snapshots. F2/F3. | F2 |
| IR-H02 HIGH | [Wire](../contracts/multiplayer-events.md), [Security](SECURITY.md): replacement insufficient for queued stale writes. | Old/kicked seat can mutate; socket exhaustion. | Generation fence in transaction; atomic ticket consume, bounded frames/queues/pre-auth connections and private errors. F2/F3/O1. | F2/F3 |
| IR-H03 HIGH | [Architecture](ARCHITECTURE.md), [Deployment](DEPLOYMENT.md), SEO copy script and root Pages. | Exposed server files, lost existing URLs, runtime mount and downtime constraints. | Explicit artifact allowlist, safe separate live origin if needed, runtime migrations/manual drain, verify actual Render facts. F1/O1, D14. | F1 |
| IR-H04 HIGH | [Security](SECURITY.md), current privacy and GitHub public support. | Networked user text requires different privacy/reporting. | Scoped notice, private report channel, operator/age policy, no private logs/share/analytics, concealment. | External pilot; design F2 |
| IR-H05 HIGH | [Roadmap](IMPLEMENTATION_ROADMAP.md), [Backlog](TASK_BACKLOG.md), D02/D05: freeze after first game then seven branches. | One game cannot validate different engine semantics; solo review bottleneck. | R1 provisional, L1 accepted, G2 executable second engine, R2 contention/compatibility, WIP one then two. D13. | Broad implementation |
| IR-H06 HIGH | [Deployment](DEPLOYMENT.md), [Architecture](ARCHITECTURE.md): unmeasured snapshots/egress and capacity. | Quadratic fan-out, SQLite/Node bottleneck, surprise cost. | Private ACK, interested/coalesced views, measured bytes/fsync/queue/RTT and caps. F3/O1. | Public pilot |
| IR-H07 HIGH | [Friend Court](../games/friend-court.md), [Market](MARKET_RESEARCH.md): first game selection without field evidence; Rebut!/Argumento/Courtroom alternatives. | Engineering simplicity is not demand; jury downtime and coalition voting. | P0 comparative paper play, provisional 4–6 pilot, L1 independent-group metrics; D13. | Pilot selection |
| IR-H08 HIGH | [Wedding](../games/wedding-arena.md): duplicate seats prevented only reactively. | Scoring manipulation and reputational risk. | Admission entitlements/roster, frozen denominators, minimum ranked table size, operator fencing and void test. D15. | G6 only |
| IR-M01 MEDIUM | [E2E](../../e2e/playwright.spec.mjs), [CSS](../../assets/interface.css): Tamil overflow and immediate locale measurement. | Legacy regression. | F1 record font/browser/rect metrics, narrow min-size/wrap fix, all 38 locales 320/390, RTL/dark/print. | F1 completion |
| IR-M02 MEDIUM | [SEO](SEO_AND_GROWTH.md), [Monetization](MONETIZATION.md), [Analytics](ANALYTICS.md): approval and acquisition unverified. | Thin pages and speculative revenue. | Preserve canonicals, substantive localized guides, ads off, dashboard/consent/actual acquisition checks and cohort denominators. | I1/L1 or ads |
| IR-M03 MEDIUM | [Friend Court](../games/friend-court.md): replacement ambiguity/exhaustion, ties and jury idle. | Races, collusion, disengagement. | Pre-argument window, bounded reserve, explicit deadlines, 4/12-seat tests and alternative tie paper tests. | S1 |
| IR-M04 MEDIUM | [Corporate](../games/corporate-chaos.md): Engineer converts V to 2D but bonus units excluded from personal score. | Divergent scoring, free riding. | One base D + one project-only bonus D, exact audit order and strategy tests. | G2 or S1 |
| IR-M05 MEDIUM | [Night Market](../games/night-market.md): cancel/decline/reservation ambiguity, greedy sell-two. | Race or shallow trade. | Atomic reservation lifecycle, strategy comparisons and real collision tests. | G4 |
| IR-M06 MEDIUM | [Cold Case](../games/cold-case-vietnam.md): clue pair may land on same seat, proposals mutable at ballot, release vs pause. | Cooperative design weakened, inconsistent ballot. | Constrained deal, freeze proposals, trusted release, blind bilingual solves/private packs and paid intent. | G3 |
| IR-M07 MEDIUM | [Inheritance](../games/inheritance-war.md): fallback, influence, reading extensions, stable ally blocs. | Invalid state/kingmaking. | Legal deterministic fallback, atomic influence, unique phase and strategy comparisons. | G5 |
| IR-M08 MEDIUM | [Wedding](../games/wedding-arena.md), economics: variance and human support. | Unfair result/unprofitable bookings. | Ranked table gate, venue tests, real labor/price/refunds. | E1 |
| IR-M09 MEDIUM | [Voice](../games/voice-telephone.md): 48 clips vs 32-clip estimate, consent/codec/reveal. | Underestimated storage, device failure, privacy. | G7 text only; V1 audio conditional, 12 MiB max plus partial/read quota and real device/deletion tests. | V1 |
| IR-M10 MEDIUM | [AI](../games/ai-battle-arena.md): 12 legal recipes but budget may reject some; 144 cells bilingual. | Trivial choices, memorization, editorial cost. | Candidate vs affordable distinction, meaningful budget/top score diversity, provenance and truthful replay-only UI. | G8/C1 |
| IR-L01 LOW | [README](../../README.md), homepage metadata still two games. | Discovery drift. | Update accurate product metadata during authorized application milestone, no planning-only source edits. | No |

## Game design assessment

Comparative hypotheses only, not measured user demand. Counts/durations are design targets.

| Game | Differentiation, depth, replay | Engagement, balance, scale | Mobile, content, monetization, MVP | Disposition |
|---|---|---|---|---|
| Friend Court (4–12, 8–25m) | Direct debate competition; fictional remedies/bilingual speech-text distinct hypothesis; low mechanical depth, social replay. | 4 swingy, 12 jury downtime; popularity, ties, fluent speakers. | Simple ballot, recurring original bilingual comedy, low-medium MVP; packs only after repeat. | Provisional S1 4–6; compare P0. |
| Corporate (4–10, 18–30m) | Shared survival and private mandates, higher strategy/replay. | Teaching load, free riders/role balance; simultaneous orders engage all. | Compact effort allocator, reusable edited deck, medium-high MVP; facilitator license hypothesis. | Default G2 or select first if evidence wins. |
| Cold Case (3–8, 25–40m) | Local original case and corroboration; high first solve, low same-case replay. | Reader dominance/deal balance, missing holders. | Long text/evidence list, very high bilingual editorial cost and private packs; paid next case plausible. | Early paper/paid-intent research, G3 after R2. |
| Night Market (4–8, 15–25m) | Familiar trading, simultaneous prices/private specialty, medium depth/replay. | Greedy sell-two, coordinated flooding and limited barter. | Compact hand/offers, medium-high transaction MVP, moderate pack cost. | Best contention fixture; G4 if preference. |
| Inheritance (5–10, 20–30m) | Stewardship/limited influence, overlap Corporate; medium depth/replay. | Ally blocs, tie-to-archive, kingmaking and long discussion. | Mobile two nominees/ledger, medium MVP/tuning; optional paid estates. | Hold until distinct or retire. |
| Wedding (20–40 pilot, 10–20m) | Established quiz market; bilingual MC recovery service; low guest strategy, organizer repeat. | Small-table variance, Wi-Fi, admission, MC/projector failure. | Simple guest tap, high operator and burst complexity; labor/refund costs. | Buyer interviews early, staffed E1 only. |
| Voice (4–12, 8–18m target) | Telephone reveal adjacent to Gartic Phone; low strategy, variable social replay. | Parallel turns, 48-clip reveal/codec/consent burden. | Text low-medium MVP, audio high; low prompt cost but device/privacy support, weak paid boundary. | G7 text only, optional V1. |
| AI (2–8, 10–18m) | Fixed recipe puzzle, not live model; low-medium strategy, finite memorization. | Budget triviality, duplicate output votes; simultaneous turns. | Accessible choice groups, medium MVP, high corpus/editor cost, zero live inference. | Defer/retire if weak demand. |

Friend Court fastest ordinary room proof, Corporate tests private editable orders and deeper demand, Night Market tests contention, Cold Case monetization is confounded by editorial work, Wedding/Voice need specialized operations. P0 determines first slice; no fixed eight-game rollout.

## Business and operating model

One catalog and reusable infrastructure, not mandatory eight products. Preserve canonical print URLs; if hostname transfer unsafe, separate same-origin live UI/API. No mass thin locale pages or guaranteed [AdSense approval](https://support.google.com/adsense/answer/9724). Ads disabled, no private-room ads. Host pays only for proven content/service, never guests or fair play/accessibility/reconnect.

The original $7.25/$29.25/$104.75 monthly scenarios are illustrative arithmetic, not verified capacity or invoice. Six seats × 4 KiB × 80 updates/seat ≈ 1.97 MB/match, 9.83 GB/5,000 starts before static/retries. Naive 300-seat × 300 answers × 2 KiB ≈ 184 MB/round: private ACK and coalesced updates needed. Voice 12 MiB hard accepted maximum plus partial/playback. Case $450/$4.50 net = 100 sales, $2.25 net = 200; event $50 less $5 fees/hosting and 3.5 h × $15 = −$7.50 before acquisition; AI 144 bilingual output cells at six briefs. Actual bills, latency, labor, paid demand, rights and audience unknown. These are sensitivity assumptions, not forecasts.

Solo developer and AI agents: many focused engineer-months for all eight; agents cannot replace owner review, editorial work, security accountability or event support. Limit WIP, skip unproven titles, no purchases or auto-deploy.

## Decision gates

- P0: owner requested correction, still needs hosting/domain/budget/retention facts, operator/audience policy and comparative candidate paper tests (six independent groups per candidate across EN/VI; five unaided completions proposed). Record preference, idle/pass, teach-back, repeat intent and candidate selection. If neither clears, revise. If Corporate wins, change S1/G2 and dependencies before F1.
- F1 exact next engineering milestone after P0 signoff: isolated static/live artifact allowlist, old routes and fallback, smallest evidenced Tamil fix, all legacy locale/print regression, pinned runtime/browser and rollback smoke. No framework rewrite.
- F2/F3: deterministic contracts, real sockets, auth/epoch/receipt/system-event fences, private projections, contention and crash/restore tests. S1 one complete game. R1 provisional; I1/O1 before invite-only L1.
- L1 proposed 20 independent groups, at least 15 unaided completions and eight of completed groups voluntarily rematch/commit repeat session; zero unresolved critical privacy/reliability/score incidents; report uncertainty and operating cost. Not market-fit proof.
- G2 after accepted L1, R2 after two executable engines and contested-action fixture. No G3–G8 before R2; each requires its own demand/safety gate. G7 text before V1. B1 commerce separate.

Trace corrections through [D11–D15](DECISIONS.md), [architecture](ARCHITECTURE.md), [contracts](../contracts/game-module-contract.md), [risks](RISKS.md), [roadmap](IMPLEMENTATION_ROADMAP.md), [backlog](TASK_BACKLOG.md), [testing](TESTING.md), [deployment](DEPLOYMENT.md), [progress](PROGRESS.md) and all eight GDDs.

**Verdict:** conditional go for corrected plan and P0 evidence. No-go for application implementation until P0 owner signoff; no-go for eight-game parallel build or paid event promises. No application changes, merge, purchase or deploy authorized by this planning PR.
