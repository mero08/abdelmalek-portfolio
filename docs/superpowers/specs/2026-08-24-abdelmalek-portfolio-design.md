# Abdelmalek Marwan — Video Editor Portfolio Design

**Date:** 2026-08-24  
**Status:** Approved for implementation planning  
**Primary reference:** [minhpham.design](https://minhpham.design/)

## Goal

Build a professional, static portfolio website for video editor **Abdelmalek Marwan** that impresses clients through craft-level design and motion, then earns trust by showcasing reels and featured films. The site should feel like a deliberate journey (not a static brochure), closely matching the structure and dark editorial personality of minhpham.design, adapted for video work.

## Non-goals

- No database, CMS, or backend application logic
- No custom icon system or icon set creation
- No heavy Three.js “game world” or drive-around 3D playground
- No contact form (email + social links only)

## Decisions (locked)

| Topic | Decision |
|--------|----------|
| Visual / structural reference | Closely follow minhpham.design structure and mood |
| Approach | Homepage scroll journey + dedicated pages for large films |
| Motion / 3D | Mostly GSAP; light WebGL (Three.js / R3F) for hero and image/work transitions only |
| Mood | Dark premium editorial — match Minh, not a separate “film grain” redesign |
| Video hosting | Mix of YouTube and Vimeo embeds |
| Language | Bilingual English + Arabic (RTL for Arabic) |
| Contact | Email + social links |
| Content updates | Static files (JSON/TS + images); redeploy to publish |

## Architecture

### Stack

- **React + Vite + React Router** — static build, deployable to Vercel or any static host
- **GSAP + ScrollTrigger** for scroll storytelling and typography motion
- **Lenis** for smooth scrolling
- **Three.js via React Three Fiber** only for light hero atmosphere and work-card / cover transitions
- **i18n** with language toggle (`EN` | `ع`); Arabic layout uses RTL
- **No runtime database**; all content is local

### Site map

1. **Home** (`/`) — single scroll journey
   - Hero → About → Reels → Featured / Large films (previews) → Contact
2. **Film project pages** (`/work/:slug`)
   - One page per featured long-form piece
3. Reels remain on the homepage (no per-reel routes)

### Content model (static)

Store bilingual content in local modules or JSON under something like `content/`:

- **Site:** name, role lines (EN/AR), about (EN/AR), email, social URLs
- **Reels:** id, title (EN/AR), cover image path, embed provider (`youtube` | `vimeo`), embed URL
- **Films:** slug, title (EN/AR), short story (EN/AR), role/credits (optional EN/AR), cover image, stills[], embed provider, embed URL, sort order

Updating the portfolio = edit content files + assets, then redeploy.

## Homepage experience

### Hero

- Full-viewport, dark editorial frame
- Large typography: **Abdelmalek Marwan** + short role line in the active language
- Light WebGL layer (subtle atmosphere / soft light / restrained displacement on still or portrait) — not a dense 3D scene
- Optional Instagram portrait if quality is strong enough; otherwise typography + motion carry the hero
- Scroll cue into the journey using type or a simple line (no icon pack)

### About

- Short, confident bilingual bio
- Emphasize craft and client trust, not a long CV
- Quiet Minh-like motion (text reveals, soft parallax)

### Reels

- Horizontal strip or compact grid of short-form work
- Cover frame + title; click loads/plays YouTube or Vimeo
- Optimized for quick scanning of cutting style and energy

### Large videos (featured)

- Larger case-study style cards (Minh project-block rhythm)
- Cover + title + one-line hook
- Click navigates to the dedicated film project page
- Light WebGL hover / transition treatment on covers where it earns the cost

### Contact

- Email mailto + social links only
- Closing bilingual line; clean, uncluttered footer of the journey

### Global UI

- Minimal sticky nav: section anchors + language toggle
- Smooth scroll; respect `prefers-reduced-motion` (simplify motion, disable or gate WebGL)
- No custom icons — typography and text links

## Film project pages

Each featured film page includes:

- Full-bleed cover / hero still
- Title + short story (EN/AR)
- Optional role / credits
- Primary YouTube or Vimeo embed
- Optional stills strip
- Back to Featured on home; optional previous / next film links
- Same dark motion language as the homepage
- No comments, CMS, or dynamic user content

## Data flow

```
content/* (static) → React pages → GSAP scroll scenes
                                 → light R3F/WebGL layers
                                 → lazy YouTube/Vimeo players
```

- Covers and stills load from `/public` (or equivalent static assets)
- Embeds lazy-load when near viewport or on explicit click (cover-first playback preferred)
- Language preference can persist in `localStorage`; default to browser language when Arabic or English is detected, otherwise English

## Error handling and empty states

- Broken embed: show cover + “Video unavailable” message + outbound link to host
- Missing cover: dark title placeholder (no icon)
- Missing translation string: fall back to English (or the other available language)
- Empty reel or film lists: hide that section entirely until content exists

## Performance

- Compress images; avoid autoplaying heavy hero video by default
- Pause WebGL when the document is hidden
- Keep the Three.js surface small so weight stays closer to Minh than to heavy WebGL studios
- Prefer click-to-play over multiple simultaneous embeds

## Testing plan

- Visual QA in English and Arabic (RTL) on desktop and mobile
- Verify: hero load, language toggle, reel playback, film page navigation, mailto and social links
- Smoke-test on a mid-range phone (motion + embeds)
- Reduced-motion path: site remains usable without scroll theater / WebGL

## Research notes (direction)

Primary inspiration and structural north star:

- [https://minhpham.design/](https://minhpham.design/)

Related references reviewed during brainstorming (not to clone; context for quality bar):

- Video-editor adjacent: [https://dny19.com/](https://dny19.com/)
- Scroll storytelling / WebGL craft: [https://themonolithproject.net/](https://themonolithproject.net/), [https://bilal.show/](https://bilal.show/), [https://lusion.co/](https://lusion.co/)
- Collections: [Awwwards Three.js](https://www.awwwards.com/websites/three-js/), [Awwwards scrolling](https://www.awwwards.com/websites/scrolling/)

## Open inputs (not blockers for planning)

- Final Instagram portrait decision for hero/about (user may supply photo)
- Exact social URLs, email, and initial reel/film list
- Final Arabic copy (can start with EN placeholders + AR stubs)

## Success criteria

- Client opens the site and immediately feels premium craft (hero + motion)
- Within one scroll session they understand who Abdo is and see proof via reels + featured films
- Featured films have room to breathe on dedicated pages
- Site works in English and Arabic without a backend
- Performance stays acceptable on typical client devices
