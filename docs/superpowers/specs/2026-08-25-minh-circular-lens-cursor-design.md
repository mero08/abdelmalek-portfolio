# Abdelmalek Portfolio — Minh-Style Circular Lens Cursor

**Date:** 2026-08-25  
**Status:** Approved for implementation planning  
**Related:** `2026-08-24-abdelmalek-minh-experience-design.md` (experience shell; this doc supersedes cursor/dual-text mechanics only)  
**Primary reference:** [minhpham.design](https://minhpham.design/) hero + user recording `ش7ش.mp4` / `Screen Recording 2026-08-25 154317.mp4`

## Goal

Rebuild the custom cursor / dual-text interaction so it **matches minhpham.design quality and behavior**: a stable orange circular lens that reveals alternate copy inside the mask, never obscures cream/white type with a solid light disc, and does not flicker while the pointer moves across the manifesto.

Content (final images, final copy) remains the owner’s responsibility; placeholders are fine.

## Problem (current implementation)

The live Abdo build uses a **solid fixed disc on top of text**, plus mode switching (lens vs cream “passive”). That diverges from Minh and causes:

- Cream/beige disc painting over light letters (especially after activation)
- Open/close flicker when hit-testing letter gaps or stacked zones
- Competing React/DOM updates fighting smooth motion

## Research summary (Minh)

Live inspection + recording frames established:

- Two content layers: primary (`layer__dark`) and alternate (`layer__red` / masker)
- Alternate layer: full orange fill `rgb(235, 89, 57)`, **`pointer-events: none`**
- “Cursor circle” = **CSS `mask-image` (SVG circle)** on the orange layer, driven by `--x`, `--y`, `--size`
- Hero text zone uses **extend** (large mask ~350px); leaving text **contracts** to a small idle cursor
- No separate opaque cream disc covering primary type
- System cursor hidden; canvas `pointer-events: none`
- **Sound is out of scope** for Abdelmalek (Minh’s SOUND control is not cloned)

## Locked decisions

| Topic | Decision |
|--------|----------|
| Approach | **A — Minh-style masked orange reveal layer** |
| Libraries | **GSAP** (already in repo) for smooth `--size` / optional lerp; **no new npm deps** required |
| Sound | **None** — no audio, no sound UI |
| Hero content | Placeholders OK; owner edits images/text later |
| Passive cream disc | **Removed** — never use a light opaque disc over type |

## Architecture

1. **Primary layer** — manifesto (and DualText primary): hit target for the text region  
2. **Reveal layer** — absolute overlay: accent fill + alt copy; `pointer-events: none`  
3. **Circular mask** on the reveal layer via CSS vars `--x`, `--y`, `--size` (SVG circle mask preferred, same idea as Minh’s `mask-image`)  
4. **Idle cursor** — small orange follower when pointer is **outside** expand zones; when inside, the masked reveal *is* the lens (no second stacking disc that covers glyphs)  
5. **Engine** — single module: `pointermove` → rAF and/or GSAP updates to CSS vars; hit test against **one unified manifesto/DualText region box** (not per-glyph)

Remove or gut the prior disc-on-top + claim/hysteresis path that paints cream over text.

## Behavior

| State | Visual |
|--------|--------|
| Off expand region | Small orange cursor follows pointer |
| Enter manifesto / DualText region | `--size` eases up to large lens; alt text (dark on accent) visible inside mask; primary visible outside |
| Move within region | Mask tracks pointer; stays fully open (no gap flicker) |
| Leave region | `--size` eases back to idle |
| Name, Scroll, nav, socials | No dual-text lens; idle small cursor only |
| Touch / `prefers-reduced-motion` | No custom cursor; DualText opacity/static fallback |

## Scope

**In**

- Rewrite Hero manifesto lens + About DualText to masked-layer model  
- Shared cursor/mask engine (performance: no per-move React position state)  
- Delete cream passive-disc behavior and obsolete portal/disc stacking that obscures type  
- Preserve current type scale, layout, corner chrome, WebGL backdrop  
- `overflow-x: hidden` / no layout break from the lens  

**Out**

- Sound / ambient audio  
- Cloning Minh’s full Three.js scroll world / globe  
- Final production media and final copy  
- Redesigning Films / Reels / Contact beyond existing shell  
- New libraries unless GSAP proves insufficient (document why before adding)

## Success criteria

Compared to the user’s Minh recording:

1. Orange circular lens, dark alternate type inside, cream/accent primary outside  
2. Lens stays open while moving across the text block; shrinks only after leaving  
3. No cream/white solid disc covering cream letters  
4. Smooth motion (~60fps feel); no horizontal scroll / layout glitches  
5. Owner can still replace images and text without reworking the interaction

## Testing / QA

- Desktop fine pointer: enter / sweep / leave manifesto; About DualText  
- Rapid mouse across letter gaps — no flicker  
- Reduced motion + coarse pointer paths  
- EN + AR layout smoke  
- Visual check against Minh recording frames under `.superpowers/sdd/bug-rec-frames/`

## Handoff note

After implementation, hero interaction should be “done” for quality; remaining owner work is **content** (images, copy), not cursor architecture.
