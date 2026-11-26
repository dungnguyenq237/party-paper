# P0 — Product and infrastructure validation

**Status: active; F1 blocked pending evidence and owner signoff.** Started 26 November 2026 at merged main `5742af783522adffcafc3b987be56e164de908db`. Owner confirmed PRs #1/#2 merged and requested P0. On 26 November the owner explicitly confirmed read-only inspection of My Workspace, $0/month incremental infrastructure budget and provisional Friend Court with the comparative human gate retained. This authorizes discovery and planning artifacts only; no application code, infrastructure purchase, production configuration change or deployment.

## Evidence ledger

| Gate | Status | Evidence and remaining requirement |
|---|---|---|
| Merged architecture and planning | Verified | [PR #1](https://github.com/dungnguyenq237/party-paper/pull/1) merged to main at 5742af7; [PR #2](https://github.com/dungnguyenq237/party-paper/pull/2) merged to planning at 059d9e8. Comparison with application baseline e76f4f4 shows 27 changed Markdown docs only. |
| Existing app checks | Partial | [Merged-main CI](https://github.com/dungnguyenq237/party-paper/actions/runs/45769926924) had completed npm ci and npm test successfully; Chromium installation later completed, and E2E was still in progress at the latest job inspection. [Pages run](https://github.com/dungnguyenq237/party-paper/actions/runs/45769926468) succeeded. Local Node 22.16.0; git ls-remote failed DNS resolution for github.com, so no fresh local app test/clone. Tamil 320px known issue remains for F1. Do not infer local resolution from green remote CI. |
| Hosting/provider capabilities | Verified public facts | [Render free](https://render.com/docs/free), [disks](https://render.com/docs/disks), [pricing](https://render.com/pricing), checked 26 November 2026: free web instances lose local data on restart/spin-down and cannot attach a disk; paid disk single runtime instance, no zero-downtime deploy; compute $7/512 MiB, $25/2 GiB, disk $0.25/GB-month; example Hobby bandwidth 5 GB then $0.15/GB. Recheck before purchase. |
| Actual account service/usage | Service verified; billing partial | Read-only Render service list/detail/deploy and metric queries in owner-confirmed My Workspace: party-paper is a static_site on main, active, auto-deploy on commit, dist publish path, previews off, current canonical onrender.com URL. Latest reported live deploy e76f4f4 (20 November). No Node runtime or attached persistent disk exists. Invoice, workspace plan, remaining allowances, custom domain/redirect authority and provider log retention not exposed. See receipt below. |
| Safe routing / privacy | Local topology recorded; external gate open | Preserve existing print URL/service and its static output. Local live UI/API share one loopback origin with WSS or localhost development WS. No public route migration or cross-origin guest cookie. Verify fallback reachability, custom domain rights, retention and operator privacy/support before public cutover. Current review environment cannot reach the public URLs; do not infer outage. |
| Budget | Owner confirmed $0/month incremental infrastructure | No new paid or free cloud resources, no paid domain or external API, no production config change. Existing static hosting remains untouched. Local work only after P0 signoff. Billing and usage limits remain unverified; free resources can still cause overages. |
| Mechanical review | Executed (synthetic only) | [P0 rule checks](P0_RULE_CHECKS.md): 236,556 Friend Court scoring inputs and exact Corporate allocation/profile counts plus fixed-peer best responses. This continuation independently re-executed the Friend Court enumeration and Corporate aggregate counts; counts and invariants matched. This is an analytical model, not production engine, simulated humans or evidence of demand. |
| Comparative human trials | Not started | [Playtest kit](P0_PLAYTEST_KIT.md) ready. Recruit six independent groups who try both candidates; span EN/VI and 4/6 seats, counterbalance order. Actual recorded sessions = 0/6 per candidate. Do not invent results. |
| Candidate selection | Provisional | Friend Court remains default engineering candidate, 4–6 player pilot; Corporate Chaos tests deeper choices, but mechanical results show balance/teaching risk. Neither demand nor product selection approved until P0 playtest evidence. |
| Owner authorization | Partial | Workspace, $0 incremental budget and retained comparative gate explicitly confirmed. Brand/audience, named operator/editor and private support contact, field outcomes and selected S1 remain pending. Approval of PRs is not approval of field results or F1. |

## Verified Render service receipt — 26 November 2026

Read-only connection to owner-confirmed My Workspace. No service mutations, no deployment triggers and no purchases.

| Field | Observed |
|---|---|
| Service / type | party-paper / static_site |
| Repository / branch | dungnguyenq237/party-paper / main |
| Root directory | Repository root |
| Automatic deployment | On commit |
| Build plan | starter (build pipeline, not a Node runtime compute plan) |
| Publish path | dist |
| Pull request previews | Off |
| Public URL | https://party-paper.onrender.com |
| Runtime / disk / region | Static CDN; no app runtime, persistent disk or selectable app region reported |
| Latest reported live deploy | e76f4f4b82b587eb30c3dd6f93f2711d5cf28be8, 20 Nov 2026 23:16 UTC; deployment trigger API |
| State | Not suspended |

Actual build command:

```sh
npm test && mkdir -p dist && cp index.html styles.css app.js core.js dist/ && cp -R assets dist/assets
```

This confirms current build consists of the SEO posttest plus explicit file copies and a broad assets copy. It is not a complete future private/public build boundary. The new planning merge changes docs only; Render's latest reported deploy remains the earlier application SHA. Do not trigger a redeploy just to align the documentation commit.

Metrics read for 19–26 November UTC: bandwidth endpoint returned 23 timestamped values labeled mb; HTTP request-count dataset was empty. No confirmed aggregation semantics, complete visitor denominator or invoice/remaining allowance. Do not infer actual traffic, ad demand or workspace charges from these values. Account invoice/payment method/usage quotas and custom domains are not exposed by available read-only actions; inspect Billing privately if and when needed. Public reachability checks from review environment could not complete; this does not prove an outage. Existing Pages deployment succeeded per Actions, not a verified live same-URL failover.

## $0 cost and hosting decision

Owner explicitly selected $0 monthly incremental infrastructure on 26 November. Supersedes the earlier proposed $15 pilot ceiling and paid-hosting default for current work. Keep all existing hosting, configuration and URLs unchanged. No additional cloud instance, domain, disk, managed DB, external paid API, billing or deployment, including nominally free resources. P0 paper trials do not need hosting. After P0 evidence and owner approval, local F1/F2/F3/S1 may use a single Node process, same-origin localhost client/API, SQLite on the developer's existing disk, isolated temporary test DBs and synthetic fixtures. Keep authoritative transitions, receipts and fencing identical to future hosted architecture. Bind loopback by default, no public tunnel or exposed dev server; trusted HTTPS/WSS setup is required for external-device/security validation later. Local tests cannot establish public RTT, provider restart recovery, venue capacity or uptime. No paid events, audio, inference or commercial entitlements.

A Render Static Site cannot accept upgrades as an application process. Do not alter the static service type or hostname. [Render static sites](https://render.com/docs/static-sites) · [Free limitations](https://render.com/docs/free) · [Persistent disks](https://render.com/docs/disks) · [Billing FAQ](https://render.com/docs/faq). Free Render web services lose local files on spin-down/restart/deploy, have shared instance-hour and usage allowances, cannot attach disks, and can incur overage costs; they are not equivalent to durable production hosting. No free-service workaround is approved. Prior paid scenarios in [deployment](DEPLOYMENT.md) remain sensitivity examples for a future budget decision, not current authorization.

Proposed local-only gate interpretation for owner signoff: verified static topology and zero authorization are sufficient for local architecture planning; leave actual cloud bill/allowance, provider retention, custom-domain transfer, live fallback smoke and production region/load as explicit O1/L1 external release blockers. This does not waive comparative human trials, owner/privacy/operator decisions or F1 approval. Before merging any F1 change that would affect existing auto-deploy, verify exact old static output and safe rollback in isolation and obtain separate production deployment approval. No provider change during P0.

## Owner decision receipt (fill privately, record non-sensitive conclusion)

- Workspace: confirmed My Workspace, read-only inspection; completed.
- Service facts: static site, repo/main, build/publish, auto-deploy, current URL and latest live SHA verified. No runtime/disk. Actual remaining allowance/bill, custom domains and log retention remain unverified; keep payment/invoice/credentials private.
- Brand/canonical: keep Party Paper, use Party Partner as working live collection unless owner chooses otherwise; actual domain and redirect authority; tested fallback URL.
- Budget: owner confirmed $0/month incremental infrastructure. No new resources (paid or free), no upgrade or deployment authorized.
- Pilot audience: adult private friend/coworker groups by default, VI and EN; named operator/editor/private report contact and retention policy. Do not commit participant or private contact data.
- Comparative evidence: complete six paired group sessions; attach aggregate data, preference and repeat intent, note rule ambiguity; no raw names/audio.
- Decision: Friend Court provisional; owner explicitly retains comparative gate. Final selection pending. If Corporate wins, revise S1 and G2 dependencies before coding.
- F1 explicit decision: approve / hold, after above gates. F1 includes isolated static/live output, legacy route/locale/print smoke and Tamil fix; no room server or application work before authorization.

## Next action

Recruit six real independent paired groups using the kit; record aggregate evidence, brand/audience/operator decisions and select candidate. Inspect merged-main browser CI when complete; confirm local-only gate interpretation and exact F1 scope with owner. Do not mark P0 verified while required gates remain unresolved. No automatic merge, payment or deployment.
