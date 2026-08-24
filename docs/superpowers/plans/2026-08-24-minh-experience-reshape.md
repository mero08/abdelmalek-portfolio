# Minh-Inspired Experience Reshape Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reshape the existing Abdelmalek React portfolio so Home uses minhpham.design visual/motion language (corner chrome, taupe/orange type, dual-text hover, films list with accent bar, manifesto hero) without sound or a custom cursor.

**Architecture:** Keep routing, i18n, content helpers, VideoPlayer, and `/work/:slug`. Replace Home chrome and section presentation. Extend `site` content with placeholder hero lines and an about alt layer. Restyle tokens globally so Work pages inherit the same palette.

**Tech Stack:** React, Vite, TypeScript, React Router, CSS modules, GSAP/Lenis (existing), R3F hero backdrop (existing, kept restrained).

## Global Constraints

- No sound control, no custom cursor, no icon pack
- Corner socials are **text links**
- Bilingual EN + AR with RTL
- Empty reels/films sections stay hidden
- `prefers-reduced-motion` still gates Lenis + WebGL
- Static content only; placeholder copy is allowed
- Keep `/work/:slug`, VideoPlayer autoplay-on-activate, Open video escape
- Display font Syne; body Nunito Sans; Arabic IBM Plex Sans Arabic
- Colors: `--bg #0d0d0d`, `--fg #b7ab98`, `--accent #ff4d2e`, `--bar-ink #0d0d0d`

---

## File Structure

- Modify: `src/styles/tokens.css`, `src/content/types.ts`, `src/content/site.ts`, `src/content/content.test.ts`
- Create: `src/components/DualText/DualText.tsx`, `DualText.module.css`, `DualText.test.tsx`
- Modify: `src/components/Nav/Nav.tsx`, `Nav.module.css`, `Nav.test.tsx` (become corner chrome)
- Modify: `src/sections/Hero/*`, `About/*`, `Featured/*` (films list), `Reels/*`, `Contact/*`
- Modify: `src/pages/Work.module.css`, `src/components/webgl/HeroScene.tsx` (accent tint in shader)

---

### Task 1: Tokens + hero/about content

**Files:**
- Modify: `src/styles/tokens.css`, `src/content/types.ts`, `src/content/site.ts`, `src/content/content.test.ts`

**Interfaces:**
- Produces: `SiteContent.hero: { label: LocaleString; lines: LocaleString[]; accentLineIndexes: number[] }`
- Produces: `SiteContent.aboutAlt: LocaleString`
- Keeps: `site.about` as primary DualText layer

- [ ] **Step 1: Extend content test**

Add to `src/content/content.test.ts`:

```ts
  it('exposes placeholder hero lines and about alt', async () => {
    const { site } = await import('./site')
    expect(site.hero.lines.length).toBeGreaterThan(1)
    expect(site.hero.accentLineIndexes.length).toBeGreaterThan(0)
    expect(site.aboutAlt.en.length).toBeGreaterThan(0)
    expect(site.aboutAlt.ar.length).toBeGreaterThan(0)
  })
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm test -- src/content/content.test.ts`

- [ ] **Step 3: Implement types, site, tokens**

`SiteContent` add:

```ts
hero: {
  label: LocaleString
  lines: LocaleString[]
  accentLineIndexes: number[]
}
aboutAlt: LocaleString
```

Placeholder hero EN: label Abdelmalek Marwan; lines CUTTING / STORIES / THAT / LAND; accent index 1 (STORIES).

`tokens.css`: Nunito Sans in Google import; `--fg #b7ab98`; `--fg-bright #e8e0d4`; `--fg-muted #8a7f72`; `--accent #ff4d2e`; `--bar-ink #0d0d0d`; `--font-body: 'Nunito Sans'`.

- [ ] **Step 4: Tests pass + commit**

```bash
git commit -m "feat: lock Minh palette tokens and placeholder hero copy"
```

---

### Task 2: DualText

**Files:**
- Create: `src/components/DualText/DualText.tsx`, `DualText.module.css`, `DualText.test.tsx`

**Interfaces:**
- Produces: `export function DualText({ primary, alt, className? }: { primary: string; alt: string; className?: string })`

- [ ] **Step 1: Test** — render inside LocaleProvider not required (plain strings). Hover/focus reveals alt:

