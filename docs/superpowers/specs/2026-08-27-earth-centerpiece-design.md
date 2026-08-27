# Abdelmalek Portfolio — Earth Centerpiece (Editor's World v2)

**Date:** 2026-08-27
**Status:** Approved for implementation planning
**Supersedes (centerpiece only):** `2026-08-27-editors-world-design.md` — the film-reel object is replaced; all scroll choreography from that spec is retained
**Related:** `2026-08-27-soft-living-atmosphere-design.md` (fog/grain underlayer unchanged)

## Goal

Replace the procedural film-reel centerpiece with a **recognizable Earth** sourced from public-domain NASA imagery, framed by a thin orange **aperture ring**. The object must be instantly readable — a viewer should never have to ask what they are looking at.

## Problem

The film reel was hand-built from primitives: a thin dark torus with small instanced boxes orbiting it, lit dimly at the edge of frame. At that scale and contrast it reads as an abstract ring, not a reel. Client feedback: the shape is unclear and not understood.

A sourced, universally known object removes that risk entirely — a satellite-textured sphere cannot be misread.

## Locked decisions

| Topic | Decision |
|--------|----------|
| Centerpiece | **Earth** — sphere with NASA Blue Marble day texture |
| Framing | **Thin orange aperture ring** around the planet (only surviving element of the reel) |
| Night side | **NASA city-lights texture** faintly emissive, so the terminator edge glows warm |
| Grading | Planet dimmed and warmed slightly to match dark/taupe/orange palette and Hero cinema plate |
| Choreography | **Unchanged** — scroll spin, per-section camera beats, enter light swell, pointer parallax, moods |
| Placement | Off-center (end side) so DualText, reel covers, and film titles stay clear |
| Assets | Two textures in `public/images/earth/`, 2048×1024, public domain |
| Dependencies | **No new npm packages** |
| Fallback | Texture load failure or no WebGL → existing CSS fallback, never a broken canvas |
| Removed | Reel hub, spokes, instanced frame boxes, frame torus ring |

## Asset sourcing

Both textures are **NASA public domain** (no attribution obligation, commercial use permitted). Implementer must verify the license notice on the download page at fetch time and record the source URL in a `public/images/earth/SOURCE.md` note.

| File | Content | Candidate source |
|------|---------|------------------|
| `earth-day.jpg` | Blue Marble land/ocean/topography, equirectangular | NASA SVS Blue Marble (`bluemarble-2048.png`) or Wikimedia Commons `Land_shallow_topo_2048.jpg` |
| `earth-night.jpg` | City lights (Black Marble / Earth at Night) | NASA Visible Earth "Earth's City Lights" |

Both resized to **2048×1024** and saved as JPG (quality ~82) to keep each file in the low hundreds of KB. If the night texture proves hard to source cleanly, ship day-only and synthesize the warm terminator glow in the shader — the planet must still read correctly.

## Visual behavior

### Continuous

1. Sphere with day texture, continents clearly visible
2. Slow rotation on its own, accelerated by scroll velocity and the section enter pulse
3. Night side dark with faint warm city-light glow; soft orange atmosphere rim on the lit limb
4. Thin orange aperture ring, slightly larger than the planet, breathing with the enter pulse
5. Existing fog, grain, and cursor glow continue behind it

### Per-section beats (carried over verbatim)

| Section | Beat |
|---------|------|
| About | Planet mid-frame, slow dignified turn, warm key |
| Reels | Camera closer, rotation faster, ring brighter |
| Featured | Dramatic tilt, cooler key, strongest rim |
| Contact | Pull back, rotation settles, quieter light |

These are the existing `STAGE_BEATS` values. `frameSpread` no longer drives frame instances; it is repurposed to drive **aperture ring scale**, and `spin` drives planet rotation. No beat values are invented — existing ones are reinterpreted.

## Architecture

| Unit | Change |
|------|--------|
| `EditorWorld.tsx` | Rewritten: sphere + textures + atmosphere rim + aperture ring. Reel geometry deleted. |
| `atmosphereConfig.ts` | `frameCountForViewport` removed or repurposed to sphere segment tier (desktop 64×32, mobile 32×16) |
| `useAtmosphereDriver.ts` | Unchanged |
| `SiteAtmosphere.tsx` | Unchanged except lighting tuned for a lit sphere |
| `public/images/earth/` | New: day + night textures, `SOURCE.md` |

Texture loading uses R3F's loader inside the existing `Suspense` boundary so the CSS fallback covers the load window.

## Performance

- Sphere segments tiered by viewport width (fewer on mobile)
- Textures 2048×1024 max; `dpr` cap `[1, 1.5]` retained
- `frameloop: 'never'` when tab hidden, retained
- No per-frame allocations; rotation and scale via lerped uniforms/transforms

## Readability (non-negotiable)

- Planet stays off-center; peak enter light must not wash DualText, film titles, or reel covers
- Canvas remains `pointer-events: none`; cursor lens and social magnets unaffected
- Planet dimmed enough that taupe body copy retains contrast

## Non-goals

- Orbit controls, drag-to-spin, or clickable globe markers
- Clouds layer, specular ocean map, or bump/normal maps in v1
- Star field backdrop (existing fog already provides depth)
- Any change to About, Reels, Featured, or Contact layout or copy
- Work page (`/work/:slug`) centerpiece — Home first
- Sound

## Testing & verification

### Automated

- `atmosphereConfig` tests updated for the sphere tier and retained beat assertions
- `SiteAtmosphere` fallback test still passes
- Full suite green

### Live browser QA (implementer performs personally)

1. Scroll Hero → About → Reels → Films → Contact: planet visible and **recognizable as Earth** in every section
2. Rotation clearly responds to scroll; each section shows its gear change
3. No flicker, tear, blank flash, or seam leaving Hero
4. Textures load; no missing-texture black or white sphere at any point
5. Text and covers remain readable at peak enter light
6. Cursor lens + corner social magnets still work
7. Mobile width (~390px): planet framed sensibly, lighter segment tier, no overflow
8. Tab hide/show resumes cleanly; reduced motion / no WebGL shows CSS fallback

**Done means:** implementer has watched the full scroll and would show it to the client without apology. Any failed item is not done.

## Success criteria

1. A first-time viewer identifies the object as Earth without being told
2. Scroll visibly drives rotation and camera, not idle spin alone
3. Each major section has a felt change
4. Palette reads as one world with Hero — planet does not look like a pasted photo
5. Smooth on a mid-range laptop; mobile and reduced-motion safe
6. Textures documented with their public-domain source
