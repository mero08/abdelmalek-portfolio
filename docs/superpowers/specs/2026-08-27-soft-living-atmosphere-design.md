# Abdelmalek Portfolio — Soft Living Film Atmosphere (Site-Wide)

**Date:** 2026-08-27  
**Status:** Approved for implementation planning  
**Related:**  
- `2026-08-24-abdelmalek-minh-experience-design.md` (fixed full-page Three canvas behind UI)  
- `2026-08-26-award-hero-hybrid-design.md` (Hero WebGL stays)  
- `2026-08-27-about-cut-room-design.md` (About content unchanged)  
**Primary references:** [minhpham.design](https://minhpham.design/) fixed canvas · Codrops scroll-reactive grain/mood backgrounds · soft cinematic intensity (user lock)

## Goal

Replace the flat static `#0d0d0d` under **About → Reels → Films → Contact** with one **soft, living film atmosphere** so the page never feels like a still picture after Hero. Motion is **felt more than seen**. Each section enter triggers a **bright light swell**, then settles — so scrolling never feels boring.

Deliverable: **complete end-to-end** in this repo, verified in-browser while scrolling against award-site quality. No half-finished backdrop.

## Problem (current)

| Zone | Today |
|------|--------|
| Hero | Alive — WebGL noise, grain, cinema |
| About → Contact | Dead — flat solid background |

Feedback: “nice, but the background is missing something / must move.” Intensity locked to **soft & cinematic (1)**, plus **enter light** so section changes are clear.

## Locked decisions

| Topic | Decision |
|--------|----------|
| Approach | **A — Living Film Atmosphere** (one fixed site-wide canvas) |
| Intensity | **1 — Soft & cinematic** (felt, does not steal focus from text/video) |
| Section enter | **Bright light swell → settle** (~0.4–0.8s), not a harsh flash; not permanently brighter for the whole section |
| Scope | **Background system only** — no layout redesign of About / Reels / Featured / Contact |
| Hero | Existing Hero WebGL + cinema **kept**; site atmosphere sits under the page and does not replace the Hero cinema reveal |
| Stack | React Three Fiber + GLSL already in repo — **no new npm deps** |
| Sound | None |
| Interaction | Soft cursor-follow glow (lerped); subtle scroll-velocity breath |
| Fallbacks | No WebGL / `prefers-reduced-motion` → static soft gradient (+ optional static grain); never blank |
| Verification | **Mandatory** live scroll QA in browser before claiming done (see Success criteria) |

## Non-goals

- Spline / heavy meshes / particle storms  
- Per-section different 3D scenes or camera fly-throughs  
- Loud cursor trails or flash-bang transitions  
- Changing section layouts, copy, or About stats in this task  
- Cloning Minh’s globe / client-world geometry  
- Site-wide lens cursor on every element (existing cursor rules stay)

## Visual behavior

### Continuous (always on when WebGL enabled)

1. Near-black base matching `--bg` family  
2. Slow drifting noise / fog (never frozen)  
3. Subtle film grain every frame (editor language)  
4. Soft orange accent glow at very low opacity  
5. Cursor: glow center lerps toward pointer (gentle, not glued)  
6. Scroll: tiny luminance/noise breath from velocity; settles when idle  

### On section enter (About, Reels, Featured/Films, Contact)

1. Detect section crossing into view (ScrollTrigger or IntersectionObserver + Lenis-safe)  
2. Drive a `uEnter` (or equivalent) uniform **0 → peak → 0** over ~0.4–0.8s  
3. Peak = brighter, warmer/orange lift — “cut-room light coming up”  
4. Settle into that section’s resting mood  

### Resting mood per section (subtle, not a new scene)

| Section | Mood |
|---------|------|
| About | Slightly warmer |
| Reels / Featured | Slightly deeper / cooler dark |
| Contact | Quieter / lower energy |

Same world, different lighting — never a hard wallpaper cut between sections.

### Hero relationship

- Hero keeps its own pinned cinema WebGL.  
- Site atmosphere is fixed behind the Home content stack.  
- Hand-off Hero → About must not flash blank or double-grain harshly; if both layers visible, atmosphere intensity under Hero may be reduced or Hero canvas remains the hero’s own plate — **no visible seam or flicker** on scroll out of Hero.

## Architecture

### Units

| Unit | Responsibility |
|------|----------------|
| `SiteAtmosphere` | Fixed full-viewport R3F canvas; `pointer-events: none`; under content `z-index` |
| Atmosphere shader | Fragment shader: noise fog, grain, cursor glow, scroll breath, enter swell, section mood |
| `useAtmosphereDriver` | Pointer lerp, scroll velocity, active section index → uniforms |
| Mount point | Once on **Home** (`pages/Home.tsx`), not per section |
| `useWebglEnabled` | Reuse existing sync detect + reduced-motion gate |
| CSS fallback | Soft radial/linear gradient on a fixed div when WebGL off |

### Data flow

```
pointermove → lerped uMouse
Lenis/scroll → uScrollVel (decay when idle)
section observers → activeSection → uMood + enter pulse (uEnter)
clock → uTime
shader → pixels behind DOM content
```

### Performance rules

- `dpr` capped (e.g. `[1, 1.5]`)  
- `frameloop: 'never'` when `document.hidden`  
- `antialias: false` acceptable for full-screen quad  
- No layout thrashing; transforms/uniforms only  
- Pause or simplify on coarse pointer / reduced motion  

### Content readability

- Peak enter light must **not** wash out DualText, reel covers, film titles, or contact links  
- Atmosphere stays behind; never capture clicks  
- Existing cursor lens + social magnets must keep working unchanged  

## Testing & verification (non-negotiable)

### Automated

- Unit/smoke: atmosphere mounts when WebGL on; fallback renders when off / reduced motion  
- Existing suite still green (About, Nav, Hero, etc.)

### Live browser QA (implementer must do this themselves while building)

Full scroll passes on desktop (and a mobile width check):

1. Hero → About → Reels → Films → Contact — **no flicker, tear, blank flash, or sticky lag**  
2. Fast scroll and slow scroll — Lenis + atmosphere stay in sync  
3. Each section enter shows a **visible soft light swell**, then settle  
4. Manifesto / About lens + corner social magnets — still correct; no hit-target blocking  
5. Resize — canvas covers viewport; no seams or letterboxing gaps  
6. Tab hide/show — no stuck GPU loop; resumes cleanly  
7. Reduced motion / no WebGL — static fallback; content fully readable  

**Done means:** implementer has watched the full scroll themselves and would put it next to international award portfolios without apology. If any item fails, it is not finished.

## Success criteria

1. Below-Hero background never looks like a static screenshot  
2. Soft cinematic intensity — felt, not competing with content  
3. Clear enter-light beat on every major section  
4. One continuous world language (dark / taupe / orange / grain)  
5. Smooth mid-laptop scroll; reduced-motion safe  
6. End-to-end complete with live QA checklist checked off  

## Implementation notes for planning

- Prefer one shader plane (fullscreen quad), not multiple meshes  
- Section detection via existing GSAP ScrollTrigger + Lenis sync already in repo  
- Keep About cut-room pin and Hero pin working; atmosphere must not fight pin math  
- Spec path for plan handoff: this document  

## Out of scope for later

- Work page (`/work/:slug`) atmosphere (Home first; Work can inherit later if needed)  
- Stronger intensity modes (user locked soft)  
