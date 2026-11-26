# P0 — Executed analytical rule checks

26 November 2026. Model of published rules only; no game engine exists. Local Python executed exhaustive Friend Court scoring and aggregate Corporate allocation enumeration. No network, player data or application modifications.

## Results

Friend Court: for N=4,6,12 enumerate 3^(N−2) juror vote profiles times four advocate pass/active combinations. Checked 36, 324, 236196 cases respectively, total 236556. Assertions: scores 0/1, passers never score, zero votes score zero, swapping A/B is symmetric. All passed. With both advocates active, positive ties among vote profiles: 2/9, 18/81, 8952/59049; these are combinatorial counts, not probabilities of real voting. Full timed phases total 75N seconds (5,7.5,15 minutes), double timers 10,15,30 minutes, excluding setup, reading, transitions and results. Each seat advocates twice, juries N−2 hearings. At 12 seats, 10 jury hearings; actual engagement unknown. Recommend 4–6 provisional pilot, observe idle/pass and ties.

Corporate: six legal two-unit allocations per seat. Exact aggregate dynamic programming counts profiles without enumerating all seat sequences in memory. No role powers in model. Normal successful allocations for N=4/6/8/10: 727/1296, 27436/46656, 1036783/1679616, 39000744/60466176. Crunch or audit: 449/1296, 19356/46656, 789921/1679616, 31278864/60466176. Maximum V in a successful normal quarter = N, in crunch/audit = N−1. These are counts, not actual success rates.

Fixed peer policy: all other players submit 1D1T for four quarters; events normal, crunch, audit, small contract; no powers. Enumerate all 6^4=1296 sequences for focal player per mandate and seat count. At all tested N, cooperative 1D1T each quarter scores 7/7/4 for D/T/V mandates. Best responses score 9/9/8 respectively. Pure 2V each quarter scores 1/1/4; it cannot farm unlimited credits. Examples: D mandate (1D1V,1D1T,1D1V,1D1T) scores 9; V mandate (1D1V,1T1V,1D1V,1T1V) scores 8. Conditional free-riding opportunity exists if others cooperate; not a proven dominant strategy or full equilibrium. Test actual negotiation, repeated roles and event shocks before balance changes.

## Reproduction

Standalone Python 3; analytical model is not production code. Save fenced block as a temporary file and run python3. No dependencies.

```python
from itertools import product
from collections import Counter
from math import ceil

def score(a,b,aa,bb):
    if (not aa and not bb) or a+b==0: return (0,0)
    if aa and not bb: return (int(a>b),0)
    if bb and not aa: return (0,int(b>a))
    return (int(a>=b),int(b>=a))

for n in (4,6,12):
    counts=Counter(); checks=0
    for votes in product((0,1,2),repeat=n-2):
        a,b=votes.count(0),votes.count(1)
        for aa,bb in product((False,True),repeat=2):
            s=score(a,b,aa,bb); checks+=1
            assert all(x in (0,1) for x in s)
            assert aa or s[0]==0
            assert bb or s[1]==0
            assert a+b!=0 or s==(0,0)
            assert s==score(b,a,bb,aa)[::-1]
            if aa and bb: counts[s]+=1
    print("FRIEND",n,checks,dict(sorted(counts.items())),75*n,150*n)

orders=[(d,t,2-d-t) for d in range(3) for t in range(3-d)]
for n in (4,6,8,10):
    dp=Counter({(0,0,0):1})
    for _ in range(n):
        nxt=Counter()
        for a,k in dp.items():
            for b in orders:
                nxt[tuple(x+y for x,y in zip(a,b))]+=k
        dp=nxt
    assert sum(dp.values())==6**n
    for label,dd,tt in [("normal",0,0),("crunch",1,0),("audit",0,1)]:
        ok=[(k,v) for k,v in dp.items()
            if k[0]>=ceil(n/2)+dd and k[1]>=n//2+tt]
        print("CORP",n,label,sum(v for k,v in ok),6**n,max(k[2] for k,v in ok))
    events=[(0,0),(1,0),(0,1),(0,0)]
    def evaluate(seq,mandate):
        prestige=0; credits=1; contribution=[0,0,0]
        run=2; successful=0; work=0
        for i,(d,t,v) in enumerate(seq):
            dt,tt=events[i]
            success=d+n-1>=ceil(n/2)+dt and t+n-1>=n//2+tt
            r=min(v,credits); credits-=r; prestige+=r
            if success:
                successful+=1; work+=int(d+t>0)
                prestige+=int((d,t)[i%2]>0)
                if d+t==2: credits=min(2,credits+1)
                run=min(4,run+1+int(i==3))
            else: run=max(0,run-1)
            for j,x in enumerate((d,t,v)): contribution[j]+=x
            if not run: return (-1,0,0,tuple(contribution))
        return (prestige+3*int(contribution[mandate]>=4),work,successful,tuple(contribution))
    for m in range(3):
        baseline=evaluate([(1,1,0)]*4,m)
        greedy=evaluate([(0,0,2)]*4,m)
        best=max(((evaluate(seq,m),seq) for seq in product(orders,repeat=4)),
                 key=lambda x:x[0][:2])
        print("BEST_RESPONSE",n,"DTV"[m],baseline,greedy,best)
```

Return to [P0 validation](P0_VALIDATION.md). Real group comparison remains pending; no pilot selection based solely on this model.
