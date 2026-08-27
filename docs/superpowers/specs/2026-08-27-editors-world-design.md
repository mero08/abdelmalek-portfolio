# Abdelmalek Portfolio — Editor’s World (Award-Grade Scroll Stage)

**Date:** 2026-08-27  
**Status:** Approved for implementation (user: Option B; award quality; first-review ready)  
**Related:**  
- `2026-08-27-soft-living-atmosphere-design.md` (soft fog retained as underlayer)  
- `2026-08-24-abdelmalek-minh-experience-design.md`  
**Primary references:** Codrops cinematic scroll + R3F (camera as director) · Kaitezidis VFX portfolio (one 3D stage) · film-strip / cylinder scroll demos · Minh fixed canvas discipline  

## Goal

Upgrade the site-wide background from “soft fog only” to an **award-density Editor’s World**: a compelling **3D film-reel / aperture stage** that **rotates and transforms with scroll**, and **changes character per section** (About → Reels → Films → Contact). Soft atmosphere remains as underlayer. First client review must feel international-portfolio ready — not a draft.

## Problem

Soft living atmosphere fixed “dead page,” but feedback: still a bit boring; they want **spectacle like a rotating Earth**, on-brand for a video editor (**Option B**), at **Awwwards-tier craft**.

## Locked decisions

| Topic | Decision |
|--------|----------|
| Centerpiece | **Editor’s World** — procedural film reel + aperture ring (no Earth; no stock “generic globe”) |
| Motion | **Scroll-scrubbed** rotation + camera dolly/orbit (GSAP ScrollTrigger + Lenis, same stack) |
| Section dependence | Distinct **camera / spin / light / frame spread** per About, Reels, Featured, Contact |
| Atmosphere | Keep soft fog/grain/enter light **under** the reel (prefer **one** WebGL canvas for both) |
| Hero | Hero cinema plate unchanged; Editor’s World fades in as Hero exits (`heroCover`) |
| Quality bar | First review = award-ready: smooth scroll, readable content, no flicker, mobile fallback |
| Stack | R3F + Three + GSAP already in repo; **no new npm deps** unless a proven gap (document first) |
| Sound | None |
| Assets | Procedural geometry + shader materials first (no heavy GLB dependency for v1) |

## Visual concept (what they see)

One fixed full-viewport stage behind DOM content:

1. **Soft cinematic void** (existing fog/grain language)  
2. **Hero object:** dark metallic **film reel hub** + **orbiting frame cards** (short film-strip segments) + thin **aperture / iris ring** with orange rim light  
3. Scroll turns the reel and eases the camera (director’s move, not a spinner toy)  
4. Pointer adds gentle parallax on the stage (lerped)  
5. Entering a section: short light swell (existing) + reel “gear change” (spin/angle/spread)

### Section beats (story)

| Section | Stage beat |
|---------|------------|
| **About** | Reel mid-frame, slow dignified turn; warm key; frames slightly closed |
| **Reels** | Closer camera; faster spin; frames open / more readable as a strip |
| **Featured (Films)** | Dramatic tilt; cooler key; frames fan; stronger rim |
| **Contact** | Pull back; spin settles; quieter light; iris more closed — invitation, not chaos |

## Architecture

| Unit | Responsibility |
|------|----------------|
| `SiteAtmosphere` (upgraded) | Single fixed R3F canvas: fog plane + EditorWorld group |
| `EditorWorld` | Reel hub, aperture, instanced/frame meshes, materials |
| `useAtmosphereDriver` (extended) | mouse, scrollVel, enter, heroCover, **section progress 0–1**, **section id** |
| Section progress | ScrollTrigger or measured offsets: continuous `uProgress` across Home content + discrete section for beats |
| Fallback | CSS gradient + static SVG/CSS reel silhouette when no WebGL / reduced motion |

### Performance (award sites do this)

- One WebGL context (merge fog + reel)  
- `dpr` cap `[1, 1.5]`; pause on `document.hidden`  
- Frame count tier: desktop ~12–16 cards; mobile ~6–8  
- No layout thrash; uniforms + transforms only  
- Content always `z-index` above; `pointer-events: none` on canvas  

### Readability (non-negotiable)

- Reel sits **off-center** (typically end side) so About DualText / film titles stay clear  
- Peak brightness never washes covers or type  
- Opacity / scale of frames reduced behind dense text zones if needed  

## Non-goals

- Literal Earth / NASA globe  
- Per-section full scene unload/reload  
- Sound  
- Redesigning About/Reels/Films/Contact layouts  
- Work page (`/work/:slug`) in v1 (inherit later)  

## Success criteria (first-review gate)

1. Client sees a **memorable 3D object** within 2 seconds of leaving Hero  
2. Scroll clearly **drives** reel + camera (not idle spin alone)  
3. Each major section has a **felt gear change**  
4. No jank vs Lenis; no blank flash; social + lens still work  
5. Mobile readable + lighter tier; reduced-motion safe  
6. Implementer has watched full scroll and would put it next to international portfolios without apology  

## Implementation notes

- Prefer procedural reel over downloading unverified GLBs  
- Drive camera with lerped targets from section keyframes (Codrops “camera as director”)  
- Keep `--atm-*` debug vars optional / strip before calling done if not needed for QA  
- Extend, don’t discard, soft atmosphere research already shipped  
