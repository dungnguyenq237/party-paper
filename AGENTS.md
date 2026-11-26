# Party Paper / Party Partner — repository guidance

Start with [the master plan](docs/planning/MASTER_PLAN.md), [architecture](docs/planning/ARCHITECTURE.md), [task backlog](docs/planning/TASK_BACKLOG.md) and [testing gates](docs/planning/TESTING.md). Follow the assigned milestone and current owner decisions. Read the relevant [wire](docs/contracts/multiplayer-events.md), [lifecycle](docs/contracts/room-lifecycle.md) and [game module](docs/contracts/game-module-contract.md) contracts before changing live features.

## Reference-led game quality

Use [GAME_DEVELOPMENT_WORKFLOW.md](docs/planning/GAME_DEVELOPMENT_WORKFLOW.md), adapted from the reviewed reference-to-game methodology. Inspect the actual reference and GDD, record authority and provenance, define the playable loop, lock a representative visual checkpoint, then expand. Keep rules/state separate from rendering. Use real input-driven playthroughs plus deterministic/negative tests and source-bound screenshots/traces. Report visual, playability, runtime, build, accessibility and performance verdicts separately. Never claim executed tests or human validation without evidence.

## Boundaries

- Preserve the eight existing print modes and 38 locales; use explicit static allowlists and isolated server/client outputs. No server source, private fixtures, data or credentials in Pages.
- Strict TypeScript for new code. Native DOM/CSS and lightweight original graphics unless evidence warrants another dependency. No Three.js, game engine framework, fal, copied example art/audio or paid generation by default.
- Server authoritative with per-viewer projections, explicit clock/seed, transaction and idempotency rules. Do not equate a static review simulation with multiplayer security or persistence.
- Current owner constraint: $0 incremental infrastructure. No new services or provider configuration changes. Keep real server tests local/CI and clearly label Pages demos.
- F2/F3 use synthetic fixtures only. Comparative human playtests still gate S1; Friend Court provisional. Do not build the full portfolio early or freeze broad game interfaces before R2.
- Keep PRs narrow, verify current source and actual CI, document remaining blockers and do not assume authorization for production merge or release from permission to publish a static review preview.
