# Abdelmalek Portfolio — About “Cut Room” Section

**Date:** 2026-08-27  
**Status:** Implemented  
**Related:** `2026-08-24-abdelmalek-minh-experience-design.md`, `2026-08-25-minh-circular-lens-cursor-design.md`

## Goal

Transform the About section from a single dual-text paragraph into an award-density **Act 2**: bio copy plus animated, editor-native stat cards that count up on scroll — never boring, never generic SaaS boxes.

## Locked decisions

| Topic | Decision |
|--------|----------|
| Layout | Two-column **Cut Room**: copy left, stat stack right (desktop); stacked on mobile |
| Motion | **Pinned + scrub** on desktop (GSAP ScrollTrigger, Lenis-synced); enter + count on mobile |
| Stats | 3 cards: videos edited, years in cut, clients — values in `site.aboutStats` |
| Number style | **Editor-native**: `000120+` frames, `00:07` timecode years, `00034+` count |
| Dual text | **Keep** Minh-style lens on bio (`DualText`) |
| Libraries | GSAP only — no new npm deps |
| a11y | `prefers-reduced-motion`: final numbers, no pin; `aria-label` on stat values |
| i18n | EN + AR labels/details; RTL-aware card entrance direction |

## Non-goals

- Magnet cursor on stat cards (keeps focus on scroll story)
- 3D / Spline stats
- CMS for stats (static `site.ts` for now)

## Architecture

- `About.tsx` — section shell, grid, `useAboutChoreography`
- `AboutStatCard.tsx` — single stat card markup
- `useAboutChoreography.ts` — pin/scrub timeline + counter tweens
- `formatStatValue.ts` — frames / timecode / count formatting
- `site.aboutStats` — content source

## Success criteria

- [x] Scroll into About pins briefly; cards stagger in; numbers count up
- [x] Bio lens cursor still works on DualText
- [x] Mobile: no pin; cards reveal on enter viewport
- [x] Reduced motion: static final values
- [x] Tests for formatter + About render