```tsx
it('reveals alternate text on hover', async () => {
  const user = userEvent.setup()
  render(<DualText primary="Primary bio" alt="Alternate bio" />)
  expect(screen.getByText('Primary bio')).toBeInTheDocument()
  await user.hover(screen.getByTestId('dual-text'))
  expect(screen.getByTestId('dual-text')).toHaveAttribute('data-revealed', 'true')
})
```

- [ ] **Step 2: Implement** — stacked layers; `:hover` and `:focus-within` set opacity; `data-revealed` from mouse enter/leave and focus/blur; transition 300ms; system cursor.

- [ ] **Step 3: Commit** `feat: add DualText hover layers`

---

### Task 3: Corner chrome Nav

**Files:**
- Modify: `src/components/Nav/Nav.tsx`, `Nav.module.css`, `Nav.test.tsx`

**Interfaces:**
- Consumes: `site.name`, `site.socials`, `useLocale`
- Home anchors: `#about`, `#featured` (Work), `#contact` — keep `id="featured"` on films section
- Lettermark `A` linking to `/`
- Vertical text socials (labels, not icons)
- Language EN | ع still tested

- [ ] **Step 1: Keep language toggle test; add social text links test**

```tsx
it('renders socials as text links', () => {
  render(/* MemoryRouter + LocaleProvider + Nav */)
  expect(screen.getByRole('link', { name: 'Instagram' })).toHaveAttribute('href', 'https://instagram.com/')
})
```

- [ ] **Step 2: Implement fixed corners CSS** (logo TL, nav+lang TR, socials BL). No sound. `aria-label="Primary"` kept.

- [ ] **Step 3: Commit** `feat: replace sticky bar with Minh-style corner chrome`

---

### Task 4: Hero manifesto + About DualText

**Files:**
- Modify: `src/sections/Hero/Hero.tsx`, `Hero.module.css`, `About/About.tsx`, `About.module.css`

**Interfaces:**
- Consumes: `site.hero`, `site.about`, `site.aboutAlt`, `DualText`

- [ ] **Step 1: Hero** — small label, stacked `h1` lines, accent class on `accentLineIndexes`. Keep `data-hero-canvas` + HeroScene. Centered manifesto, tight Syne, line-height ~0.85.

- [ ] **Step 2: About** — section label; `<DualText primary={t(site.about)} alt={t(site.aboutAlt)} />`

- [ ] **Step 3: Commit** `feat: manifesto hero and dual-text about`

---

### Task 5: Films list with accent bar

**Files:**
- Modify: `src/sections/Featured/Featured.tsx`, `Featured.module.css`, `Featured.test.tsx`

**Interfaces:**
- Keep `id="featured"`
- Each film is `Link` to `/work/:slug` with accessible name = title
- Active row via pointer (`onMouseEnter`) default index 0; orange full-bleed bar; hook visible on active row

- [ ] **Step 1: Keep existing link href test; add active bar**

```tsx
it('marks the first film active by default', () => {
  render(...)
  expect(screen.getByRole('link', { name: /night drive/i })).toHaveAttribute('data-active', 'true')
})
```

- [ ] **Step 2: Implement list UI (no CoverTransition cards).** Hide section if empty.

- [ ] **Step 3: Commit** `feat: replace film cards with Minh-style accent list`

---

### Task 6: Reels, Contact, Work restyle + shader tint

**Files:**
- Modify: Reels/Contact CSS (+ Contact optional DualText on closing), `Work.module.css`, `HeroScene.tsx` fragment glow toward accent, Reels compact.

- [ ] **Step 1: Restyle only** — taupe headings, compact reels strip, contact as large email + stacked text socials.

- [ ] **Step 2: Shader** — change `glow` vec3 toward orange-red `vec3(1.0, 0.30, 0.18) * 0.08`

- [ ] **Step 3: `npm test` + `npm run build` + commit** `feat: restyle reels, contact, work pages to Minh tokens`

---

## Spec coverage

| Spec | Task |
|------|------|
| Tokens / Syne / Nunito | 1 |
| DualText hover | 2, 4 |
| Corner chrome, text socials, no sound/cursor | 3 |
| Manifesto hero placeholders | 1, 4 |
| Films list + accent bar + /work links | 5 |
| Reels secondary strip | 6 |
| Work page same tokens | 6 |
| Restrained WebGL backdrop | 4 (keep) + 6 tint |
| Reduced motion (existing hooks) | unchanged |

**Placeholder scan:** none. **Types:** `hero`, `aboutAlt`, `DualText` props aligned.
