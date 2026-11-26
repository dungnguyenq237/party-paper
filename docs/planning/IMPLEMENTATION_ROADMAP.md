# Dependencies, release order and production gates

All delivery estimates are **focused solo engineer-weeks**, with a bilingual editor, recruited hosts and access to real devices when needed. They exclude waiting for pilots, payment review and domain approvals. Ship one real game before expanding the shared layer. Review capacity and estimates after each observed release. An autonomous agent completing code cannot substitute for live event rehearsal or editorial approval.

```mermaid
flowchart TD
  P0[Plan review and evidence gate] --> F1[Build and public/private boundary]
  F1 --> F2[Contracts and schemas]
  F2 --> F3[Room server and persistence]
  F2 --> P1[Locale and accessible shell]
  F2 --> A1[Public content generator]
  F3 --> S1[Friend Court vertical slice]
  P1 --> S1
  A1 --> I1[Catalog and release integration]
  P1 --> I1
  S1 --> I1
  S1 --> R1[Contract freeze after playtest]
  R1 --> G2[Corporate Chaos]
  R1 --> G3[Cold Case]
  R1 --> G4[Night Market]
  R1 --> G5[Inheritance War]
  R1 --> G6[Wedding event branch]
  R1 --> G7[Voice and deletion branch]
  R1 --> G8[AI replay corpus]
  R1 --> O1[Ops and security acceptance]
  I1 --> O1
  O1 --> L1[Invite pilot then opt-in public release]
  O1 --> E1
  F3 --> V1
  G6 --> E1[Venue and paid pilot gate]
  G7 --> V1[Device and erasure gate]
  G8 --> C1[Rights and replay gate]
  E1 -. paid intent .-> B1[Commerce gate]
  G3 -. paid intent .-> B1
  O1 --> B1
```

Arrows are minimum dependencies. Every title entering public release also needs I1, O1 and the readiness checklist. Foundation and content discovery can overlap after interfaces stabilize. No shared abstraction is declared stable until the first complete game has exercised retries, private voting, mobile join and rematch. Roadmap and backlog IDs match. [task scopes and commands](TASK_BACKLOG.md) are normative for implementation.

| Milestone, size | Objective / expected modules | Depends on / scope limits | Acceptance, regression and rollback |
|---|---|---|---|
| P0, ½–1 wk | Owner reviews plan, brand/domain, funding ceiling, current config and Tamil baseline. Recruit independent VI/EN hosts, paper-play Friend Court · record decisions in PROGRESS/DECISIONS. | Planning approval precedes **any application implementation**. Purchases and deployments require separate authorization. | Demonstrate one understandable complete hearing, source/cost evidence and owner-approved scope · record hard blockers. Run existing npm test and targeted E2E. If branding/hosting unresolved, continue paper validation only for affected decisions. |
| F1–F3, 2–4 wks | Single repo, strict live build, schemas, SQL schema v1 and room actor at src/contracts, src/platform/server, migrations and ops. | P0. Preserve all print routes, no accounts, live billing, broker or second writer. Own package/lock and DB migrations centrally. | Type/build/contract/room/restore tests pass · old entry points work below a path prefix. Verify that private files are excluded and published assets remain available. Disable live router and restore known static artifact. |
| P1/A1/I1, 1–2 wks (overlap) | Accessible mobile room shell, EN/VI public rules templates, catalog entry, analytics allowlist and feature flags. | F2 for shell/manifest · join to a real backend before publishing. Only active games have public discovery entries. | Static crawl, locale parity, contrast, disabled-analytics and old query-link tests pass. Check for duplicate canonicals and legacy translation rewriting room text. Restore previous navigation/sitemap and keep room creation closed. |
| S1/R1, 2–3 wks | Friend Court through invitation, hidden ballot, transition, recovery, results, share and rematch. One new GDD-driven module, 16 dockets + reserve/language. | F3 + P1 · A1/I1 before public listing. Hold custom disputes, open chat and commerce. | Four independent browsers complete and rematch after host loss · no ballot leak. Observe VI and EN host including pass/typed path. Freeze reviewed interface fixtures, revise shared contracts before other game branches merge. Roll back per-game flag and drain. |
| O1/L1, 1–2 wks then ongoing | Staging, deploy/restore, cost baseline, security/privacy, accessibility, support and limited release. | First real slice, public integration and completed baseline repair. No open marketing or ads until gates pass. | Run all gates below · release to whitelisted hosts, then small public cohort, then general discovery if evidence supports. If budgets or error targets fail, stop creation, recover sessions, retain print access. |
| G2, 2–4 wks | Corporate Chaos flagship candidate · module, private mandates, four-quarter simulator, facilitator guide. | R1. Exclude performance evaluation and paid role powers. | GDD fixtures and seeded free-rider test, readable 4/10-seat audit trail · risk dominant self-promotion. Gate behind flag and retire flawed deck version at room expiry. |
| G3, 2–4 engineering wks + 2–5 editorial wks/case | Cold Case engine, pack schema/linter, original free case and blind test. | R1 · authoring/rights research may begin after P0. No automatic case generator. | Two structurally different test packs load, native reviewers can solve without guessing, no private solution in public output · risk spoilers. Unlist compromised pack and pin active rooms to reviewed content. |
| G4, 2–3 wks | Night Market simultaneous exchange/list/settle and price guide. | R1. Three goods, one barter per player/evening. | Conservation and concurrent accept tests plus 4/8-seat complete markets. Risk duplicated trades. Stop new rooms and recover from last committed snapshot. |
| G5, 2–3 wks | Inheritance War nominations, votes and custody ledger. | R1. One estate, no user-written wills. | Tie/timeout/cap fixtures, no dominant permanent bloc in moderated pilots. Risk kingmaking. Pause new estate version, keep active match reader. |
| G6/E1, 3–6 wks + venue scheduling | Wedding rehearsal, operator grants, projector, table score, paper fallback and paid-event pilot. | R1, O1 plus named operator and venue. Exclude photo uploads and unattended initial sales. | Burst at staged cap, co-host failover, complete onsite rehearsal and buyer willing to book. Risk live outage. Fall back to MC run sheet, void affected round, honor booking agreement. |
| G7/V1, 3–5 wks + device sessions | Consent, audio grants/deletion, real device exchange, text relay. | R1, O1, storage and retention review. Exclude public galleries, export and transcription. | Cross-device playback, withdrawal and janitor/restore tests. Risk inaccessible or undeleted clip. Revoke grants, stop new audio, purge and offer a new text match. |
| G8/C1, 2–4 wks + corpus review | AI Battle replay matrices, rubric evaluator, anonymously grouped votes. | R1 and reviewed provenance. Zero live inference. | Full real corpus at launch, 2/8-seat replay/zero-bill tests, language fairness · risk stale model assumptions. Disable bad pack and keep verified packs. |
| B1, 1–3 wks when justified | Entitlement receipt, reconciliation, refunds, booking support and unit economics tracking. | Evidence of paid intent for G3 or G6, reviewed terms. Keep recurring subscriptions and live AI disabled. | Provider sandbox retry/refund and restore tests, positive expected contribution under measured support · risk duplicate charges or lost access. Disable checkout, honor existing receipts manually. |

