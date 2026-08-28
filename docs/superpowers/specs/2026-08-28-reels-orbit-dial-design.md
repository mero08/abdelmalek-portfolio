# Abdelmalek Portfolio — Reels Orbital Dial

**Date:** 2026-08-28  
**Status:** Approved for implementation planning  
**Related:**  
- `2026-08-27-soft-living-atmosphere-design.md` (site-wide backdrop; Reels section mood stays cooler/darker)  
- `2026-08-24-abdelmalek-minh-experience-design.md` (scroll + Lenis patterns)  
**Primary references:**  
- Approved prototype: `.superpowers/brainstorm/7244-1787871686/content/reels-dial-elevated-v5.html`  
- Inspiration: [MSE / Helm Editorial](https://www.mse.tv/) · [Editor Cyclops](https://editor-cyclops.vercel.app/) · [Awwwards portfolio reel](https://www.awwwards.com/inspiration/portfolio-reel-black-airplane-agency) · [Framplates Anamorph](https://framplates.com/anamorph)

## Goal

Replace the current horizontal YouTube/Vimeo strip in **Reels** with an award-quality **3D orbital dial**: ~10 true vertical (9:16) reels on a ring, one **focus reel toward the camera**, draggable with tactile inertia, and **step autoplay** when idle. Only the focus reel streams Mux video; orbiters show covers. Feel must match the approved **elevated v5** prototype — balanced camera, no worm's-eye, no slow idle crawl.

Deliverable: **complete end-to-end** in this repo — content model, R3F stage, physics, Mux playback, tests, live browser QA on desktop + touch.

## Problem (current)

| Area | Today |
|------|--------|
| Layout | Flat horizontal strip of 2 embed cards (`Reels.tsx` + `VideoPlayer`) |
| Content | `EmbedProvider` + YouTube/Vimeo URLs only — no Mux, no ~10 vertical reels |
| Interaction | Static scroll; no signature moment for the section |
| Performance | Multiple iframe embeds if expanded |

User feedback from exploration: flat 2D wireframe and back-facing focus reel were rejected; slow continuous idle crawl was rejected; heavy `rotateX(48deg)` felt worm's-eye. **v5 elevated dial approved as perfectly balanced.**

## Locked decisions

| Topic | Decision |
|--------|----------|
| Layout | **Orbital dial** — ring of ~10 vertical phone frames; **front slot (+Z)** is active |
| Stack | **React Three Fiber** section-local `Canvas` (R3F + drei already in repo) |
| Content | **Mux** playback IDs + cover image per reel; ~10 items in `reels.ts` |
| Aspect | **9:16** vertical phones |
| Camera | **Elevated v5:** eye high, stage lower — mild world `rotateX(≈14°)`, high perspective origin, **not** heavy tip-back |
| Focus size | Center phone **~148×264** logical units vs orbiters **~90×160** (~1.64×) |
| Idle motion | **Step advance:** hold **~1.6s** → rotate one slot **~700ms** (easeInOutCubic) → hold → repeat — **not** slow continuous crawl |
| Drag | Pointer drives ring angle 1:1; release → velocity decay → magnetic snap to nearest front slot |
| Orbiters | **Cover textures only** — no video decode on ring |
| Active reel | **Single Mux stream** on focus slot only |
| Section chrome | Keep existing Reels heading + i18n; replace strip with full-width stage |
| Fallbacks | No WebGL / `prefers-reduced-motion` → accessible static or tap-to-select list (no inertia autoplay) |
| Verification | **Mandatory** live QA: drag, flick, idle step, focus swap, off-screen pause |

## Non-goals (v1)

- Sound on by default  
- Per-reel filters / color grades in 3D  
- Mux upload or CMS admin UI  
- Second site-wide WebGL canvas (Hero + SiteAtmosphere unchanged)  
- YouTube/Vimeo in the Reels dial (Films section keeps embeds)  
- Earth / film-reel centerpieces (removed earlier)

## Visual & spatial design

### Camera (match v5)

Translate CSS prototype values into R3F camera + group transform:

| Prototype (CSS) | Production (R3F) |
|-----------------|------------------|
| `perspective: 1000px` | PerspectiveCamera `fov` tuned to similar framing (~35–45°) |
| `perspective-origin: 50% 12%` | Camera positioned **above** look-at target (elevated eye) |
| World `top: 62%`, centered X | Ring group offset **down** in viewport (~62% from top) |
| World `rotateX(14deg)` | Ring parent group `rotation.x ≈ 0.24 rad` (14°) |
| Ring guide `rotateX(78deg)` | Optional subtle floor ring mesh, low opacity accent |

**Rejected:** v4-style `rotateX(48deg)` — reads as worm's-eye / from below.

### Phone frames

- **Orbiter:** ~90×160, rounded rect, thin border, cover `object-fit: cover`  
- **Focus:** ~148×264, accent border glow, play affordance (subtle center ring or Mux player chrome)  
- **Depth styling:** orbiters farther from camera → lower opacity, slight blur, smaller scale (see layout math below)  
- **Ring accent:** faint orange circle on floor plane (site `--accent` family)

### Section layout

```
┌─────────────────────────────────────────┐
│  REELS (heading, data-reveal)           │
│                                         │
│         ╭─── focus reel (larger) ───╮   │
│        ╱    orbiters on ring         ╲  │
│       │         ○ ○ ○ ○ ○            │  │
│        ╲_____________________________╱  │
│                                         │
│  optional: 03 / 10 · title caption      │
└─────────────────────────────────────────┘
```

Site atmosphere enter-light on Reels crossing still applies; stage sits above backdrop z-index.

## Interaction & physics

Port logic from `reels-dial-elevated-v5.html` into a dedicated hook (e.g. `useReelsOrbitPhysics`).

### Constants (defaults, tunable in config module)

| Constant | Value | Role |
|----------|-------|------|
| `N` | `reels.length` (~10) | Slot count |
| `RADIUS` | ~215 (world units) | Ring radius |
| `SLOT` | `360 / N` | Degrees per reel |
| `HOLD_MS` | 1600 | Idle hold on current reel |
| `STEP_MS` | 700 | Step rotation duration |
| `DAMP` | 0.94 | Velocity decay per frame |
| `DRAG_SENS` | 0.35 | `dAngle = dx * DRAG_SENS` |
| `VEL_CLAMP` | ±28 | Max release velocity |
| `SNAP_LERP` | 0.15 | Magnetic snap toward slot when slow |

### Front detection

Active index = reel with **maximum +Z** on ring (toward camera), not minimum:

```ts
function nearestFrontIndex(angle: number): number {
  let best = 0, bestZ = -Infinity
  for (let i = 0; i < N; i++) {
    const { z } = positionOnRing(angle + i * SLOT)
    if (z > bestZ) { bestZ = z; best = i }
  }
  return best
}
```

### Idle state machine

1. **`hold`** — wait `HOLD_MS` on current front reel (Mux playing)  
2. **`step`** — animate `angle` by `-SLOT` over `STEP_MS` with `easeInOutCubic`; on complete snap `angle = angleForFront(nextIndex)`  
3. **`coast`** — after drag release or during inertia: apply `vel`, decay with `DAMP`; when `|vel| < 0.35`, lerp to `angleForFront(nearest)` until settled → return to **`hold`**

Drag sets `phase = 'coast'` and clears autoplay step until snap completes.

### Layout per frame

For each reel `i` at ring angle `angle + i * SLOT`:

- Position: `x = sin(θ) * RADIUS`, `z = cos(θ) * RADIUS`  
- `depth = (z + RADIUS) / (2 * RADIUS)`  
- Focus: `scale = 1`, full opacity, `z += zBoost` (~42), slight lift  
- Orbiter: `scale = 0.48 + depth * 0.4`, `opacity = 0.25 + depth * 0.62`, optional blur by `(1 - depth)`  
- Subtle `rotateY` from sine of slot angle (~±18°) for parallax

### Pointer input

- `pointerdown` → capture, start drag  
- `pointermove` → update angle + velocity from `dx`  
- `pointerup` / `pointercancel` → clamp velocity, coast + snap  
- `touch-action: none` on stage; `cursor: grab/grabbing` on desktop  
- Stage must not block page scroll outside its hit area (section height bounded)

## Content model

### Type changes (`src/content/types.ts`)

Extend `Reel` for Mux-first vertical reels:

```ts
export type Reel = {
  id: string
  title: LocaleString
  cover: string          // required — orbiter texture + poster
  muxPlaybackId: string  // Mux stream for focus playback
}
```

Remove `EmbedProvider` + `url` from Reel (Films type unchanged).

### Content file (`src/content/reels.ts`)

- **~10 entries** with real or placeholder Mux playback IDs and cover paths under `public/`  
- Titles remain `LocaleString` for EN/AR  
- Placeholder IDs acceptable for scaffold; document env note if using Mux signed URLs later

### Mux playback

- Add **`@mux/mux-player-react`** (or lightweight HLS `<video>` if team prefers zero new dep — prefer mux-player for poster + stream lifecycle)  
- Mount player **only** on focus reel mesh (DOM overlay or `@react-three/drei` Html portal)  
- On focus change: pause previous, load/play new (muted default v1)  
- `poster={cover}` until stream ready

## Architecture

### New / modified files

| File | Responsibility |
|------|----------------|
| `src/sections/Reels/Reels.tsx` | Section shell: heading, stage mount, caption |
| `src/sections/Reels/Reels.module.css` | Stage height, heading spacing, reduced-motion layout |
| `src/sections/Reels/ReelsOrbitStage.tsx` | R3F Canvas, lights, camera, ring group |
| `src/sections/Reels/ReelsOrbitPhone.tsx` | Single phone mesh + cover material; focus flag |
| `src/sections/Reels/ReelsFocusPlayer.tsx` | Mux player for active reel only |
| `src/sections/Reels/useReelsOrbitPhysics.ts` | Angle, phase machine, pointer handlers |
| `src/sections/Reels/reelsOrbitConfig.ts` | Constants exported for tests |
| `src/content/types.ts` | Updated `Reel` type |
| `src/content/reels.ts` | ~10 Mux reels |
| `src/sections/Reels/Reels.test.tsx` | Section render, reduced-motion, focus index logic |

Follow existing patterns: `useWebglEnabled`, `prefersReducedMotion` from `src/lib/reducedMotion.ts`, co-located tests.

### R3F scene graph (conceptual)

```
Canvas (dpr clamp [1, 1.5])
└─ PerspectiveCamera (elevated)
└─ group (rotation.x ≈ 14°)
   └─ group (ringAngle from physics)
      ├─ ReelsOrbitPhone × N (cover planes)
      └─ ReelsFocusPlayer (Html @ focus slot only)
```

Optional: faint `Ring` mesh on XZ plane for accent circle.

### Performance rules

1. **One** video decoder active (focus only)  
2. Canvas `dpr` clamp `[1, 1.5]`  
3. **Pause** autoplay + Mux when section off-screen (IntersectionObserver or ScrollTrigger)  
4. Dispose textures on unmount  
5. No shadow maps / heavy postprocessing v1

### Reduced motion

When `prefers-reduced-motion: reduce` or WebGL disabled:

- Hide Canvas; show vertical list or simplified 2D carousel with covers  
- Tap/click selects reel; **no** inertia, **no** autoplay step  
- Mux plays only on explicit user selection

## Integration with existing systems

| System | Behavior |
|--------|----------|
| **SiteAtmosphere** | Unchanged; Reels enter-light still fires |
| **Hero WebGL** | Separate canvas; no merge |
| **Lenis scroll** | Stage pointer handlers isolated; section scrollable normally |
| **i18n** | `t(reel.title)` for caption |
| **Cursor lens** | Existing site cursor rules; stage uses grab cursor locally |

## Success criteria

Before marking done:

1. **Visual:** Matches v5 — elevated camera, larger front reel, ring reads as dial not flat strip  
2. **Idle:** Step hold → rotate → hold; never slow infinite crawl  
3. **Drag:** 1:1 follow; fast flick carries; releases snap to front slot  
4. **Focus:** Active reel always **front (+Z)**; Mux plays there only  
5. **Swap:** Autoplay step and manual drag both update Mux source correctly  
6. **Mobile:** Touch drag works; no scroll jank inside stage  
7. **Off-screen:** Autoplay + video pause when section not visible  
8. **Reduced motion:** Fallback usable without vestibular trigger  
9. **Tests:** `npm test` passes; new physics/config unit tests green  
10. **Build:** `npm run build` clean

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Mux IDs not ready | Placeholder IDs + covers; swap in content file only |
| Html overlay misalignment on focus phone | Anchor Html to focus world position each frame |
| Touch vs scroll fight | `touch-action: none` only on stage element |
| Performance on low-end mobile | dpr cap, single stream, pause off-screen |
| Arabic RTL | Heading/caption follow site i18n; ring layout stays symmetric |

## Approval record

- **2026-08-28:** Interactive prototype `reels-dial-elevated-v5.html` approved by user — *"great, very good, perfectly balanced, with no flaws whatsoever."*  
- Design spec written for implementation planning via `writing-plans` skill.
