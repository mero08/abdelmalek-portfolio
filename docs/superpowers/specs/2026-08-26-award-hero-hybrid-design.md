# Abdelmalek Portfolio — Award-Grade Hybrid Hero

**Date:** 2026-08-26  
**Status:** Approved for implementation (user: build end-to-end; hybrid C)  
**Related:** `2026-08-25-minh-circular-lens-cursor-design.md` (lens mechanics unchanged)  
**Primary reference:** [minhpham.design](https://minhpham.design/) + hybrid type→cinema scroll

## Goal

Ship a **complete, award-density hero**: type-first manifesto with circular lens, then scroll-resolved cinematic world. Temporary media/copy OK. Downstream sections later; hero must feel finished alone.

## Locked decisions

| Topic | Decision |
|--------|----------|
| Mode | **Hybrid C** — type star → cinema resolves on scroll |
| Interaction | Keep existing masked orange lens on manifesto |
| Sound | None |
| Media | Temporary cinematic still (replaceable path) |
| Motion | GSAP ScrollTrigger pin/scrub + load entrance; WebGL mix |
| Reduced motion | No pin; static still + readable type; no lens (existing rules) |
| Scope now | **Hero only** (full end-to-end); rest of site later |

## Behavior

1. **Load** — label + manifesto lines stagger in; scroll cue fades in  
2. **Idle (top)** — dark WebGL atmosphere; huge type; lens works  
3. **Scroll pin (~140% viewport)** — cinematic plate fades/scales in; shader mixes noise→image; type grades slightly; cue fades out  
4. **Exit** — hand off to About without hard cut  

## Success criteria

1. First viewport brand-first (type dominant)  
2. Scroll makes cinema feel inevitable, not a pop-in card  
3. Lens remains stable (no cream disc / flicker)  
4. EN + AR both intentional; no H-overflow  
5. Mid-laptop smooth; reduced-motion safe  
