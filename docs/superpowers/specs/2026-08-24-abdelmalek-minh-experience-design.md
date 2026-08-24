# Abdelmalek Marwan — Minh-Inspired Experience Redesign

**Date:** 2026-08-24  
**Status:** Approved for implementation planning  
**Supersedes (for UX/visual direction):** `2026-08-24-abdelmalek-portfolio-design.md` (keep for stack/content baselines that still apply)  
**Primary reference:** [minhpham.design](https://minhpham.design/) (live inspection + user screen recording)

## Goal

Reshape the existing React portfolio prototype so it **feels** like minhpham.design in visual quality, typography, scroll weight, and interaction language — while keeping Abdelmalek’s sections and content model (hero, about, reels, films, contact). Deliver a **working React prototype** in this repo for handoff to a developer.

## Research basis

Live Playwright inspection of minhpham.design and frames from the user’s recording (`Recording 2026-08-24 201851.mp4`) established:

- Fixed full-page Three.js canvas behind UI
- Corner chrome (logo TL, vertical nav TR, socials BL, sound BR — **sound out of scope**)
- Custom cursor / red spotlight dual-text — **custom cursor out of scope**; dual-text kept as **hover layers**
- Palette: near-black `#0d0d0d`, warm taupe text `rgb(183, 171, 152)`, orange-red accent
- Display type: huge, tight, stacked; body: clean sans
- Interactive oversized lists (skills/clients) with highlight bar
- Dual witty copy layers

Audit notes: `.superpowers/sdd/minh-live-audit.md`

## Locked decisions

| Topic | Decision |
|--------|----------|
| Fidelity | Visual + motion language (option B) — **no sound, no custom cursor** |
| Dual text | Hover dual-text (stacked layers; system cursor) |
| Chrome | Corner chrome like Minh (logo TL, vertical nav TR, socials BL) |
| Hero copy | Temporary placeholder EN/AR stubs (final copy later) |
| Work UI | Films = Minh-style huge title list → `/work/:slug`; reels = simpler strip |
| Deliverable | Working React prototype in this repo (reshape existing app) |
| Approach | Rebuild experience shell on existing content/routing |

## Non-goals

- Custom cursor / red circular spotlight cursor
- Sound on/off and ambient audio
- Cloning Minh’s full 3D globe / client-world scenes
- Cloning Minh’s witty copy verbatim
- New backend, CMS, contact form, or custom icon pack
- Final production media/copy (placeholders OK)

## Constraints carried forward

- Static site, no database
- Bilingual EN + AR (RTL for Arabic)
- YouTube + Vimeo, cover-first click-to-play
- Email + social links only
- Empty reel/film lists hide their sections
- Respect `prefers-reduced-motion`
- No custom icon set — corner socials use **text links** (not icon sprites)

## Architecture

### Stack (unchanged core)

- React + Vite + React Router
- GSAP + ScrollTrigger + Lenis
- Three.js via React Three Fiber (restrained fixed backdrop)
- Static content modules + i18n context
- Vercel SPA rewrite already present

### What to keep

- `content/` model (`site`, `reels`, `films`) and helpers
- LocaleProvider / `pickLocale` / embeds helpers
- `/work/:slug` Work page structure (restyle tokens)
- VideoPlayer (autoplay-on-activate + Open video escape)
- CoverImage empty placeholder behavior

### What to replace / add

- Horizontal sticky `Nav` → **CornerChrome** (fixed corners)
- Home section layouts and CSS tokens (taupe / accent / display type)
- Featured card grid → **FilmsList** (huge titles + orange active bar)
- About → **DualText** bio
- Hero → manifesto stacked placeholder + fixed Three backdrop
- Optional `alt` LocaleStrings on site/about/contact for dual layers
- Placeholder hero lines in content

### Site map (unchanged routes)

1. `/` — Hero → About → Reels → Films → Contact  
2. `/work/:slug` — film detail (same tokens)  
3. Reels stay on Home only  

## Visual system

| Token | Value |
|--------|--------|
| `--bg` | `#0d0d0d` |
| `--fg` | `#b7ab98` (taupe) |
| `--fg-bright` | slightly brighter taupe/off-white for active titles |
| `--accent` | `#ff4d2e` (orange-red; tune to match reference) |
| `--bar-ink` | `#0d0d0d` text on accent bar |
| Display font | **Syne** (700/800) as the licensed stand-in for Avant Garde |
| Body font | **Nunito Sans** (EN); **IBM Plex Sans Arabic** (AR) |

## Components (experience layer)

### CornerChrome

- Fixed: logo/lettermark “A” or short wordmark (TL)
- Vertical About / Work / Contact anchors (TR) — dual-label hover optional
- Vertical text social links (BL)
- Language toggle EN | ع near TR
- Does not include sound control

### DualText

- Two perfectly stacked LocaleString layers (primary + alt)
- On hover/focus, reveal alt (CSS mask, clip, or opacity swap)
- Works with system cursor
- Used in About (required); optional on Contact secondary lines

### FilmsList

- Sorted films as oversized stacked titles
- Active index from scroll position and/or pointer
- Active row: full-bleed accent bar; title color becomes `--bar-ink`; hook text visible on bar
- Entire row is a link to `/work/:slug`
- Inactive titles muted taupe

### HeroBackdrop (R3F)

- Fixed full-viewport canvas, `pointer-events: none`
- Subtle grain / soft light / slow drift; optional parallax with scroll
- Not a product globe or game world
- Disabled when reduced motion or no WebGL; CSS gradient fallback

### ReelsStrip

- Compact horizontal/grid strip using existing VideoPlayer
- Visually secondary to FilmsList

## Content extensions

Extend static content (illustrative):

```ts
hero: {
  label?: LocaleString
  lines: LocaleString[]  // stacked manifesto lines (placeholders)
  accentLineIndexes?: number[]
}
about: { primary: LocaleString; alt: LocaleString }
```

Placeholder English examples (temporary — replace later):

- Label: `Abdelmalek Marwan`
- Lines: `CUTTING`, `STORIES`, `THAT`, `LAND`
- Accent on `STORIES` (or similar)
- About primary / alt: professional vs slightly bolder alternate (placeholders)

Arabic stubs required for bilingual layout testing.

## Motion

- Lenis smooth scroll + GSAP section reveals
- FilmsList active-bar transition eased
- DualText hover transition ~200–400ms
- Reduced motion: disable Lenis theater + WebGL; keep usable layout and focusable DualText

## Error handling

- Unchanged VideoPlayer failure/outbound link behavior
- Hide empty Reels / Films sections
- Locale fallback to English when AR missing

## Testing / handoff QA

- Corner nav jumps to About / Films (Work) / Contact
- DualText hover + keyboard focus
- FilmsList active bar + navigation to Work page
- Reels play (YouTube + Vimeo)
- EN ↔ AR RTL
- Reduced-motion path
- Desktop + phone smoke

Handoff package = this spec + running prototype (`npm run dev` / `npm run build`).

## Success criteria

- A client familiar with minhpham.design recognizes the **same class of experience** (type, framing, list interaction, dual-text, scroll weight) without mistaking it for a clone
- Abdo’s work (reels + films) remains the proof of craft
- Prototype is continue-able by another developer without a database

## Open inputs (non-blocking)

- Final hero/about/contact copy (EN/AR)
- Real email, socials, covers, embeds
- Optional later swap of Syne for a closer licensed Avant Garde equivalent
