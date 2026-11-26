# Party Partner · master product and engineering plan

**Conditional approval: select one multiplayer pilot inside Party Paper after P0 evidence.** Friend Court is the provisional technical candidate, not a validated market winner. Keep the eight printable activities working. Treat “Party Partner” as the collection's working name until the owner confirms it. This is a planning proposal dated 26 November 2026, based on [repository revision e76f4f4](https://github.com/dungnguyenq237/party-paper/tree/e76f4f4b82b587eb30c3dd6f93f2711d5cf28be8).

## Executive summary

People can already discover a game, customize it and print it locally. They cannot join a synchronized room. A live game introduces a new trust boundary because the server must own time, actions, secrets and recovery when a host's phone disconnects. Add one server-authoritative service with same-origin live UI/API; prefer the primary origin only if the existing print hostname can be preserved safely. Use a single repository and deployable modular monolith with independent rules, content, visual identity and measurements for each title. [Audit](REPOSITORY_AUDIT.md) · [Architecture](ARCHITECTURE.md)

Compare Friend Court and Corporate Chaos in low-cost, counterbalanced paper tests before authorizing application work. If Friend Court wins P0, test one complete hosting experience: a Vietnamese or English host creates a hearing, three friends join, everybody gets a meaningful role, private ballots resolve, the host reconnects and the group can play again. Success requires a finished, repeatable evening with a first-time host. After accepted pilot evidence, implement Corporate Chaos as the second real engine (or a mechanically different second game if Corporate wins P0); validate contention before widening implementation. Cold Case Vietnam remains a paid-content hypothesis, conditional on blind solves and demand. [Release sequence](IMPLEMENTATION_ROADMAP.md)

**Business priorities.** Cold Case Vietnam can sell a second original investigation to a host. Wedding Arena can sell a rehearsed event to a planner. Both have existing paid substitutes. Their costs concentrate in editorial labor and event-day support. Corporate Chaos is the flagship and team-building hypothesis. Friend Court tests invitations and repeat play quickly. Voice Telephone carries the greatest media/privacy risk, Wedding the greatest burst and live-service risk, and live AI the most avoidable variable-cost risk. Start Wedding buyer interviews and Cold Case content trials early. Defer 300-person sales, public audio sharing, live model calls, subscriptions and eight-way rollout. [Market research](MARKET_RESEARCH.md) · [Monetization](MONETIZATION.md)

## Eight independent playbooks

| Game design document | Distinct decision in play | First proof |
|---|---|---|
| [Friend Court](../games/friend-court.md) | Argue for a harmless remedy, then alternate into a private jury. | 4 players finish and rematch after host loss. |
| [Corporate Chaos](../games/corporate-chaos.md) | Divide limited effort between project survival and private career incentives. | Groups can identify trade-offs without sidelining a player. |
| [Cold Case Vietnam](../games/cold-case-vietnam.md) | Corroborate a theory with clues held by different investigators. | Two-language blind solve plus credible next-case demand. |
| [Night Market](../games/night-market.md) | Trade one good now or risk the market-wide clearing price. | Simultaneous trades settle exactly once and reward varied strategies. |
| [Inheritance War](../games/inheritance-war.md) | Spend finite influence to place a keepsake with a custodian or in the common archive. | Both small and large groups can counter a stable coalition. |
| [Wedding Arena](../games/wedding-arena.md) | A table competes on proportion correct, independent of table size. | Rehearsed 20–40-person pilot and co-host recovery. |
| [Voice Telephone](../games/voice-telephone.md) | Reproduce the preceding hop, then hear how the phrase changed. | Consented cross-device play and verifiable deletion. |
| [AI Battle Arena](../games/ai-battle-arena.md) | Choose affordable prompt instructions and see how a versioned real output scores. | A complete competitive replay match with zero live inference. |

## Review map

| Decision area | Source of truth |
|---|---|
| Current capability, evidence, gaps and reuse | [Repository audit](REPOSITORY_AUDIT.md) |
| Competitors, regional demand signals and differentiation | [Market research](MARKET_RESEARCH.md) |
| System diagram, dependency direction, data model and persistence | [Architecture](ARCHITECTURE.md) |
| Type boundary, private projections, ordered events, grace and rematch | [Game module](../contracts/game-module-contract.md) · [Multiplayer events](../contracts/multiplayer-events.md) · [Room lifecycle diagram](../contracts/room-lifecycle.md) |
| Mobile UX, content discovery, SEO, localization and growth by game | [SEO and growth](SEO_AND_GROWTH.md) and each linked game design |
| Buyer, free/paid boundaries, AdSense and live cost | [Monetization](MONETIZATION.md) · [Deployment and cost scenarios](DEPLOYMENT.md) |
| Metric/event taxonomy, privacy, thresholds and investments | [Analytics](ANALYTICS.md) |
| Privacy, validation, abuse, failure and retention | [Security](SECURITY.md) · [Testing](TESTING.md) |
| Release order, dependency graph, estimates and production readiness | [Implementation roadmap](IMPLEMENTATION_ROADMAP.md) |
| Parallel assignments, module ownership, review and resume | [Task backlog](TASK_BACKLOG.md) · [Progress](PROGRESS.md) |
| Independent findings, review evidence and owner approval gates | [Independent review](INDEPENDENT_REVIEW.md) |
| Alternatives, trade-offs, critical self-review and unresolved questions | [Decision log](DECISIONS.md) · [Risk register](RISKS.md) |

## Approval and sequencing

1. **Before coding**, confirm brand, intended canonical host/control and migration path, support and editorial owners, scoped initial spend and pilot audience. Reproduce baseline tests and check the cost assumptions. Paper-test both candidates with independent VI and EN hosts, record pilot selection, and approve hosting/recovery boundaries. Owner approval of this plan is the application implementation gate.
2. **For the first implementation**, protect the print/locale/ad regressions, add strict TS boundaries for new modules and real room/session storage, then complete the Friend Court slice. Reuse design tokens, theme behavior, accessible print guides, Node tests, Playwright, GitHub checks and editorial navigation. Leave the local print algorithms on the client. Add authoritative room state, per-seat projections, explicit EN/VI live messages and durable retry/timer handling.
3. **After contract review**, the room server, bilingual shell and public-page generator can proceed on distinct paths. After the slice, R1 is provisional. Run the invite pilot (L1) and a second executable engine (G2) plus a contested-action fixture before R2 stabilizes the shared contract. Keep one game implementation branch in flight before R2, at most two afterward. No obligation to ship every title. One integrator owns shared contracts, dependencies, migrations, discovery and release. Prioritize review capacity over number of open branches.
4. **Before expansion**, prove ordinary room recovery, validate cost/completion, settle how licensed content will be delivered privately to the server and observe unaided sessions. Require venue evidence before advertising event capacity, deletion/device evidence before collecting audio and an explicit budget before enabling paid inference. Pricing, demand, consent law by market, real capacity and ad approval remain unverified. [Validation gates](IMPLEMENTATION_ROADMAP.md) · [Open questions](RISKS.md)

## Independent review disposition

See [review](INDEPENDENT_REVIEW.md) and D11–D15 in the decision log. Approve P0 discovery only, not application work or a paid hosting change. If P0 selects Corporate Chaos instead of Friend Court, explicitly revise S1/G2 assignments and dependent fixtures before F1. F1 remains the first engineering milestone, following recorded owner approval. R1 is pilot-specific; R2 is the portfolio gate.