## Prioritization under a single maintainer

Start with **Friend Court** because it exercises every ordinary room step with no specialist infrastructure. Corporate Chaos tests whether this base can handle hidden goals and resource commitments. Start Cold Case editorial work during the slice. Pilot Cold Case before Corporate Chaos if a reviewed case and paid test cohort are ready first. Wedding discovery and rehearsal-sales interviews start early, even though public admission waits for operational proof. The suggested public order is Friend Court, Corporate Chaos, Cold Case Vietnam, Night Market, Inheritance War, Wedding Arena at validated cap, Voice Telephone, AI Battle Arena. A booked, staffed Wedding pilot can proceed privately ahead of Night Market once its gates pass. Ordering expresses opportunity cost and operational dependencies. No simultaneous eight-game launch.

| Candidate | Distinctiveness / replay | Acquisition / sharing | Business / delivery risk |
|---|---|---|---|
| Friend Court | High first-session accessibility · fresh dockets needed | Short rule page and fictional verdicts | Fast/low infra · humor safety and quality |
| Corporate | Strategic repeated play · role tuning | Office facilitator search/debrief | Team licenses plausible · balancing medium–high |
| Cold Case | Strong first solve · limited repeat of same case | Local editorial search and referrals | Direct paid packs · costly content throughput |
| Night Market | Variable clearing prices, repeated negotiation | Strategy guide, public price histories | Moderate differentiation in crowded theme · atomic trades |
| Inheritance | Highly social but overlap with Corporate | Niche rules search and estate summaries | Ship after a playtest shows distinctive choices |
| Wedding | Recurring organizer, often one-off guests | MC guides, planner referrals | Highest service-sale potential and critical live window |
| Voice | Surprise reveal, variable consent | Invitations · audio stays in room | High device/privacy cost · weak paid boundary |
| AI | Rubric replay · finite matrices | Searchable practice briefs | Low live cost in replay mode, costly editorial renewal · live AI carries high financial risk |

## Definition of public-ready

- [ ] Owner approved scope, canonical origin, budget and support coverage. CI and staging identify exact build, pack and schema versions.
- [ ] Old print/answer keys, locale/theme, deep links and static fallback pass regression, including the documented Tamil check.
- [ ] All GDD actions, win/defeat/tie, abandonment, protected projection, expiry and fresh rematch pass against real server and storage.
- [ ] Mobile, keyboard, screen reader, reduced motion and both language editors have signed off. Loading, declined permission and reconnect work on physical devices.
- [ ] Public HTML, canonicals, reciprocal alternates, social images and sitemap verified. Rooms require auth and have noindex/no-store. Publish accurate Privacy, Terms and a private support route.
- [ ] No hidden content/keys in client output/logs, moderation/report owner identified, retention and restore independently verified. Current free/paid scope explicit.
- [ ] Load report names tested cap/region/tier and field latency. Alerting, caps, shutdown, undo/restore and cost reconciliation exercised.
- [ ] Pilot with independent hosts completed. Owner recorded go, revise, pause or retire with evidence and date. Attach receipts in [progress](PROGRESS.md).
