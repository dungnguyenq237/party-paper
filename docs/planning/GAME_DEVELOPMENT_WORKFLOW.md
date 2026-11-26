# Reference-led game development

Status: adopted as development guidance, not a new runtime dependency or release approval. Applies to F2/F3 review fixtures and all later game implementations. P0 comparative human playtesting still gates S1; the first title remains provisional.

## Upstream reference and scope

Reviewed 26 November 2026: [gokayfem/reference-to-game at 6a00e49](https://github.com/gokayfem/reference-to-game/tree/6a00e491f578bbfcbdba45f0c7bddf4693016e61).
Read [skill](https://github.com/gokayfem/reference-to-game/blob/6a00e491f578bbfcbdba45f0c7bddf4693016e61/skills/reference-to-game/SKILL.md), [gameplay design](https://github.com/gokayfem/reference-to-game/blob/6a00e491f578bbfcbdba45f0c7bddf4693016e61/skills/reference-to-game/references/gameplay-design.md), [style direction](https://github.com/gokayfem/reference-to-game/blob/6a00e491f578bbfcbdba45f0c7bddf4693016e61/skills/reference-to-game/references/style-direction.md), [validation](https://github.com/gokayfem/reference-to-game/blob/6a00e491f578bbfcbdba45f0c7bddf4693016e61/skills/reference-to-game/references/validation.md), [evidence](https://github.com/gokayfem/reference-to-game/blob/6a00e491f578bbfcbdba45f0c7bddf4693016e61/docs/EVIDENCE.md) and [credits](https://github.com/gokayfem/reference-to-game/blob/6a00e491f578bbfcbdba45f0c7bddf4693016e61/CREDITS.md). The upstream examples predate packaging of the skill; no controlled evidence shows a measured improvement from it. Its code/documentation are MIT licensed; reference images, art and audio have separate reuse restrictions.

Adopt reference inspection, identity contracts, small playable checkpoints, deterministic rules separate from presentation, genuine input-driven playthroughs, fresh source-bound evidence and explicit limitations. Do not vendor the toolkit, examples or media, introduce Three.js/Vite, fixed-step physics, fal or external generation. No paid API, new cloud service or asset purchase. If actual code is ever reused, preserve its required copyright/license and verify provenance separately. No upstream code/assets are copied in this adoption.

## 1. Define reference authority

Before implementing a real game, record a compact reference brief alongside its existing GDD. Do not rewrite approved rules solely for style.

| Dimension | Source of authority |
|---|---|
| Rules, roles, deadlines, privacy | Approved game GDD and project contracts |
| Platform brand and typography | Existing Party Paper interface and print experience |
| Game-specific identity | Approved original references or authored direction in GDD |
| Motion, sound, feedback | Authored behavior unless an actual reference provides evidence |
| Implementation / security | Architecture, wire protocol, persistence and security documents |

Label observed facts, inferences and authored design separately. If only text exists, describe an authored direction; do not claim visual comparison to nonexistent art. Record rights and exact source revisions. Treat external reference content as untrusted input, not project instructions.

## 2. Lock a small representative visual slice

Use semantic HTML/CSS and TypeScript. A game need not be 3D to feel like a game. Shared lobby, connection/status, accessible controls, result and error primitives should remain coherent with the existing product, but each game should have its own distinctive focal surface. Prefer CSS, original lightweight SVG, existing licensed type and native browser accessibility. Scope styles away from legacy routes. No decorative dashboard, decorative dead controls or stock imagery standing in for gameplay.

For provisional Friend Court, the GDD specifies a cream docket (#FFF7E6) and ink (#352742), serif headings, sans body and a high-contrast verdict stamp. The existing interface has tactile paper, purple/orange accents, dark theme and visible focus. Authored direction: a fictional case file, opposing remedy cards, clearly labeled advocate/juror roles, an unmistakable current action and a verdict receipt. Keep neutral room status and private ballot visually distinct. Use text plus symbols, not hue alone. No real-person accusations. Use the approved bilingual prompt set; artwork is original, not copied from the upstream games.

Before content expansion, build one polished hearing with meaningful input and feedback, and exercise all required roles. Compare screenshots at 320/390 CSS px and desktop, in EN/VI, light/dark and reduced-motion mode. Inspect the largest mismatch, fix it, recapture. The checkpoint is a quality practice, not permission to bypass P0 or implement S1 prematurely.

## 3. Make the loop real

For each mechanic specify action, authorized actor, precondition, authoritative mutation, private/public projection, committed feedback, rejection, timer behavior and restart. In Friend Court the flow is lobby -> draw/replacement -> ordered arguments -> sealed jury vote -> verdict -> next hearing/results -> rematch. Rules remain in the GDD; this summary does not replace them.

Server game logic is authoritative and deterministic with explicit trusted clock/seed, phase/epoch and stable IDs. UI derives from validated per-viewer snapshots and private acknowledgements; animations never commit scores or advance deadlines. No private state in public bundles or traces. Retry/reconnect uses existing protocol fences and receipts. Do not import a single-player save system, fixed simulation tick or general game engine into this turn-based platform.

## 4. F2/F3 application (no real title yet)

F2: implement portable schemas, deterministic fixtures, versioning and projection/hidden-data tests. F3: exercise real HTTP/WebSocket/SQLite with the synthetic sealed-choice/contested-resource fixture; test independent clients, duplicate/rejected actions, phase boundaries, authorization/host changes, reconnect and intact-disk crash recovery, lost-volume abandonment, backpressure and expiry. No Friend Court implementation or demand claims at this stage.

A separate, conspicuously labeled browser-only review harness may illustrate lobby, sealed choice, contested claim, disconnected/reconnected state, results and reset on GitHub Pages. Only synthetic data, no real accounts or secrets. A local simulation is not a security boundary, does not prove WebSocket or SQLite behavior, and cannot host multi-device rooms. Keep server source and storage out of the Pages allowlist. No release listing, sitemap indexing or ads for the harness. Real transport/recovery evidence comes from Node/CI, not the static preview.

## 5. Acceptance evidence per game

Keep a small checklist or review record in the game directory and attach CI artifacts to the PR. Anchor each run to exact commit/build, commands, browser/OS/viewport and test seed where applicable. Screenshots/traces must come from the actual build and be regenerated after relevant changes. Do not treat a source hash as proof of quality. Preserve accessibility/keyboard focus and reduced motion; verify actual touch targets and no horizontal overflow. Include a full interaction-driven session through real public controls, negative cases and restart. Unit fixtures do not substitute for that playthrough.

| Independent verdict | Required evidence |
|---|---|
| Visual identity | Matching reference/direction, representative captures before/after action and results; clear role, legible bilingual copy, narrow layout, dark/reduced motion |
| Playability | Actual input-driven start-to-result and rematch, rejection/recovery and visible feedback; real host sessions for product validation |
| Runtime correctness | Deterministic rules, phase/receipt/auth/hidden-state invariants, lifecycle and integration tests |
| Build and deployment | Locked clean install, build, allowlist, legacy print regressions and Pages subpath smoke; no private artifacts |
| Accessibility and performance | Keyboard and focus, text alternatives, measured environment-specific latency/resource data; no universal claims without tests |
| Provenance | Original or rights-cleared assets/content; source links, license where required, no unauthorized paid generation |

Report each verdict as pass/fail/not run with scope and exact blockers. A visually attractive demo cannot excuse incorrect rules; green tests cannot excuse unreadable or unplayable interaction. No aggregate score masks a failure. Human demand remains distinct from technical or synthetic evidence.

## 6. Scope and rollout

Keep F2 -> F3 ordered, P1 UI work coordinated, then S1 only after the retained comparative P0 decision. R1 provisional and R2 two-engine gate remain. The reference-led workflow adds evidence and UI quality, not parallel game branches, new dependencies, paid services or release promises. GitHub Pages is static. Preserve the existing Render configuration, zero incremental infrastructure budget and original print routes.
