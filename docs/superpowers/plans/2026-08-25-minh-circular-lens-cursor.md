# Minh-Style Circular Lens Cursor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the hero/About cursor interaction so it matches minhpham.design: an orange circular CSS-mask reveal of alternate text, stable while moving on the text block, with a small idle orange follower off-block — never a cream disc covering cream letters.

**Architecture:** One `CursorLensProvider` engine updates CSS vars (`--cx`, `--cy`, `--lens-size`) via pointer + rAF/GSAP. Expand zones (`data-cursor-expand`) use a unified bounding rect (no per-glyph hit tests). Each expand zone owns a primary layer + a `pointer-events: none` orange reveal layer masked with an SVG circle. Idle `CircleCursor` is a small disc only when the lens is contracted.

**Tech Stack:** React 19, Vite, TypeScript, CSS modules, GSAP (existing), Vitest + Testing Library. No new npm dependencies. No sound.

## Global Constraints

- No sound control, no ambient audio
- No cream/beige opaque disc over type
- No new npm packages unless GSAP is proven insufficient (document why first)
- Bilingual EN + AR with RTL preserved
- `prefers-reduced-motion` and coarse pointer → no custom cursor; DualText opacity fallback
- Preserve current manifesto type scale / layout / corner chrome / WebGL backdrop
- Placeholder copy/images remain owner-editable
- Spec: `docs/superpowers/specs/2026-08-25-minh-circular-lens-cursor-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `public/cursor-circle-mask.svg` | Circular alpha mask for reveal layers |
| `src/components/CursorLens/cursorConfig.ts` | Idle/expand sizes, attr names |
| `src/components/CursorLens/CursorLensContext.tsx` | Engine: pointer → CSS vars + expand/contract; registers expand roots |
| `src/components/CursorLens/CircleCursor.tsx` + `.module.css` | Small idle orange follower only (hidden/scaled down when expanded) |
| `src/components/CursorLens/hitTest.ts` | **Delete** (replaced by simple region rects in engine) |
| `src/sections/Hero/ManifestoLens.tsx` + `Hero.module.css` | Primary + masked orange alt manifesto |
| `src/sections/Hero/PassiveCursorText.tsx` | **Delete** (label/scroll no longer special-case passive disc) |
| `src/sections/Hero/Hero.tsx` | Plain label + Scroll; ManifestoLens only for lens |
| `src/components/DualText/*` | Same mask pattern for About (and Contact if it uses DualText) |
| `src/App.tsx` | Keep provider + CircleCursor |
| `src/styles/global.css` | Keep `has-circle-cursor` + `overflow-x: hidden` |

---

### Task 1: Circle mask asset + cursor config constants

**Files:**
- Create: `public/cursor-circle-mask.svg`
- Modify: `src/components/CursorLens/cursorConfig.ts`

**Interfaces:**
- Produces: `IDLE_SIZE = 12`, `EXPAND_SIZE = 360`, `EXPAND_ATTR = 'data-cursor-expand'`, `mask URL path `/cursor-circle-mask.svg``

- [ ] **Step 1: Add SVG mask**

Create `public/cursor-circle-mask.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="50" fill="#fff"/>
</svg>
```

- [ ] **Step 2: Rewrite config**

Replace `src/components/CursorLens/cursorConfig.ts` with:

```ts
export const IDLE_SIZE = 12
/** Large lens diameter in CSS px (Minh hero ~350–360). */
export const EXPAND_SIZE = 360
export const CURSOR_EXPAND_ATTR = 'data-cursor-expand'
export const MASK_URL = '/cursor-circle-mask.svg'
```

Remove `CursorMode` `'passive'`, `LENS_ACTIVE_RADIUS` clip-path exports, and any cream-disc-related constants.

- [ ] **Step 3: Commit**

```bash
git add public/cursor-circle-mask.svg src/components/CursorLens/cursorConfig.ts
git commit -m "chore: add circle mask asset and lens cursor config"
```

---

### Task 2: Rewrite CursorLens engine (no React x/y state)

**Files:**
- Modify: `src/components/CursorLens/CursorLensContext.tsx`
- Delete: `src/components/CursorLens/hitTest.ts`
- Test: `src/components/CursorLens/CursorLensContext.test.tsx` (create)

**Interfaces:**
- Produces: `CursorLensProvider`, `useCursorEngine()` → `{ enabled: boolean; trackRef; discRef; rootRef }` where `rootRef` is attached to `document.documentElement` style updates OR engine writes vars on `html` and on each `[data-cursor-expand]` reveal child
- Produces: CSS vars on `html`: `--cx`, `--cy` (viewport px); on each expand root: `--lens-size` (px), and mask position derived from pointer relative to root
- Consumes: `prefersReducedMotion`, coarse pointer check, `IDLE_SIZE`, `EXPAND_SIZE`, `CURSOR_EXPAND_ATTR`

- [ ] **Step 1: Write failing test — enabled flag**

Create `src/components/CursorLens/CursorLensContext.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { CursorLensProvider, useCursorEngine } from './CursorLensContext'

