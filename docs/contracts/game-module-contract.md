# Game module contract v1 proposal

The descriptor is public. It declares slug, release flag, supported locales, player limits, duration range, accessibility modes, rules URL, version and public client entry. The server registry maps slug and compatible engine/content version to an engine and validated private pack. Generate two separate manifests from explicit entry points. The client artifact must never include the server registry or its sourcemap. Premium packs and unreleased solutions require a private authoring/distribution channel since this repository is public. Published open sample cases may be spoiled by reading source.

```ts
type Change<S> = {
  state: S
  deadlineAt: number | null
  effects: readonly EffectIntent[]
}

interface GameModule<S, Config, Action, View> {
  decodeConfig(input: unknown): Config
  decodeAction(input: unknown): Action
  initialize(ctx: MatchContext, config: Config): Change<S>
  apply(state: Readonly<S>, actor: SeatId, action: Action, ctx: StepContext): Change<S>
  expire(state: Readonly<S>, ctx: StepContext): Change<S>
  project(state: Readonly<S>, viewer: AuthorizedViewer): View
  outcome(state: Readonly<S>): MatchOutcome | null
}
```

These are planned types. MatchContext contains accepted seats, seed, monotonic match ID, rules/pack version and server time. StepContext supplies a recorded time, phase and deterministic PRNG cursor. EffectIntent is an allowlisted description such as consuming a validated upload handle. Execute irreversible external effects through idempotent jobs after commit. AuthorizedViewer is a server-resolved seat or explicitly granted display. No host method returns all hands. Errors use stable codes and named interpolation arguments. User actions can reveal only information the rules explicitly publish.

A game owns setup, phase transitions, deadlines, resources, vote resolution, tie and abandonment rules, and its private/public projection types. The shell owns membership, leases, session proof, host reassignment and delivery. Games can model simultaneous ballots, sealed orders, an evidence graph or parallel chains. Introduce a shared scoring or voting helper only after the second compatible use case.

**Compatibility contract.** A room binds a game version and immutable content hash at start. Old rooms finish using the pinned reader until expiry. New actions carry the negotiated protocol major. Add optional public fields within a major, reject unsupported majors with an upgrade/rejoin screen. Keep synthetic initial, mid-round, overdue, result and prior-version fixtures for each game. Test each viewer, including host/display, against an allowlist and a seeded secret sentinel. CI builds every client independently, rejects server imports and scans its public artifacts and maps for fixture sentinels.

## Candidate intent and projection inventory

These game-owned discriminants make the first wire fixtures implementable. The public projection contains only the fields named or implied by a published rule. Add a private field through explicit schema review.

| Module | Primary intents / conflict key | Public view during play | Seat-only or server-only state |
|---|---|---|---|
| Friend Court | replaceDocket, argue, pass, castVote / advocate slot or juror ballot | Docket, remedies, role rotation, submitted argument, aggregate committed count | Individual juror choices stay private including after results. Only totals are published. |
| Corporate | commitEffort / seat order version in quarter | Targets, runway, featured department, roles, aggregate prior audits | Mandate, remaining work credits, ability availability, current order. Hidden seed and all other orders stay on server. |
| Night Market | offerSwap, cancelSwap, acceptSwap, listGoods / offer ID plus version and both stalls' exchange allowance | Goods legend, demand, post-settlement market prices | Own stock, reserved units, target-specific offers and listings. Server owns settlement and source of goods. |
| Cold Case | publishClue, requestHint, proposeFinding, voteFinding / clue release or proposal version | Shared evidence, unlocked hints, proposals, phase | Own dealt clues, private ballot and server-only solution/evidence pairs until debrief. |
| Inheritance | nominate, callReading, voteCustody / open lot plus seat | Lot tags, proposals, chair and custody history | Own pledge, influence and vote. Server retains counts behind sealed ballot. |
| Wedding | openRound, answer, lockRound, voidRound / eligible seat or operator round version | Shared question, open/lock, post-lock counts and table standings | Own table, answer receipt, pre-granted operator controls. Answer keys never sent to guest/display before reveal. |
| Voice | recordConsent, claimHop, commitHop, withdraw, nominateChain / match+chain+hop | Ready counts, hop index, authorized reveal order | Seat-bound upload/read capabilities; server maps private handles and tombstones. |
| AI | commitRecipe, castStyleVote / seat+brief or distinct output group | Brief, visible predicates, grouped outputs only after commitments | Own draft and remaining budget, hidden output matrix until reveal, server-side scoring. |

Publish a versioned fixture for each of these roles, including a returning participant, a new spectator denied participation and an expired principal. Fixture labels and user-facing strings are separate.
