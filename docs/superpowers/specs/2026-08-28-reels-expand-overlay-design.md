# Abdelmalek Portfolio — Reels Expand Overlay

**Date:** 2026-08-28  
**Status:** Approved (prototype sign-off)  
**Related:**  
- `2026-08-28-reels-orbit-dial-design.md` (orbital dial — do not change dial physics/layout)  
- Approved prototype: `.superpowers/brainstorm/7244-1787871686/content/reels-expand-focus-v1a-soft-blur.html`

## Goal

When the user taps/clicks the **front focus reel** on the orbital dial, expand it in place into a larger 9:16 player with **live Mux video**, iPhone-style overlay controls, and a **soft-blur** dimmed dial behind — matching the approved HTML prototype animations and interaction feel.

## Locked decisions

| Topic | Decision |
|--------|----------|
| Mode | **Focus expand** — blur/dim dial; clicked reel grows in place (not full-screen cinema black) |
| Trigger | **Front focus reel only** — orbiters remain drag-only |
| Backdrop | **Sample A soft blur** — `blur(10px) saturate(0.75)`, opacity ~0.45, scrim `rgba(8,8,8,0.35)` |
| Audio | **Sound on** when expanded; mute toggle available |
| Exit | **Close button only** (top-right ✕) — no backdrop click, no Escape in v1 |
| While open | **Freeze dial** — no autoplay step, no drag |
| Animation | **FLIP** — expand shell animates from focus phone `getBoundingClientRect()` to centered target (~78vh max height, 9:16); reverse on close (~480–500ms, same easing as prototype) |
| Player | **Mux** (`@mux/mux-player-react`) — same playback ID as focus reel; sync `currentTime` on open/close |
| Controls layout | **On-video overlay** (no bottom black bar) |
| Transport row | Bottom of video, single line: **play/pause icon left** + **thin scrub line right** (vertically centered, iPhone-style) |
| Play/pause | SVG icons — **⏸ while playing**, **▶ while paused** (accent when paused); must update `<path d>` not `<svg>` |
| Scrubber | Full-width thin track inside transport row; fill shows progress; turns accent while scrubbing; time label appears only while scrubbing |
| Mute | Top-left icon; toggles muted state |
| Close | Top-right icon; must use reliable pointer handling (`pointerdown` + `stopPropagation`) |
| Loop | **No loop** while expanded (user can see end); dial focus reel keeps loop when collapsed |
| Fallback | `prefers-reduced-motion` / fallback list: tap-to-play inline or skip expand chrome — no FLIP inertia |

## Non-goals (v1)

- Backdrop click or Escape to close  
- Expand from non-focus orbiters  
- Native Mux control bar visible  
- Picture-in-picture  
- Per-reel expand metadata panel  
- Changing orbital dial timing, camera, or ring layout  

## Visual spec (match v1a prototype)

### Collapsed dial (unchanged)

Existing `ReelsOrbitDial` + `useReelsOrbitPhysics` — no design changes.

### Expanded state

1. **Scrim** — fixed full-viewport, semi-transparent (see backdrop row above).  
2. **Dial layer** — blurred/dimmed; `pointer-events: none`; optional slight scale-down (~0.96) optional for B only — **production uses A values**.  
3. **Expand shell** — fixed position, accent border + shadow; contains video + overlay only (pure 9:16, no extra chrome height).  
4. **Focus phone** — hidden (`opacity: 0`) while expanded to avoid double image.  
5. **Bottom gradient** — subtle `linear-gradient(transparent, rgba(0,0,0,0.38))` on video wrap for scrub legibility only.

### Target expand rect

```text
videoH = min(innerHeight * 0.78, 720)
width  = videoH * 9 / 16
height = videoH
centered horizontally, slightly below vertical center (+20px offset as prototype)
```

### Easing

```text
cubic-bezier(0.22, 1, 0.36, 1) — 500ms for left/top/width/height
opacity 250ms on shell
dial blur/opacity 450ms
```

## Architecture (React)

| Unit | Responsibility |
|------|----------------|
| `ReelsOrbitDial.tsx` | Owns expand open/close state; passes `expanded` to physics (`paused: !visible \|\| expanded`); renders overlay |
| `ReelsExpandOverlay.tsx` **(new)** | FLIP shell, Mux player, overlay controls, sync time/progress |
| `ReelsExpandControls.tsx` **(new, optional)** | Transport icons + scrubber (if overlay file grows) |
| `useReelsOrbitPhysics.ts` | Accept `frozen` or extend `paused` to stop step + drag while expanded |
| `Reels.module.css` | Expand/scrim/transport styles (port from prototype) |
| `ReelsFocusPlayer.tsx` | Unchanged for dial focus; expand uses separate player instance |

### State flow

```text
click focus phone (isCenter, !expanded)
  → measure phone rect
  → set expanded=true, freeze physics
  → copy currentTime to expand player, unmute, play
  → FLIP to target rect

close
  → FLIP back to phone rect
  → pause expand player, mute
  → sync currentTime back to focus player
  → after 480ms: expanded=false, resume physics hold timer
```

### Pointer rules

- Expand shell controls: `pointer-events: auto` on overlay children; mux-player `pointer-events: none` (custom controls only).  
- Stage drag handlers: no-op while `expanded`.  
- Focus phone click: distinguish tap vs drag (movement < 12px, duration < 350ms) — same thresholds as prototype.

## Testing

| Case | Expect |
|------|--------|
| Click center reel | Expand animates; video plays with sound |
| Click orbiters | No expand; drag still works |
| Play/pause | Icon toggles ⏸ ↔ ▶ |
| Scrub | Line moves; time shows while dragging |
| Mute | Icon changes; audio toggles |
| Close | Returns to dial; focus reel resumes muted loop |
| While expanded | Dial does not step or drag |
| `prefers-reduced-motion` | Fallback path unchanged |

## Prototype parity checklist

- [ ] Soft blur backdrop (A)  
- [ ] FLIP from/to focus phone  
- [ ] Transport row: play + scrub same baseline  
- [ ] No black control bar  
- [ ] Close works reliably  
- [ ] Play icon path swap  
- [ ] Scrub time on drag only  
- [ ] Dial frozen while open  

## Reference files

- **Canonical prototype:** `reels-expand-focus-v1a-soft-blur.html`  
- **Heavy blur variant (not chosen):** `reels-expand-focus-v1b-heavy-blur.html`  
- **Existing dial:** `src/sections/Reels/ReelsOrbitDial.tsx`
