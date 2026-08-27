# Soft Living Film Atmosphere Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one fixed soft cinematic WebGL atmosphere behind Home (About → Contact) with cursor/scroll life and a bright light swell on every section enter, verified live while scrolling.

**Architecture:** Mount `SiteAtmosphere` once on Home: a fixed fullscreen R3F quad reads uniforms from `useAtmosphereDriver` (lerped mouse, scroll velocity, section mood, enter pulse, hero cover fade). No WebGL / reduced motion → CSS fallback. Hero’s own cinema canvas stays; atmosphere fades under Hero so there is no double-grain seam.

**Tech Stack:** React 19, Vite, TypeScript, `@react-three/fiber`, `three`, GSAP ScrollTrigger, Lenis (existing), Vitest + Testing Library. No new npm packages.

## Global Constraints

- Intensity **1 — soft & cinematic**; motion felt more than seen
- Section enter = **light swell → settle** (~0.4–0.8s), not permanently bright
- Background system only — do not redesign About / Reels / Featured / Contact layouts
- No new npm deps; no sound; no particles / Spline / heavy meshes
- Reuse `useWebglEnabled` + `prefersReducedMotion`
- `pointer-events: none` on atmosphere; never block lens cursor or social magnets
- Peak enter light must not wash out text/covers
- Spec: `docs/superpowers/specs/2026-08-27-soft-living-atmosphere-design.md`
- **Done only after live browser scroll QA checklist passes**

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/components/webgl/atmosphereConfig.ts` | Section ids, mood values, lerp/enter timings |
| `src/components/webgl/useAtmosphereDriver.ts` | Pointer / scroll / section → mutable uniform state |
| `src/components/webgl/SiteAtmosphere.tsx` | Fixed canvas + shader plane + CSS fallback |
| `src/components/webgl/SiteAtmosphere.module.css` | Fixed layer, z-index, fallback gradient |
| `src/components/webgl/SiteAtmosphere.test.tsx` | Mount fallback / testid smoke |
| `src/pages/Home.tsx` | Mount `<SiteAtmosphere />` once above sections |
| `src/styles/global.css` | Ensure `#root` / main content stacking does not hide canvas incorrectly |

---

### Task 1: Atmosphere config + driver (uniforms state)

**Files:**
- Create: `src/components/webgl/atmosphereConfig.ts`
- Create: `src/components/webgl/useAtmosphereDriver.ts`
- Create: `src/components/webgl/atmosphereConfig.test.ts`

**Interfaces:**
- Produces: `ATMOSPHERE_SECTIONS`, `AtmosphereState`, `useAtmosphereDriver()` → `RefObject<AtmosphereState>`
- Consumes: GSAP ScrollTrigger, `prefersReducedMotion` (driver no-ops mutations when reduced motion if needed — canvas won’t mount anyway)

- [ ] **Step 1: Write failing config test**

Create `src/components/webgl/atmosphereConfig.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { ATMOSPHERE_SECTIONS, moodForSectionId } from './atmosphereConfig'

describe('atmosphereConfig', () => {
  it('maps home content sections to moods', () => {
    expect(ATMOSPHERE_SECTIONS.map((s) => s.id)).toEqual([
      'about',
      'reels',
      'featured',
      'contact',
    ])
    expect(moodForSectionId('about')).toBeGreaterThan(moodForSectionId('contact'))
    expect(moodForSectionId('featured')).toBeGreaterThan(moodForSectionId('about') - 0.01)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- --run src/components/webgl/atmosphereConfig.test.ts`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement config**

Create `src/components/webgl/atmosphereConfig.ts`:

```ts
export type AtmosphereSectionId = 'about' | 'reels' | 'featured' | 'contact'

export type AtmosphereSection = {
  id: AtmosphereSectionId
  /** Resting warmth 0–1 (higher = warmer / more present). */
  mood: number
}

/** Soft cinematic — enter swell duration seconds. */
export const ENTER_DURATION = 0.65

/** Mouse lerp factor per frame (~60fps). */
export const MOUSE_LERP = 0.06

/** Scroll velocity decay per frame. */
export const SCROLL_VEL_DECAY = 0.92

/** Max scroll-velocity contribution before clamp. */
export const SCROLL_VEL_MAX = 1.2

export const ATMOSPHERE_SECTIONS: AtmosphereSection[] = [
  { id: 'about', mood: 0.55 },
  { id: 'reels', mood: 0.35 },
  { id: 'featured', mood: 0.4 },
  { id: 'contact', mood: 0.22 },
]

export function moodForSectionId(id: string): number {
  return ATMOSPHERE_SECTIONS.find((s) => s.id === id)?.mood ?? 0.35
}
```