function Probe() {
  const { enabled } = useCursorEngine()
  return <div data-testid="en">{enabled ? 'yes' : 'no'}</div>
}

describe('CursorLensProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? true : false,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
      onchange: null,
    }))
  })
  afterEach(() => vi.unstubAllGlobals())

  it('disables engine when prefers-reduced-motion', () => {
    render(
      <CursorLensProvider>
        <Probe />
      </CursorLensProvider>,
    )
    expect(screen.getByTestId('en')).toHaveTextContent('no')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL or pass once provider exports `useCursorEngine`**

Run: `npm test -- src/components/CursorLens/CursorLensContext.test.tsx`

- [ ] **Step 3: Implement engine**

Rewrite `CursorLensContext.tsx` with this behavior (exact structure):

```tsx
// Pseudocode engineers must implement fully:
// - enabled = !prefersReducedMotion() && !coarsePointer
// - toggle html class `has-circle-cursor` when enabled
// - posRef {x,y}; sizeRef current lens size; expandedRef boolean
// - on pointermove: store clientX/Y; schedule rAF
// - rAF flush:
//     1) set track transform translate3d(x,y) (idle disc)
//     2) query all [data-cursor-expand]; point-in-rect with 12px pad enter / 28px pad leave (hysteresis on the REGION only)
//     3) targetSize = inside ? EXPAND_SIZE : IDLE_SIZE
//     4) gsap.to(sizeProxy, { size: targetSize, duration: 0.35, ease: 'power3.out', onUpdate: applyMasks })
//        OR manual lerp of sizeRef toward targetSize each frame
//     5) for each expand root: set --cx/--cy relative to getBoundingClientRect; set --lens-size to current size if this root is active else 0 (or always set position, size 0 when inactive)
// - CircleCursor disc: data-expanded=true when size > IDLE_SIZE * 2 → opacity 0 (mask is the visible lens); else opacity 1
// - NO cream/passive mode; NO claim map; NO createPortal
```

Mask application CSS (document for Task 3/4) will use:

```css
mask-image: url('/cursor-circle-mask.svg');
mask-repeat: no-repeat;
mask-size: var(--lens-size, 0px);
mask-position: calc(var(--mx, 0px) - var(--lens-size, 0px) / 2)
  calc(var(--my, 0px) - var(--lens-size, 0px) / 2);
```

Engine sets `--mx` / `--my` as pointer coords relative to the expand root’s `getBoundingClientRect()`.

Delete `hitTest.ts` after engine no longer imports it.

- [ ] **Step 4: Tests pass + commit**

```bash
git add src/components/CursorLens/
git commit -m "feat: rewrite cursor engine for masked lens expand/contract"
```

---

### Task 3: CircleCursor idle-only visual

**Files:**
- Modify: `src/components/CursorLens/CircleCursor.tsx`
- Modify: `src/components/CursorLens/CircleCursor.module.css`

**Interfaces:**
- Consumes: `useCursorEngine().trackRef`, `discRef`, `enabled`
- Produces: fixed track + disc; `pointer-events: none !important`; no cream passive styles

- [ ] **Step 1: Implement idle disc**

`CircleCursor.tsx`:

```tsx
export function CircleCursor() {
  const { enabled, trackRef, discRef } = useCursorEngine()
  if (!enabled) return null
  return (
    <div ref={trackRef} className={styles.track} aria-hidden>
      <div ref={discRef} className={styles.disc} data-mode="idle" />
    </div>
  )
}
```

Engine sets `disc.dataset.mode = expanded ? 'lens' : 'idle'`.

CSS:

```css
.track, .disc { pointer-events: none !important; }
.track {
  position: fixed; top: 0; left: 0; z-index: 60;
  transform: translate3d(-9999px, -9999px, 0) translate(-50%, -50%);
  will-change: transform;
}
.disc {
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--accent);
  transition: opacity 0.2s var(--ease-out), transform 0.2s var(--ease-out);
}
.disc[data-mode='lens'] {
  /* Hide idle dot while orange mask is the visible lens — avoids double circle */
  opacity: 0;
  transform: scale(0.5);
}
```

Do **not** animate width/height to 360px on this element. Do **not** add `mix-blend-mode: difference` cream passive styles.

- [ ] **Step 2: Manual smoke later; commit**

```bash
git add src/components/CursorLens/CircleCursor.tsx src/components/CursorLens/CircleCursor.module.css
git commit -m "feat: idle-only circle cursor; hide when lens expanded"
```

---

### Task 4: ManifestoLens — primary + masked orange alt

**Files:**
- Modify: `src/sections/Hero/ManifestoLens.tsx`
- Modify: `src/sections/Hero/Hero.module.css`
- Modify: `src/sections/Hero/Hero.tsx`
- Delete: `src/sections/Hero/PassiveCursorText.tsx`

**Interfaces:**
- Consumes: `site.hero.lines`, `altLines`, accent indexes; `useCursorEngine().enabled`
- Produces: root with `data-cursor-expand` when enabled; primary lines; reveal layer with alt lines + orange bg + mask CSS vars

- [ ] **Step 1: Rewrite ManifestoLens markup**

```tsx
export function ManifestoLens({ lines, altLines, accentLineIndexes, altAccentLineIndexes }: Props) {
  const { t } = useLocale()
  const { enabled } = useCursorEngine() // or useCursorLens alias

  return (
    <h1
      className={styles.manifesto}
      data-testid="manifesto-lens"
      {...(enabled ? { 'data-cursor-expand': '' } : {})}
    >
      <span className={styles.manifestoLayer}>
        {lines.map((line, index) => (
          <span
            key={`p-${line.en}-${index}`}
            className={accentLineIndexes.includes(index) ? styles.accentLine : styles.line}
          >
            {t(line)}
          </span>
        ))}
      </span>
      {enabled && (
        <span className={styles.manifestoReveal} aria-hidden>
          {altLines.map((line, index) => (
            <span
              key={`a-${line.en}-${index}`}
              className={altAccentLineIndexes.includes(index) ? styles.revealAccent : styles.revealLine}
            >
              {t(line)}
            </span>
          ))}
        </span>
      )}
    </h1>
  )
}
```

- [ ] **Step 2: CSS for stacked layers + mask**

Keep current font-size `clamp(2.35rem, 5.6vw, 4.35rem)`, line-height `0.82`.

```css
.manifesto {
  position: relative;
  display: grid;
  justify-items: center;
  width: max-content;
  max-width: 100%;
  margin: 0 auto;
  /* type tokens unchanged */
  overflow: visible;
  --mx: 0px;
  --my: 0px;
  --lens-size: 0px;
}
.manifestoLayer,
.manifestoReveal {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: max-content;
}
.manifestoReveal {
  pointer-events: none !important;
  z-index: 2;
  background: var(--accent);
  color: var(--bar-ink);
  /* Expand paint box so circle is not clipped by text bounds */
  padding: 40vh 40vw;
  margin: -40vh -40vw;
  box-sizing: content-box;
  -webkit-mask-image: url('/cursor-circle-mask.svg');
  mask-image: url('/cursor-circle-mask.svg');
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: var(--lens-size);
  mask-size: var(--lens-size);
  -webkit-mask-position: calc(var(--mx) - var(--lens-size) / 2 + 40vw)
    calc(var(--my) - var(--lens-size) / 2 + 40vh);
  mask-position: calc(var(--mx) - var(--lens-size) / 2 + 40vw)
    calc(var(--my) - var(--lens-size) / 2 + 40vh);
}
.revealLine { color: var(--bar-ink); }
.revealAccent { color: var(--fg-bright); } /* or bar-ink — match Minh dark-on-orange; accent words can stay bright if desired */
```

Engine must set `--mx`/`--my` relative to the **manifesto element’s border box** (not including the negative margin paint box). Mask-position formula accounts for padding offset.

Alternative if padding math is fragile: keep reveal sized to text and use `mask` only (accept circle clipped to text box for glyphs) while idle disc is hidden when expanded — still no cream disc. Prefer padded approach for uncropped orange circle like Minh.

- [ ] **Step 3: Simplify Hero.tsx**

```tsx
<p className={styles.label}>{t(site.hero.label)}</p>
<ManifestoLens ... />
<div className={styles.scroll}>
  <span className={styles.scrollLine} aria-hidden />
  <span>{t({ en: 'Scroll', ar: 'مرر' })}</span>
</div>
```

Delete `PassiveCursorText.tsx` and all imports.

- [ ] **Step 4: Commit**

```bash
git add src/sections/Hero/ src/components/CursorLens/
git commit -m "feat: manifesto masked orange lens like Minh"
```

---

### Task 5: DualText — same mask pattern

**Files:**
- Modify: `src/components/DualText/DualText.tsx`
- Modify: `src/components/DualText/DualText.module.css`
- Modify: `src/components/DualText/DualText.test.tsx` (fallback still works without provider / reduced motion)

**Interfaces:**
- Consumes: `useCursorEngine().enabled`
- Produces: `data-cursor-expand` root; primary + masked alt; FallbackDualText when `!enabled`

- [ ] **Step 1: Keep fallback test green**

Existing test renders without provider → `enabled` false → FallbackDualText → hover sets `data-revealed`. Ensure that path remains.

- [ ] **Step 2: Implement masked DualText when enabled**

```tsx
<div data-testid="dual-text" data-cursor-expand="" className={[styles.root, className].filter(Boolean).join(' ')}>
  <span className={styles.primary}>{primary}</span>
  <span className={styles.reveal} aria-hidden>
    <span className={styles.alt}>{alt}</span>
  </span>
</div>
```

CSS: same mask vars as manifesto; `background: var(--accent)` on `.reveal`; `.alt { color: var(--bar-ink) }`; `pointer-events: none` on reveal; padding trick or equivalent so circle isn’t harshly cropped.

- [ ] **Step 3: Run DualText + CursorLens tests**

Run: `npm test -- src/components/DualText/DualText.test.tsx src/components/CursorLens/CursorLensContext.test.tsx`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/DualText/
git commit -m "feat: DualText uses shared masked orange lens"
```

---

### Task 6: Cleanup + global polish + full verify

**Files:**
- Modify: `src/styles/global.css` (confirm overflow-x + has-circle-cursor)
- Modify: `docs/superpowers/specs/2026-08-24-abdelmalek-minh-experience-design.md` only if cursor wording still contradicts (optional one-line pointer to new spec)
- Remove dead exports/imports (`PassiveCursorText`, old `hitTest`, portal code)

- [ ] **Step 1: Grep for dead symbols**

```bash
rg "PassiveCursorText|hitTest|data-cursor-zone|data-passive|mix-blend-mode: difference" src
```

Remove leftovers.

- [ ] **Step 2: Full test + build**

```bash
npm test -- --run
npm run build
```

Expected: all tests pass; `tsc` clean.

- [ ] **Step 3: Manual QA checklist**

1. `npm run dev` — hover manifesto: orange lens + alt dark text; no cream disc  
2. Sweep across letter gaps — no flicker  
3. Leave block — shrink to small orange dot  
4. About DualText — same lens  
5. Name / Scroll / nav — small cursor only  
6. No horizontal scrollbar  

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "fix: finish masked lens cursor cleanup and verify"
```

(Only stage intentional source/docs; do not commit `.superpowers/sdd` frame dumps unless desired.)

---

## Self-Review (plan vs spec)

| Spec requirement | Task |
|------------------|------|
| Masked orange reveal (Minh model) | 2–5 |
| Idle small cursor off-block | 3 |
| Unified region hit / no gap flicker | 2 |
| No cream passive disc | 2, 3, 6 |
| GSAP optional / no new deps | 2 |
| No sound | Global + Hero |
| DualText About | 5 |
| Reduced motion / touch fallback | 2, 5 |
| Preserve type scale / chrome | 4 |
| overflow-x / no layout break | 4, 6 |

No TBD placeholders. Types: `--mx`, `--my`, `--lens-size`, `data-cursor-expand`, `IDLE_SIZE` / `EXPAND_SIZE` consistent across tasks.
