# Delivery ledger

Planning baseline established on 26 November 2026. Audited source SHA e76f4f4b82b587eb30c3dd6f93f2711d5cf28be8. **The plan is in review. Implementation awaits approval.** Current evidence includes the repository audit, desk research, eight proposed GDDs, baseline unit/Chromium results and design review. Planning validation resolved all 145 internal Markdown references from the 26 documents and rendered all 11 Mermaid diagrams to SVG. No hosted pilot, case sale, capacity promise, paid deployment, live inference or ad activation has been verified.

| Tasks | Status | Evidence or blocker | Next action when authorized |
|---|---|---|---|
| P0 | Awaiting owner review | [Executive decision](MASTER_PLAN.md), [open assumptions](RISKS.md) | Record review, operator/domain facts, budget and staffed pilot dates. |
| F1, F2, F3 | Queued, ordered | P0 · [audit](REPOSITORY_AUDIT.md), [known Tamil failure](TESTING.md) | Reproduce baseline and build isolated static/live boundary, then schemas and persistence. |
| P1, A1, I1 | Queued | Contract and content dependencies in [backlog](TASK_BACKLOG.md) | Build shell and static rules independently · integrate after first slice. |
| S1, R1, O1, L1 | Queued | [Friend Court](../games/friend-court.md), no pilot evidence | Complete slice, freeze tested contracts, rehearse restore then invite pilot. |
| G2, G3, G4, G5 | Queued | R1 | Deliver separate modules and their GDD fixtures, one limited release at a time. |
| G6/E1, G7/V1, G8/C1 | Conditional | Venue ops, media erasure and corpus proof respectively | Produce per-specialty release evidence. |
| B1 | Conditional | No demonstrated buyer or commercial support owner | Test paid intent and quantify support before checkout work. |

## Resume and reporting

Integrator edits the ledger at each checkpoint. Split a row when a task starts. Record task ID, status (queued/active/blocked/review/verified/released/retired), accountable owner, worktree branch, base and last commit SHA, exact files, commands/seed, evidence link, reviewer, blocker, next command, rollback version and update date. Keep sensitive traces/keys, private content and participant data out of the repository. A PR that passes tests is “verified” only after reviewer signoff. “Released” requires deploy version, enabled cap and a completed end-to-end production smoke using a private test room. An interruption is resumable from the last SHA and evidence. Compare current main and rerun the failing command before changing shared contracts.

**The product owner reviews** the planning PR and chooses approve, revise or hold. Record the decision and scoped service budget before application work begins.