- [ ] **Step 4: Implement driver**

Create `src/components/webgl/useAtmosphereDriver.ts`:

```ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, type RefObject } from 'react'
import {
  ATMOSPHERE_SECTIONS,
  ENTER_DURATION,
  MOUSE_LERP,
  SCROLL_VEL_DECAY,
  SCROLL_VEL_MAX,
  moodForSectionId,
} from './atmosphereConfig'

gsap.registerPlugin(ScrollTrigger)

export type AtmosphereState = {
  /** Normalized 0–1 pointer. */
  mouseX: number
  mouseY: number
  targetMouseX: number
  targetMouseY: number
  /** 0–SCROLL_VEL_MAX smoothed. */
  scrollVel: number
  /** Resting mood 0–1. */
  mood: number
  /** Enter pulse 0–1. */
  enter: number
  /** 1 = Hero covering viewport (fade atmosphere); 0 = fully below Hero. */
  heroCover: number
}

function createState(): AtmosphereState {
  return {
    mouseX: 0.5,
    mouseY: 0.5,
    targetMouseX: 0.5,
    targetMouseY: 0.5,
    scrollVel: 0,
    mood: moodForSectionId('about'),
    enter: 0,
    heroCover: 1,
  }
}

export function useAtmosphereDriver(): RefObject<AtmosphereState> {
  const stateRef = useRef<AtmosphereState>(createState())

  useEffect(() => {
    const state = stateRef.current
    let lastScrollY = window.scrollY
    let raf = 0
    let enterTween: gsap.core.Tween | null = null
    let activeId: string | null = null

    const tick = () => {
      raf = 0
      state.mouseX += (state.targetMouseX - state.mouseX) * MOUSE_LERP
      state.mouseY += (state.targetMouseY - state.mouseY) * MOUSE_LERP
      state.scrollVel *= SCROLL_VEL_DECAY
      if (state.scrollVel < 0.001) state.scrollVel = 0
    }

    const schedule = () => {
      if (raf) return
      raf = requestAnimationFrame(tick)
    }

    const onPointer = (e: PointerEvent) => {
      state.targetMouseX = e.clientX / Math.max(1, window.innerWidth)
      state.targetMouseY = e.clientY / Math.max(1, window.innerHeight)
      schedule()
    }

    const onScroll = () => {
      const y = window.scrollY
      const dy = Math.abs(y - lastScrollY)
      lastScrollY = y
      state.scrollVel = Math.min(
        SCROLL_VEL_MAX,
        state.scrollVel + dy / Math.max(1, window.innerHeight),
      )
      schedule()
    }

    const pulseEnter = (id: string) => {
      if (id === activeId) return
      activeId = id
      state.mood = moodForSectionId(id)
      enterTween?.kill()
      state.enter = 0
      enterTween = gsap
        .timeline()
        .to(state, { enter: 1, duration: ENTER_DURATION * 0.4, ease: 'power2.out' })
        .to(state, { enter: 0, duration: ENTER_DURATION * 0.6, ease: 'power2.inOut' })
    }

    const triggers: ScrollTrigger[] = []

    for (const section of ATMOSPHERE_SECTIONS) {
      const el = document.getElementById(section.id)
      if (!el) continue
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 65%',
          end: 'bottom 35%',
          onEnter: () => pulseEnter(section.id),
          onEnterBack: () => pulseEnter(section.id),
        }),
      )
    }

    const hero = document.getElementById('hero')
    if (hero) {
      triggers.push(
        ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => {
            // progress 0 at top → heroCover 1; as hero leaves, cover → 0
            state.heroCover = 1 - self.progress
          },
        }),
      )
    }

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    const loop = () => {
      tick()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll, true)
      cancelAnimationFrame(raf)
      enterTween?.kill()
      for (const t of triggers) t.kill()
    }
  }, [])

  return stateRef
}
```

