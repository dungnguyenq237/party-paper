# P0 digital playtest prototypes

Owner requested F3 hardening, P1 and browser-only comparative prototypes. These are not production S1/G2 implementations. The selected first game remains provisional until human comparison. Source `7b08f19c57f8a92f36aadb1c3643f3b0dfb2156d` (F3/P1/playtest implementation), public branch `pages/f1-preview` commit `7afe6e33315ea39dce0f7877820309c88f6f91f4`. See [source CI](https://github.com/dungnguyenq237/party-paper/actions/runs/45776470923) and [Pages deployment](https://github.com/dungnguyenq237/party-paper/actions/runs/45776570183) for exact outcomes. Do not infer deployment or CI success from this receipt alone.

## Review links

- [Playtest studio](https://dungnguyenq237.github.io/party-paper/play/)
- [Friend Court](https://dungnguyenq237.github.io/party-paper/play/friend-court/)
- [Corporate Chaos](https://dungnguyenq237.github.io/party-paper/play/corporate-chaos/)
- [Room Lab](https://dungnguyenq237.github.io/party-paper/review/room-lab/)

Both games support 4–6 local participants with different aliases, EN/VI, manual or timed turns, explicit handoffs and a full score/rematch loop. All private state exists in the same browser process: a curtain is social privacy, not an authorization boundary. No accounts, network rooms, data upload, local storage or analytics. Reload clears the game. Use fictional content only. Actual P1 server fixture is separate: run `npm ci && npm run serve:live`, open http://127.0.0.1:8766/local-room/ in two independent browser profiles. This is a loopback-only HTTP/WS fixture; not hosted and not public HTTPS/WSS.

## Reference-led quality and mechanics

Visual direction: original court dossier with ink, paper, paired remedy cards and verdict stamp; Corporate ivory ledger, navy ink, effort controls and aggregate audit. Shared responsive layout, semantic controls, focus on changed phases, dark theme and reduced motion. No copied external reference assets. Sixteen original bilingual Friend Court dockets; within a match no repeats, replacement consumes unused inventory and never prevents remaining hearings. Advocate order alternates, both pass ends immediately, typed text can be concealed, one private ballot per juror, count-only verdict, tie handling and rotating rematch. Replacement in this local prototype is a shared host control, not a private authenticated request. The full production advocate early-accept, moderator, timed synchronization and server-backed content/version contracts are not implemented here.

Corporate uses the P0 fixed legal event sequence normal/crunch/audit/contract to make comparisons consistent; production GDD uses a six-card random deck. Each player gets a public role, random private mandate, credit balance, two-unit allocation, once-per-game role power, default option and audit. Engineer bonus counts for project only; default earns no personal credit; shared insolvency ends the game; final score includes mandate bonus and tie-break. Pass-and-play means sequential handoffs and per-seat timers instead of real simultaneous submission; negotiation is shared. Real timing and scaling to larger groups must be tested during S1/G2. Prototype mechanics are original JS modules for static publishing, separate from strict TS server and P1 code; not the canonical production game engine.

## Evidence and review

[Earlier executed run](https://github.com/dungnguyenq237/party-paper/actions/runs/45776347088) passed 29 Chromium cases, including real UI create/join/reconnect/rematch and full Friend Court and Corporate sessions, 320px VI layout and original rules. Tests generate source-bound screenshots in CI artifacts; automatic capture and layout checks are not equivalent to independent human visual review, device/screen reader testing or demand validation. Final implementation run also includes an eight-room parallel HTTP/WebSocket workload, 32-room in-memory store workload, SIGKILL after committed command, invalid DB snapshot and exclusive writer tests. Measured local/CI latency/bytes only; no public capacity promise. No real TLS, remote device test, lost-volume auto-detection, hosting spend, commercial service or public release.

## Human test procedure

Use six independent groups, both languages and 4/6 seats. Give each group both games in alternating order. Use untimed mode initially to observe natural discussion and teach-back; record actual session length, interruptions, passes/defaults, repeated rule questions and host interventions. Use the existing [paper comparison kit](https://github.com/dungnguyenq237/party-paper/blob/docs/p0-validation/docs/planning/P0_PLAYTEST_KIT.md) for comparison criteria and private aggregate recording. Do not enter names or private ballots in GitHub. Record anonymous preference, voluntary repeat commitment and completion per group. Do not treat automated browser tests as real group trials. If both candidates fail or preferences are unclear, revise and retest. P0 retains final selection and production S1 approval; no cloud infrastructure authorized ($0 incremental).

## Publishing and rollback

Pages branch contains the 73 existing public files byte-for-byte plus exactly nine explicitly selected files under play/. No new server, migrations, local P1 UI, source maps, tests, DB or private content on Pages. Neither prototype is included in Render dist or the production sitemap; pages have noindex/nofollow. No changes to main or Render configuration. Preview rollback: revert the isolated Pages publish commit, preserving previous public tree `e3e839b20135c19b426a2d9a76dae253bac27fa7`. PR #4 retains source review; do not treat preview publication as production release.
