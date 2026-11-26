# Multiplayer wire contract v1 proposal

All gameplay writes are authoritative. Transport is same-origin HTTPS/WSS. Human codes identify a room. An authenticated, unrevoked room membership establishes identity. A signed-in account is unnecessary for private guest play.

| Operation | Auth, input and outcome |
|---|---|
| POST /api/rooms | Issue or reuse guest session via Secure, HttpOnly, SameSite cookie. Enforce Origin/CSRF, create quota, public gameId, valid config and idempotency key. Return room alias, new host seat, invite capability and public projection. |
| POST /api/join | Code plus alias, or invitation token from URL fragment. Check capacity, expiry and lock, optional host approval/PIN and existing membership atomically. Return seat/view, or neutral unavailable response. Never forward invite fragments to analytics. |
| POST /api/rooms/:id/socket-ticket | Session, membership, Origin and CSRF. Issue one-use 30 s nonce bound to session, room, role, origin and protocol. Upgrade same-origin WSS with cookie and allowed Origin · require ticket in first frame within 5 s before subscription. Never put credentials in URL logs. |
| WS hello / snapshot | Client protocol major, matchId if known, lastRev. Server returns protocol major, matchId, rev, serverNow, phaseId, deadlineAt, self permissions and freshly projected full view. Refresh obtains a new ticket using same cookie. |
| WS command / ack | Envelope below. Server resolves room/seat from socket · client cannot nominate an actor. Ack contains commandId, matchId, acceptedRev or typed error. Receipt belongs to author. Never include omniscient state. |
| WS view / resync | Pilot sends a bounded viewer-specific snapshot with revision on changes, coalesced when safe. Apply only newest for same match. Unknown match or gap requests full latest snapshot. Phase reveals are explicit. |
| POST /api/rooms/:id/leave | Voluntary leave invalidates live access. In-match seat stays as an abandoned seat for scoring and hand safety. Heartbeat expiry only marks disconnected. |

```json
{"v":1,"type":"command","matchId":"m8","commandId":"c142","phaseId":"hearing-2-vote","seenRev":41,"action":{"kind":"castVote","choiceId":"remedy-b"}}
```

An accepted frame might be `{"v":1,"type":"ack","matchId":"m8","commandId":"c142","acceptedRev":42}`. A late action gets `PHASE_CLOSED` and latest public revision. Other codes include INVALID, FORBIDDEN, STALE, RATE_LIMITED (retryAfterMs), FULL, PAUSED, EXPIRED and UPGRADE_REQUIRED. Include safe localized recovery text on the client. A retry after an ambiguous connection failure reuses the same commandId.

**Ordering.** Authenticate, check existing receipt first for this actor/match, verify payload digest, then check phase/deadline and action preconditions. Exact-revision actions (start, trade acceptance, host advance) use the target revision or item/version token described by module. Sealed independent submissions accept a valid current phase even if another seat advanced room rev. For editable submissions use a seat-specific monotonic submission version. Room queue assigns commit order. A phase change never silently carries a command into the new phase. Timeout is resolved under the same lock. At serverNow >= deadline the phase closes before applying an uncommitted action. A duplicate accepted earlier still receives its original receipt.

**Recovery.** Each new authenticated connection can replace its seat's old writing socket. Client backs off with jitter and retries only unacknowledged intents still applicable. Host/seat permissions re-evaluated on every write and frame. Missing/revoked cookies require a new seat in lobby or a pre-authorized recovery flow. An alias alone cannot restore a hidden hand. Provide read-only degraded status and an honest expiry result. [Lifecycle](room-lifecycle.md) · [Security](../planning/SECURITY.md)