Note: remove the dead yoyo block when implementing — keep only the timeline version of `pulseEnter`.

- [ ] **Step 5: Run config test — expect PASS**

Run: `npm test -- --run src/components/webgl/atmosphereConfig.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/webgl/atmosphereConfig.ts src/components/webgl/atmosphereConfig.test.ts src/components/webgl/useAtmosphereDriver.ts
git commit -m "feat: add atmosphere driver and section mood config"
```

---

### Task 2: SiteAtmosphere shader canvas + CSS fallback

**Files:**
- Create: `src/components/webgl/SiteAtmosphere.module.css`
- Create: `src/components/webgl/SiteAtmosphere.tsx`
- Create: `src/components/webgl/SiteAtmosphere.test.tsx`
- Modify: `src/test/setup.ts` only if WebGL/Canvas mocks are required (prefer not — test fallback path)

**Interfaces:**
- Consumes: `useAtmosphereDriver`, `useWebglEnabled`, `AtmosphereState`
- Produces: `<SiteAtmosphere />` with `data-testid="site-atmosphere"` and `data-mode="webgl" | "fallback"`

- [ ] **Step 1: Write failing mount test**

Create `src/components/webgl/SiteAtmosphere.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SiteAtmosphere } from './SiteAtmosphere'

vi.mock('./useWebglEnabled', () => ({
  useWebglEnabled: () => false,
}))

describe('SiteAtmosphere', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders CSS fallback when WebGL is disabled', () => {
    render(<SiteAtmosphere />)
    const root = screen.getByTestId('site-atmosphere')
    expect(root).toHaveAttribute('data-mode', 'fallback')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- --run src/components/webgl/SiteAtmosphere.test.tsx`  
Expected: FAIL (module not found)

- [ ] **Step 3: Add CSS module**

Create `src/components/webgl/SiteAtmosphere.module.css`:

```css
.root {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none !important;
  overflow: hidden;
}

.canvas,
.fallback {
  width: 100%;
  height: 100%;
}

.fallback {
  background:
    radial-gradient(120% 80% at 70% 20%, rgba(255, 77, 46, 0.07), transparent 55%),
    radial-gradient(90% 70% at 20% 80%, rgba(183, 171, 152, 0.05), transparent 50%),
    #0d0d0d;
}
```

- [ ] **Step 4: Implement SiteAtmosphere**

Create `src/components/webgl/SiteAtmosphere.tsx`:

```tsx
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { type ShaderMaterial } from 'three'
import { useWebglEnabled } from './useWebglEnabled'
import styles from './SiteAtmosphere.module.css'
import {
  useAtmosphereDriver,
  type AtmosphereState,
} from './useAtmosphereDriver'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScrollVel;
  uniform float uMood;
  uniform float uEnter;
  uniform float uHeroCover;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec2 uv = vUv;
    float n = noise(uv * 2.4 + uTime * 0.03);
    float n2 = noise(uv * 4.5 - uTime * 0.02 + 8.0);
    float fog = (n + n2) * 0.5;

    vec3 dark = vec3(0.051, 0.051, 0.051);
    vec3 lift = vec3(0.09, 0.085, 0.08);
    vec3 warm = vec3(1.0, 0.32, 0.18);

    float moodLift = 0.04 + uMood * 0.06;
    vec3 color = mix(dark, lift, fog * (0.35 + moodLift));

    float dist = distance(uv, uMouse);
    float glow = smoothstep(0.55, 0.0, dist) * (0.045 + uMood * 0.02);
    color += warm * glow;

    float breath = uScrollVel * 0.04;
    color += lift * breath;

    float enter = uEnter * uEnter;
    color += warm * enter * 0.14;
    color += vec3(0.08, 0.07, 0.06) * enter * 0.2;

    float grain = (hash(uv * vec2(1400.0, 900.0) + uTime) - 0.5) * 0.035;
    color += grain;

    float vig = 1.0 - length(uv - 0.5) * 0.55;
    color *= vig;

    // Fade under Hero so cinema plate owns the stage
    float visible = 1.0 - smoothstep(0.15, 0.85, uHeroCover);
    color = mix(dark, color, visible);

    gl_FragColor = vec4(color, 1.0);
  }
`

