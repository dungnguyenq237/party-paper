# P0 — Product and infrastructure validation

**Status: active; F1 blocked pending evidence and owner signoff.** Started 26 November 2026 at merged main `5742af783522adffcafc3b987be56e164de908db`. Owner confirmed PRs #1/#2 merged and requested P0. This authorizes discovery and planning artifacts only; no application code, infrastructure purchase, production configuration change or deployment.

## Evidence ledger

| Gate | Status | Evidence and remaining requirement |
|---|---|---|
| Merged architecture and planning | Verified | [PR #1](https://github.com/dungnguyenq237/party-paper/pull/1) merged to main at 5742af7; [PR #2](https://github.com/dungnguyenq237/party-paper/pull/2) merged to planning at 059d9e8. Comparison with application baseline e76f4f4 shows 27 changed Markdown docs only. |
| Existing app checks | Partial | [Merged-main CI](https://github.com/dungnguyenq237/party-paper/actions/runs/45769926924) had completed npm ci and npm test successfully; Chromium install underway at inspection. [Pages run](https://github.com/dungnguyenq237/party-paper/actions/runs/45769926468) succeeded. Local Node 22.16.0; git ls-remote failed DNS resolution for github.com, so no fresh local app test/clone. Tamil 320px known issue remains for F1. Do not infer local resolution from green remote CI. |
| Hosting/provider capabilities | Verified public facts | [Render free](https://render.com/docs/free), [disks](https://render.com/docs/disks), [pricing](https://render.com/pricing), checked 26 November 2026: free web instances lose local data on restart/spin-down and cannot attach a disk; paid disk single runtime instance, no zero-downtime deploy; compute $7/512 MiB, $25/2 GiB, disk $0.25/GB-month; example Hobby bandwidth 5 GB then $0.15/GB. Recheck before purchase. |
| Actual account service/usage | Blocked | Connector listed one workspace named My Workspace. It explicitly requires user-confirmed workspace before inspecting services; no service/account config or invoice verified yet. Public URL requests from review environment failed (not evidence of site outage). Need owner confirm workspace and then inspect service type, plan, repo, branch, build/publish/start, region, auto deploy, disk and domain. |
| Safe routing / privacy | Proposed | Preserve current print URL and static artifact. If current service static, keep it and use a separate same-origin live UI/API until safe controlled domain migration; never share live cookies across origins. Verify actual hostname/domain rights, fallback URL, provider retention and owner age/privacy/support policy. No cutover in P0. |
| Budget | Proposed, unapproved | Recommend initial maximum incremental spend of $15/month, no paid resource purchase until authorized; see model below. Actual workspace-wide usage and existing services can change cost. |
| Mechanical review | Executed (synthetic only) | [P0 rule checks](P0_RULE_CHECKS.md): 236,556 Friend Court scoring inputs and exact Corporate allocation/profile counts plus fixed-peer best responses. This is a standalone analytical model, not production engine, simulated humans or evidence of demand. |
| Comparative human trials | Not started | [Playtest kit](P0_PLAYTEST_KIT.md) ready. Recruit six independent groups who try both candidates; span EN/VI and 4/6 seats, counterbalance order. Actual recorded sessions = 0/6 per candidate. Do not invent results. |
| Candidate selection | Provisional | Friend Court remains default engineering candidate, 4–6 player pilot; Corporate Chaos tests deeper choices, but mechanical results show balance/teaching risk. Neither demand nor product selection approved until P0 playtest evidence. |
| Owner authorization | Pending | Confirm brand, actual budget, canonical rights, audience ages, bilingual editorial and private support operator, observed trial outcomes and selected S1. Approval of PRs is not approval of field results or F1. |

## Cost and hosting decision

Preferred initial topology: retain existing static print service, add one paid web service with a 1 GB disk only when needed, use same-origin live client + WSS, single Node writer with SQLite. Do not provision until F1/F3 needs are approved; local work and paper testing cost $0 incremental infrastructure. If existing hostname can be safely preserved, shared public origin is acceptable; otherwise cross-link two public origins with independent canonicals. Keep public static artifact explicitly deployable without backend. Never serve repository root or disk.

Illustrative incremental monthly service cost = 7 + 0.25 + 0.15 × max(0, additional outbound GB − remaining included GB), before taxes/domain/other services. If remaining allowance is zero, 5 GB incremental outbound = $8.00; 25 GB = $11.00; 50 GB = $14.75. If 5 GB remains, same scenarios are $7.25/$10.25/$14.00. $15 is a proposed pilot cap, not an account limit or automatic spending control. Check billed allowances and other workspace services. A $25 compute tier alone exceeds cap and needs explicit approval. Alert at 70% of budget, close new rooms before exceeding 90% projected monthly incremental spend; quotas/monitoring are later implementation requirements. No live inference, audio, payments, accounts or paid venue service. No permanent event log or backup resurrection of guest state.

## Owner decision receipt (fill privately, record non-sensitive conclusion)

- Workspace: confirm My Workspace or specify intended workspace.
- Service facts: service type, repo/branch, build/publish/start, instance tier, region, disk, auto-deploy, current URL; actual remaining allowance/bill (do not commit invoice, credential, payment data or secret).
- Brand/canonical: keep Party Paper, use Party Partner as working live collection unless owner chooses otherwise; actual domain and redirect authority; tested fallback URL.
- Budget: accept/revise $15/month incremental ceiling, actual account plan/allowance, funding owner. No purchase authorized by this form.
- Pilot audience: adult private friend/coworker groups by default, VI and EN; named operator/editor/private report contact and retention policy. Do not commit participant or private contact data.
- Comparative evidence: complete six paired group sessions; attach aggregate data, preference and repeat intent, note rule ambiguity; no raw names/audio.
- Decision: select Friend Court / Corporate Chaos / revise both; record rationale, date, reviewer, accepted scope. If Corporate wins, revise S1 and G2 dependencies before coding.
- F1 explicit decision: approve / hold, after above gates. F1 includes isolated static/live output, legacy route/locale/print smoke and Tamil fix; no room server or application work before authorization.

## Next action

Ask owner to confirm Render workspace and budget; obtain account facts read-only. Recruit real groups with kit and run comparative sessions. Inspect merged-main browser CI when complete. Record evidence and exact F1 scope in [progress](PROGRESS.md); do not mark P0 verified while any gate is unresolved. No automatic merge, payment or deployment.
