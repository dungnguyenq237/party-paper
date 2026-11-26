# Public experience, localization and discovery

## Public information architecture

Keep the established homepage maker, print guides, /games.html, `?game=` and `?lang=` links. Add “Play together” in navigation alongside Print when the first live game is released. The live catalog helps a host choose by number of people, available time, required equipment and whether reading/speaking is involved. Only offer Create on operational games. Use compact text and a purposeful illustration or worked example, not eight identical dashboards. The GDD for each title owns its identity and game-specific screens.

Serve static, independently navigable `/en/games/<slug>/` and `/vi/games/<slug>/` on the chosen live canonical origin, preferably shared with the print site when safe. Stable slugs can stay the same across languages. Public pages include the player count/time, what each person needs, full rules, a complete original annotated turn, accessibility options, FAQs, replay variation, related printable and Create/Join links. Include genuinely useful additional strategy/case guides only when there is enough original material. Keep spoilers off public mystery pages. Generate title, description, social image/text, canonical, reciprocal hreflang (including self and x-default on the EN default), html lang and breadcrumbs from the same public descriptor. Add truthful WebPage/Game and BreadcrumbList JSON-LD consistent with visible content and verify with applicable validators. Search features are not guaranteed. Include only available public URLs in sitemap. [Google localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)

`/play/`, private room, presenter and join pages return a generic shell with noindex and no-store, no personalized Open Graph, no referrer and session authorization before private content. Return 404/410 for expired private resources without leaking membership. Do not rely on robots.txt to protect a room or block crawlers from reading a needed noindex. Never put secrets in parameters. Exchange invitation fragments server-side. Track paid pages and broad public rules independently. Keep one canonical URL per public resource. Preserve existing print canonicals if the hostname cannot transfer; link to the live origin without cross-origin room cookies. Verify redirects for root and project subpath before any later domain move.

## Localization and design work

Use stable `game.phase.action` message IDs with typed interpolation and count/plural formatting. One public and one protected content manifest per game and locale. Server sends IDs/parameters and stable option IDs. Each device can render VI or EN independently without changing choices. Native editors sign off tone, pronouns, time formats, line breaks, private clues and quiz equivalence. Fallback to EN for a missing runtime UI message. Withhold publication of a half-translated case or public page. Do not run the old DOM scanner over game rooms or translate player-authored text. Preserve the existing 38-catalog print behavior. Test NFC/diacritics, long VI labels, English fallback and RTL isolation with old navigation.

Reuse proven color roles, visible focus, reduced motion and the system theme, then scope each theme in its game entry. Local display font only when its glyphs, license and contrast fit. Each action must work with touch, keyboard and text-only status. The host can teach a room by reading a short original example. Make “joined”, “saved”, “locked”, “disconnected” and “expired” visibly distinct and announce important changes at sensible intervals. Localize the QR fallback code, print emergency run sheet and position of controls when zoomed.

## Organic acquisition experiments

| Game | Useful indexable content | Invite/replay loop to test |
|---|---|---|
| Friend Court | How to host a fictional hearing, sample harmless docket, typed house rules | Preview a fictional verdict, invite friends into a fresh hearing. |
| Corporate Chaos | Four-quarter facilitator worksheet, runway example | Team shares aggregated debrief and schedules a second session with different mandates. |
| Cold Case Vietnam | Spoiler-free case brief, clue-reading tutorial, fact vs inference | Teaser for next case · users opt in to release news separately. |
| Night Market | Worked clearing-price example and trading glossary in VI/EN | Share last market's public price history, play a new festival seed. |
| Inheritance War | Sample will and tied vote, group negotiation guide | Archive summary and new estate with rotated chair. |
| Wedding Arena | Printable MC checklist, projector rehearsal, mixed-language event guide | Planner invites a co-host to rehearsal, then books another date. |
| Voice Telephone | How consent and deletion work, original zero-recording practice round | Share a prompt card, subsequent group makes its own chain. |
| AI Battle Arena | Solved prompt recipe with rubric and provenance | Replay a released weekly brief at zero live cost if editorial cadence permits. |

Prefer the device share sheet with copy-link fallback, explicit preview and no address-book access. Serve public static result art or render safe aggregates locally. Do not index per-result pages. Offer a related game matching group size, language and time. Compare referral-to-joined-session and actual replay, with consent where required. Release weekly content or community submissions only when moderation/editorial ownership is funded. [Analytics](ANALYTICS.md) · [Market evidence](MARKET_RESEARCH.md)

## Independent review correction (IR-H03, IR-M02)

Existing 38 UI locale catalogs do not imply 38 indexable language pages. No mass-generated thin guides, untranslated public pages or sitemap entries for unreleased games. Verify Search Console ownership/status and route metadata, actual acquisition and editorial value. Same-origin live UI/API; preserve print site and its local-only privacy scope if routing migration is unsafe. Private room noindex/no-store, auth and no-referrer are separate controls. Update product truth only during approved implementation; no source/metadata changes in planning review.