function AtmospherePlane({ stateRef }: { stateRef: RefObject<AtmosphereState> }) {
  const materialRef = useRef<ShaderMaterial>(null)
  const { viewport } = useThree()

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: [0.5, 0.5] as [number, number] },
      uScrollVel: { value: 0 },
      uMood: { value: 0.4 },
      uEnter: { value: 0 },
      uHeroCover: { value: 1 },
    }),
    [],
  )

  useFrame((state) => {
    const mat = materialRef.current
    const s = stateRef.current
    if (!mat || !s) return
    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uMouse.value = [s.mouseX, 1 - s.mouseY]
    mat.uniforms.uScrollVel.value = s.scrollVel
    mat.uniforms.uMood.value = s.mood
    mat.uniforms.uEnter.value = s.enter
    mat.uniforms.uHeroCover.value = s.heroCover
  })

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  )
}

function AtmosphereCanvas({ stateRef }: { stateRef: RefObject<AtmosphereState> }) {
  const [hidden, setHidden] = useState(
    typeof document !== 'undefined' ? document.hidden : false,
  )

  useEffect(() => {
    const onVis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  return (
    <Canvas
      className={styles.canvas}
      orthographic
      camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
      dpr={[1, 1.5]}
      frameloop={hidden ? 'never' : 'always'}
      gl={{
        alpha: false,
        antialias: false,
        powerPreference: 'high-performance',
      }}
      style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
    >
      <AtmospherePlane stateRef={stateRef} />
    </Canvas>
  )
}

export function SiteAtmosphere() {
  const webgl = useWebglEnabled()
  const stateRef = useAtmosphereDriver()

  if (!webgl) {
    return (
      <div
        className={styles.root}
        data-testid="site-atmosphere"
        data-mode="fallback"
        aria-hidden
      >
        <div className={styles.fallback} />
      </div>
    )
  }

  return (
    <div
      className={styles.root}
      data-testid="site-atmosphere"
      data-mode="webgl"
      aria-hidden
    >
      <Suspense fallback={<div className={styles.fallback} />}>
        <AtmosphereCanvas stateRef={stateRef} />
      </Suspense>
    </div>
  )
}
```

Tune enter peak (`0.14`) down if live QA shows washed text — soft cinematic lock.

- [ ] **Step 5: Run SiteAtmosphere test — expect PASS**

Run: `npm test -- --run src/components/webgl/SiteAtmosphere.test.tsx`  
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/webgl/SiteAtmosphere.tsx src/components/webgl/SiteAtmosphere.module.css src/components/webgl/SiteAtmosphere.test.tsx
git commit -m "feat: add soft living SiteAtmosphere canvas and fallback"
```

---

### Task 3: Mount on Home + stacking so content sits above atmosphere

**Files:**
- Modify: `src/pages/Home.tsx`
- Modify: `src/styles/global.css` (stacking only if needed)
- Modify section CSS only if a section paints opaque full-bleed `background` that kills the effect — prefer transparency; do **not** redesign layouts

**Interfaces:**
- Consumes: `SiteAtmosphere`
- Produces: Home renders atmosphere once; sections remain interactive above `z-index: 0`

- [ ] **Step 1: Update Home**

Replace `src/pages/Home.tsx` with:

```tsx
import { SiteAtmosphere } from '../components/webgl/SiteAtmosphere'
import { About } from '../sections/About/About'
import { Contact } from '../sections/Contact/Contact'
import { Featured } from '../sections/Featured/Featured'
import { Hero } from '../sections/Hero/Hero'
import { Reels } from '../sections/Reels/Reels'
import { useLenis } from '../hooks/useLenis'
import { useSectionReveal } from '../hooks/useSectionReveal'

export function Home() {
  useLenis()
  const revealRef = useSectionReveal()

  return (
    <>
      <SiteAtmosphere />
      <div ref={revealRef} style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <About />
        <Reels />
        <Featured />
        <Contact />
      </div>
    </>
  )
}
```

- [ ] **Step 2: Ensure global stacking**

In `src/styles/global.css`, after the `body` rules, ensure `#root` does not create an opaque cover. If `#root` has no background, leave it. Do **not** remove `body { background: var(--bg) }` — atmosphere canvas draws on top of body bg within the viewport.

If any section uses `background: var(--bg)` as a full opaque slab, change that section’s background to `transparent` **only** when it blocks the atmosphere (About pin, Reels, Featured, Contact). Leave card/elevated surfaces (`--bg-elevated`) alone.

- [ ] **Step 3: Run full unit suite**

Run: `npm test -- --run`  
Expected: all tests PASS (including new atmosphere tests)

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.tsx src/styles/global.css src/sections/About/About.module.css src/sections/Reels/Reels.module.css src/sections/Featured/Featured.module.css src/sections/Contact/Contact.tsx src/sections/Contact/Contact.module.css
git commit -m "feat: mount site atmosphere under Home sections"
```

(Only stage files you actually changed.)

---

### Task 4: Live browser QA (mandatory — not optional)

**Files:** none required unless fixes are needed

**Interfaces:** none

This task is the **definition of done** from the spec. Implementer must run the app and watch the scroll themselves.

- [ ] **Step 1: Start dev server**

Run: `npm run dev`  
Open the Local URL (e.g. `http://localhost:5173/` or `5175`).

- [ ] **Step 2: Desktop scroll pass (watch with your eyes)**

Viewport ~1280×800. Scroll Hero → About → Reels → Films → Contact slowly, then quickly.

Checklist (all must pass):

1. Below Hero, background is **alive** (grain/fog), not a flat screenshot  
2. Each of About / Reels / Featured / Contact shows a **visible soft light swell** on enter, then settles  
3. No flicker, tear, blank flash, or double-grain seam leaving Hero  
4. DualText lens + manifesto lens still work  
5. Corner social magnets still work; atmosphere never steals clicks  
6. Text/covers remain readable at enter peak  
7. Mid-laptop feels smooth with Lenis  

- [ ] **Step 3: Resize / mobile width**

Resize to ~390×844. Confirm canvas covers viewport, no seams; enter lights still fire; no horizontal overflow.

- [ ] **Step 4: Tab visibility**

Hide tab 5s, return — atmosphere resumes; no stuck/black canvas.

- [ ] **Step 5: Reduced-motion sanity** (if easy: OS toggle or DevTools emulate)

Fallback mode or static look; content readable; no crash.

- [ ] **Step 6: Fix any failures found in Steps 2–5**

Tune shader constants in `SiteAtmosphere.tsx` (`enter` multiplier, glow, grain) and/or `ENTER_DURATION` / ScrollTrigger `start` in the driver until checklist is green. Re-run the failing step after each fix.

- [ ] **Step 7: Final test + commit**

Run: `npm test -- --run`  
Expected: PASS  

```bash
git add -u src/components/webgl src/pages/Home.tsx src/styles/global.css
git commit -m "fix: polish living atmosphere after live scroll QA"
```

If no code changes were needed after QA, skip the commit and note “QA passed with no further changes” in the handoff.

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| Soft living fog + grain | Task 2 shader |
| Cursor lerp glow | Task 1 driver + Task 2 `uMouse` |
| Scroll velocity breath | Task 1 + Task 2 `uScrollVel` |
| Enter light swell → settle | Task 1 `pulseEnter` + Task 2 `uEnter` |
| Per-section resting mood | Task 1 `moodForSectionId` |
| Fixed canvas under Home | Task 3 |
| Hero kept; no seam | Task 1 `heroCover` + Task 2 mix |
| WebGL / reduced-motion fallback | Task 2 `data-mode="fallback"` |
| No new deps / no sound / bg-only scope | Global + Tasks 1–3 |
| Live scroll QA like award sites | Task 4 |

## Placeholder scan

No TBD / “implement later” / vague test steps remain.

## Type consistency

- `AtmosphereState` fields: `mouseX`, `mouseY`, `scrollVel`, `mood`, `enter`, `heroCover` — same names in driver and shader uniform mapping  
- Section ids: `about` | `reels` | `featured` | `contact` match DOM `id`s  
- Testid: `site-atmosphere`; modes: `webgl` | `fallback`
