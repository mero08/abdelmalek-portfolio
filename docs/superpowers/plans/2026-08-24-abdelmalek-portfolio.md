# Abdelmalek Marwan Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static bilingual (EN/AR) video-editor portfolio for Abdelmalek Marwan with a minhpham.design-inspired scroll journey, light WebGL, reels, featured film pages, and email/social contact.

**Architecture:** React + Vite SPA with React Router. Static content modules feed Home sections and `/work/:slug` pages. GSAP + Lenis drive scroll storytelling; React Three Fiber adds a light hero atmosphere and cover transitions. Language preference lives in React context + `localStorage`; Arabic sets `dir="rtl"` on `<html>`.

**Tech Stack:** React 19, TypeScript, Vite, React Router 7, GSAP + ScrollTrigger, Lenis, Three.js + @react-three/fiber + @react-three/drei, Vitest + React Testing Library, CSS modules (no icon library).

## Global Constraints

- No database, CMS, backend, or contact form
- No custom icon set — typography and text links only
- Light WebGL only (hero + cover transitions); no 3D game world
- Videos: YouTube + Vimeo, cover-first click-to-play, lazy embeds
- Bilingual EN + AR with RTL for Arabic
- Empty reel/film lists: hide that section entirely
- Respect `prefers-reduced-motion` (gate GSAP theater + WebGL)
- Primary visual reference: minhpham.design (dark premium editorial)

---

## File Structure

```
package.json
vite.config.ts
tsconfig.json
tsconfig.app.json
tsconfig.node.json
index.html
vitest.config.ts
public/
  images/
    covers/          # placeholder covers (SVG or solid PNG)
    stills/
src/
  main.tsx
  App.tsx
  styles/
    tokens.css       # dark editorial CSS variables + fonts
    global.css
  content/
    site.ts          # name, role, about, email, socials
    reels.ts         # reel list (can start with 2–3 placeholders)
    films.ts         # film list with slugs
    types.ts         # LocaleString, Reel, Film, SiteContent
  i18n/
    LocaleContext.tsx
    useLocale.ts
    t.ts             # pickLocale(string | LocaleString, lang)
  lib/
    embeds.ts        # youtube/vimeo → embed URL + outbound URL
    reducedMotion.ts
  hooks/
    useLenis.ts
    useGsapContext.ts
  components/
    Nav/
      Nav.tsx
      Nav.module.css
    VideoPlayer/
      VideoPlayer.tsx
      VideoPlayer.module.css
    CoverImage/
      CoverImage.tsx
      CoverImage.module.css
    webgl/
      HeroScene.tsx
      CoverTransition.tsx
  sections/
    Hero/
      Hero.tsx
      Hero.module.css
    About/
      About.tsx
      About.module.css
    Reels/
      Reels.tsx
      Reels.module.css
    Featured/
      Featured.tsx
      Featured.module.css
    Contact/
      Contact.tsx
      Contact.module.css
  pages/
    Home.tsx
    Work.tsx
    Work.module.css
    NotFound.tsx
  test/
    setup.ts
```

---

### Task 1: Scaffold Vite React TypeScript project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styles/global.css`, `src/styles/tokens.css`, `vitest.config.ts`, `src/test/setup.ts`

**Interfaces:**
- Produces: runnable Vite app at `/`; Vitest configured with jsdom + RTL setup

- [ ] **Step 1: Scaffold the project**

From repo root (`Abdo/`):

```bash
npm create vite@latest . -- --template react-ts
```

If the directory is not empty (docs already exist), create in a temp folder and move `package.json`, `vite.config.ts`, `tsconfig*`, `index.html`, `src/` into the root, keeping `docs/` and `.git/`.

- [ ] **Step 2: Install runtime and test dependencies**

```bash
npm install react-router-dom gsap lenis three @react-three/fiber @react-three/drei
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @types/three
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

Update `vite.config.ts` to add the same `@` alias.

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Replace default App with a dark shell**

`src/styles/tokens.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Instrument+Sans:wght@400;500;600&display=swap');

:root {
  --bg: #0d0d0d;
  --bg-elevated: #161616;
  --fg: #f2f2f2;
  --fg-muted: #a0a0a0;
  --line: rgba(242, 242, 242, 0.12);
  --accent: #e8e4dc;
  --font-display: 'Syne', system-ui, sans-serif;
  --font-body: 'Instrument Sans', system-ui, sans-serif;
  --font-arabic: 'IBM Plex Sans Arabic', 'Instrument Sans', sans-serif;
  --nav-h: 4.5rem;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
}
```

`src/styles/global.css`:

```css
@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

html[lang='ar'] body {
  font-family: var(--font-arabic);
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
  display: block;
}

button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
}
```

`src/App.tsx`:

```tsx
import './styles/global.css'

export default function App() {
  return (
    <main>
      <h1>Abdelmalek Marwan</h1>
    </main>
  )
}
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 5: Verify scaffold**

```bash
npm run dev
npm test
```

Expected: dev server starts; Vitest runs with 0 tests (or passes default). Page shows dark background + name.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.ts vitest.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json index.html src
git commit -m "chore: scaffold Vite React TypeScript portfolio app"
```

---

### Task 2: Content types and static content modules

**Files:**
- Create: `src/content/types.ts`, `src/content/site.ts`, `src/content/reels.ts`, `src/content/films.ts`
- Test: `src/content/content.test.ts`

**Interfaces:**
- Produces:
  - `export type Lang = 'en' | 'ar'`
  - `export type LocaleString = { en: string; ar: string }`
  - `export type EmbedProvider = 'youtube' | 'vimeo'`
  - `export interface SiteContent { name: string; role: LocaleString; about: LocaleString; email: string; socials: { label: string; url: string }[] }`
  - `export interface Reel { id: string; title: LocaleString; cover: string | null; provider: EmbedProvider; url: string }`
  - `export interface Film { slug: string; title: LocaleString; hook: LocaleString; story: LocaleString; role?: LocaleString; cover: string | null; stills: string[]; provider: EmbedProvider; url: string; sortOrder: number }`
  - `export const site: SiteContent`
  - `export const reels: Reel[]`
  - `export const films: Film[]`
  - `export function getFilmBySlug(slug: string): Film | undefined`
  - `export function getAdjacentFilms(slug: string): { prev?: Film; next?: Film }`

- [ ] **Step 1: Write failing tests**

`src/content/content.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { films, getAdjacentFilms, getFilmBySlug, reels, site } from './films'
import { site as siteContent } from './site'
import { reels as reelsContent } from './reels'
import { films as filmsContent, getAdjacentFilms as adj, getFilmBySlug as bySlug } from './films'

describe('content modules', () => {
  it('exposes site identity and contact', async () => {
    const { site } = await import('./site')
    expect(site.name).toBe('Abdelmalek Marwan')
    expect(site.email).toContain('@')
    expect(site.role.en.length).toBeGreaterThan(0)
    expect(site.role.ar.length).toBeGreaterThan(0)
    expect(site.socials.length).toBeGreaterThan(0)
  })

  it('finds films by slug and adjacent order', async () => {
    const { films, getFilmBySlug, getAdjacentFilms } = await import('./films')
    expect(films.length).toBeGreaterThan(0)
    const first = films[0]
    expect(getFilmBySlug(first.slug)).toEqual(first)
    expect(getFilmBySlug('does-not-exist')).toBeUndefined()
    const { next } = getAdjacentFilms(first.slug)
    if (films.length > 1) {
      expect(next?.slug).toBe(films[1].slug)
    }
  })

  it('hides sections when lists are empty-compatible shapes', async () => {
    const { reels } = await import('./reels')
    expect(Array.isArray(reels)).toBe(true)
  })
})
```

Fix the test file — remove the broken duplicate imports at the top. Final test file:

```ts
import { describe, expect, it } from 'vitest'

describe('content modules', () => {
  it('exposes site identity and contact', async () => {
    const { site } = await import('./site')
    expect(site.name).toBe('Abdelmalek Marwan')
    expect(site.email).toContain('@')
    expect(site.role.en.length).toBeGreaterThan(0)
    expect(site.role.ar.length).toBeGreaterThan(0)
    expect(site.socials.length).toBeGreaterThan(0)
  })

  it('finds films by slug and adjacent order', async () => {
    const { films, getFilmBySlug, getAdjacentFilms } = await import('./films')
    expect(films.length).toBeGreaterThan(0)
    const first = [...films].sort((a, b) => a.sortOrder - b.sortOrder)[0]
    expect(getFilmBySlug(first.slug)).toEqual(first)
    expect(getFilmBySlug('does-not-exist')).toBeUndefined()
    const { next } = getAdjacentFilms(first.slug)
    if (films.length > 1) {
      const ordered = [...films].sort((a, b) => a.sortOrder - b.sortOrder)
      expect(next?.slug).toBe(ordered[1].slug)
    }
  })

  it('exposes reels as an array', async () => {
    const { reels } = await import('./reels')
    expect(Array.isArray(reels)).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```

Expected: FAIL — modules not found / exports missing.

- [ ] **Step 3: Implement types and content**

`src/content/types.ts`:

```ts
export type Lang = 'en' | 'ar'

export type LocaleString = {
  en: string
  ar: string
}

export type EmbedProvider = 'youtube' | 'vimeo'

export type SocialLink = {
  label: string
  url: string
}

export type SiteContent = {
  name: string
  role: LocaleString
  about: LocaleString
  email: string
  socials: SocialLink[]
}

export type Reel = {
  id: string
  title: LocaleString
  cover: string | null
  provider: EmbedProvider
  url: string
}

export type Film = {
  slug: string
  title: LocaleString
  hook: LocaleString
  story: LocaleString
  role?: LocaleString
  cover: string | null
  stills: string[]
  provider: EmbedProvider
  url: string
  sortOrder: number
}
```

`src/content/site.ts`:

```ts
import type { SiteContent } from './types'

export const site: SiteContent = {
  name: 'Abdelmalek Marwan',
  role: {
    en: 'Video Editor',
    ar: 'مونتير فيديو',
  },
  about: {
    en: 'I craft paced, emotional edits that make brands and stories feel intentional. Selective work. Clear communication. Delivery you can trust.',
    ar: 'أصنع مونتاجاً متزناً وعاطفياً يجعل العلامات والقصص تبدو مقصودة. عمل انتقائي. تواصل واضح. تسليم يمكنك الوثوق به.',
  },
  email: 'hello@abdelmalek.studio',
  socials: [
    { label: 'Instagram', url: 'https://instagram.com/' },
    { label: 'Vimeo', url: 'https://vimeo.com/' },
  ],
}
```

`src/content/reels.ts`:

```ts
import type { Reel } from './types'

export const reels: Reel[] = [
  {
    id: 'reel-01',
    title: { en: 'Selected Cuts 01', ar: 'مختارات ٠١' },
    cover: null,
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    id: 'reel-02',
    title: { en: 'Selected Cuts 02', ar: 'مختارات ٠٢' },
    cover: null,
    provider: 'vimeo',
    url: 'https://vimeo.com/347119375',
  },
]
```

`src/content/films.ts`:

```ts
import type { Film } from './types'

export const films: Film[] = [
  {
    slug: 'night-drive',
    title: { en: 'Night Drive', ar: 'قيادة ليلية' },
    hook: { en: 'A quiet city film about pace and light.', ar: 'فيلم هادئ عن المدينة والإيقاع والضوء.' },
    story: {
      en: 'Long-form piece built around rhythm, negative space, and restrained color.',
      ar: 'عمل طويل مبني حول الإيقاع والفراغ واللون المتزن.',
    },
    role: { en: 'Edit & finishing', ar: 'مونتاج وإنهاء' },
    cover: null,
    stills: [],
    provider: 'vimeo',
    url: 'https://vimeo.com/347119375',
    sortOrder: 1,
  },
  {
    slug: 'brand-pulse',
    title: { en: 'Brand Pulse', ar: 'نبض العلامة' },
    hook: { en: 'Commercial storytelling with sharp transitions.', ar: 'سرد إعلاني بانتقالات حادة.' },
    story: {
      en: 'Featured commercial cut focusing on product moments and music hits.',
      ar: 'مونتاج إعلاني يركز على لحظات المنتج وإيقاعات الموسيقى.',
    },
    role: { en: 'Editor', ar: 'مونتير' },
    cover: null,
    stills: [],
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    sortOrder: 2,
  },
]

function orderedFilms(): Film[] {
  return [...films].sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getFilmBySlug(slug: string): Film | undefined {
  return films.find((f) => f.slug === slug)
}

export function getAdjacentFilms(slug: string): { prev?: Film; next?: Film } {
  const list = orderedFilms()
  const index = list.findIndex((f) => f.slug === slug)
  if (index === -1) return {}
  return {
    prev: index > 0 ? list[index - 1] : undefined,
    next: index < list.length - 1 ? list[index + 1] : undefined,
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/content
git commit -m "feat: add static bilingual content model for site, reels, and films"
```

---

### Task 3: Locale helpers, context, and embed URL parsing

**Files:**
- Create: `src/i18n/t.ts`, `src/i18n/LocaleContext.tsx`, `src/i18n/useLocale.ts`, `src/lib/embeds.ts`, `src/lib/reducedMotion.ts`
- Test: `src/i18n/t.test.ts`, `src/lib/embeds.test.ts`

**Interfaces:**
- Produces:
  - `pickLocale(value: string | LocaleString, lang: Lang): string` — falls back to `en` then `ar`
  - `LocaleProvider` + `useLocale(): { lang: Lang; setLang: (l: Lang) => void; t: (v: string | LocaleString) => string }`
  - `toEmbedSrc(provider, url): string | null`
  - `toWatchUrl(provider, url): string`
  - `prefersReducedMotion(): boolean`

- [ ] **Step 1: Write failing tests**

`src/i18n/t.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { pickLocale } from './t'

describe('pickLocale', () => {
  it('returns string as-is', () => {
    expect(pickLocale('Hello', 'ar')).toBe('Hello')
  })

  it('picks requested language', () => {
    expect(pickLocale({ en: 'Editor', ar: 'مونتير' }, 'ar')).toBe('مونتير')
  })

  it('falls back to English then Arabic', () => {
    expect(pickLocale({ en: 'Editor', ar: '' }, 'ar')).toBe('Editor')
    expect(pickLocale({ en: '', ar: 'مونتير' }, 'en')).toBe('مونتير')
  })
})
```

`src/lib/embeds.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { toEmbedSrc, toWatchUrl } from './embeds'

describe('embeds', () => {
  it('builds youtube embed and watch urls', () => {
    expect(toEmbedSrc('youtube', 'https://www.youtube.com/watch?v=abc123XYZ_-')).toBe(
      'https://www.youtube.com/embed/abc123XYZ_-',
    )
    expect(toEmbedSrc('youtube', 'https://youtu.be/abc123XYZ_-')).toBe(
      'https://www.youtube.com/embed/abc123XYZ_-',
    )
    expect(toWatchUrl('youtube', 'https://youtu.be/abc123XYZ_-')).toBe(
      'https://www.youtube.com/watch?v=abc123XYZ_-',
    )
  })

  it('builds vimeo embed and watch urls', () => {
    expect(toEmbedSrc('vimeo', 'https://vimeo.com/347119375')).toBe(
      'https://player.vimeo.com/video/347119375',
    )
    expect(toWatchUrl('vimeo', 'https://vimeo.com/347119375')).toBe(
      'https://vimeo.com/347119375',
    )
  })

  it('returns null for invalid urls', () => {
    expect(toEmbedSrc('youtube', 'https://example.com')).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```

Expected: FAIL — modules missing.

- [ ] **Step 3: Implement helpers and locale provider**

`src/i18n/t.ts`:

```ts
import type { Lang, LocaleString } from '../content/types'

export function pickLocale(value: string | LocaleString, lang: Lang): string {
  if (typeof value === 'string') return value
  const primary = value[lang]?.trim()
  if (primary) return primary
  const en = value.en?.trim()
  if (en) return en
  return value.ar?.trim() ?? ''
}
```

`src/lib/embeds.ts`:

```ts
import type { EmbedProvider } from '../content/types'

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      return u.pathname.replace('/', '') || null
    }
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v')
    }
  } catch {
    return null
  }
  return null
}

function vimeoId(url: string): string | null {
  try {
    const u = new URL(url)
    if (!u.hostname.includes('vimeo.com')) return null
    const parts = u.pathname.split('/').filter(Boolean)
    const id = parts.find((p) => /^\d+$/.test(p))
    return id ?? null
  } catch {
    return null
  }
}

export function toEmbedSrc(provider: EmbedProvider, url: string): string | null {
  if (provider === 'youtube') {
    const id = youtubeId(url)
    return id ? `https://www.youtube.com/embed/${id}` : null
  }
  const id = vimeoId(url)
  return id ? `https://player.vimeo.com/video/${id}` : null
}

export function toWatchUrl(provider: EmbedProvider, url: string): string {
  if (provider === 'youtube') {
    const id = youtubeId(url)
    return id ? `https://www.youtube.com/watch?v=${id}` : url
  }
  const id = vimeoId(url)
  return id ? `https://vimeo.com/${id}` : url
}
```

`src/lib/reducedMotion.ts`:

```ts
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}
```

`src/i18n/LocaleContext.tsx`:

```tsx
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Lang, LocaleString } from '../content/types'
import { pickLocale } from './t'

type LocaleContextValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (value: string | LocaleString) => string
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

const STORAGE_KEY = 'abdo-lang'

function detectInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'ar') return stored
  const nav = navigator.language.toLowerCase()
  if (nav.startsWith('ar')) return 'ar'
  if (nav.startsWith('en')) return 'en'
  return 'en'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectInitialLang())

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const t = useCallback(
    (value: string | LocaleString) => pickLocale(value, lang),
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}
```

`src/i18n/useLocale.ts`:

```ts
import { useContext } from 'react'
import { LocaleContext } from './LocaleContext'

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/i18n src/lib
git commit -m "feat: add locale picker, LocaleProvider, and YouTube/Vimeo embed helpers"
```

---

### Task 4: Routing shell, Nav, CoverImage, VideoPlayer

**Files:**
- Create: `src/components/Nav/Nav.tsx`, `Nav.module.css`, `src/components/CoverImage/CoverImage.tsx`, `CoverImage.module.css`, `src/components/VideoPlayer/VideoPlayer.tsx`, `VideoPlayer.module.css`, `src/pages/Home.tsx`, `src/pages/Work.tsx`, `src/pages/NotFound.tsx`
- Modify: `src/App.tsx`, `src/main.tsx`
- Test: `src/components/VideoPlayer/VideoPlayer.test.tsx`, `src/components/Nav/Nav.test.tsx`

**Interfaces:**
- Consumes: `site`, `useLocale`, `toEmbedSrc`, `toWatchUrl`
- Produces:
  - Routes: `/` → Home, `/work/:slug` → Work, `*` → NotFound
  - `<Nav />` with section anchors + `EN | ع` toggle
  - `<CoverImage cover={string|null} title={string} />`
  - `<VideoPlayer provider url cover title />` — cover-first; on click load iframe; on bad embed show unavailable + outbound link

- [ ] **Step 1: Write failing component tests**

`src/components/VideoPlayer/VideoPlayer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { VideoPlayer } from './VideoPlayer'

describe('VideoPlayer', () => {
  it('shows cover and loads embed on click', async () => {
    const user = userEvent.setup()
    render(
      <VideoPlayer
        provider="youtube"
        url="https://www.youtube.com/watch?v=abc123XYZ_-"
        cover={null}
        title="Test Reel"
      />,
    )
    expect(screen.getByRole('button', { name: /play test reel/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /play test reel/i }))
    expect(screen.getByTitle('Test Reel')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/abc123XYZ_-',
    )
  })

  it('shows unavailable state for bad urls', async () => {
    const user = userEvent.setup()
    render(
      <VideoPlayer
        provider="youtube"
        url="https://example.com/nope"
        cover={null}
        title="Broken"
      />,
    )
    await user.click(screen.getByRole('button', { name: /play broken/i }))
    expect(screen.getByText(/video unavailable/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open on youtube|open video/i })).toBeInTheDocument()
  })
})
```

`src/components/Nav/Nav.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { Nav } from './Nav'

describe('Nav', () => {
  it('toggles language labels', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Nav />
        </LocaleProvider>
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'ع' }))
    expect(document.documentElement.lang).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```

Expected: FAIL — components missing.

- [ ] **Step 3: Implement CoverImage, VideoPlayer, Nav, pages shell, App routes**

`src/components/CoverImage/CoverImage.tsx`:

```tsx
import styles from './CoverImage.module.css'

type Props = {
  cover: string | null
  title: string
  className?: string
}

export function CoverImage({ cover, title, className }: Props) {
  if (cover) {
    return (
      <img
        className={[styles.img, className].filter(Boolean).join(' ')}
        src={cover}
        alt={title}
        loading="lazy"
      />
    )
  }
  return (
    <div className={[styles.placeholder, className].filter(Boolean).join(' ')} aria-hidden>
      <span>{title}</span>
    </div>
  )
}
```

`src/components/CoverImage/CoverImage.module.css`:

```css
.img,
.placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder {
  display: grid;
  place-items: center;
  background: var(--bg-elevated);
  border: 1px solid var(--line);
  color: var(--fg-muted);
  padding: 1.5rem;
  text-align: center;
  font-family: var(--font-display);
  letter-spacing: 0.04em;
}
```

`src/components/VideoPlayer/VideoPlayer.tsx`:

```tsx
import { useMemo, useState } from 'react'
import { toEmbedSrc, toWatchUrl } from '../../lib/embeds'
import type { EmbedProvider } from '../../content/types'
import { CoverImage } from '../CoverImage/CoverImage'
import styles from './VideoPlayer.module.css'

type Props = {
  provider: EmbedProvider
  url: string
  cover: string | null
  title: string
}

export function VideoPlayer({ provider, url, cover, title }: Props) {
  const [active, setActive] = useState(false)
  const embed = useMemo(() => toEmbedSrc(provider, url), [provider, url])
  const watch = useMemo(() => toWatchUrl(provider, url), [provider, url])

  if (active && !embed) {
    return (
      <div className={styles.frame}>
        <CoverImage cover={cover} title={title} />
        <div className={styles.overlay}>
          <p>Video unavailable</p>
          <a href={watch} target="_blank" rel="noreferrer">
            Open video
          </a>
        </div>
      </div>
    )
  }

  if (active && embed) {
    return (
      <div className={styles.frame}>
        <iframe
          className={styles.iframe}
          src={embed}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      className={styles.frame}
      onClick={() => setActive(true)}
      aria-label={`Play ${title}`}
    >
      <CoverImage cover={cover} title={title} />
      <span className={styles.play}>Play</span>
    </button>
  )
}
```

`src/components/VideoPlayer/VideoPlayer.module.css`:

```css
.frame {
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--bg-elevated);
  border: 1px solid var(--line);
  padding: 0;
  text-align: start;
}

.iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.play,
.overlay {
  position: absolute;
  inset: auto 1rem 1rem auto;
  padding: 0.55rem 0.9rem;
  background: rgba(13, 13, 13, 0.72);
  border: 1px solid var(--line);
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.overlay {
  inset: 0;
  display: grid;
  place-content: center;
  gap: 0.75rem;
  text-align: center;
  background: rgba(13, 13, 13, 0.78);
}

.overlay a {
  text-decoration: underline;
}
```

`src/components/Nav/Nav.tsx`:

```tsx
import { Link, useLocation } from 'react-router-dom'
import { site } from '../../content/site'
import { useLocale } from '../../i18n/useLocale'
import styles from './Nav.module.css'

const sections = [
  { id: 'about', en: 'About', ar: 'نبذة' },
  { id: 'reels', en: 'Reels', ar: 'ريلز' },
  { id: 'featured', en: 'Work', ar: 'أعمال' },
  { id: 'contact', en: 'Contact', ar: 'تواصل' },
]

export function Nav() {
  const { lang, setLang, t } = useLocale()
  const { pathname } = useLocation()
  const onHome = pathname === '/'

  return (
    <header className={styles.nav}>
      <Link to="/" className={styles.brand}>
        {site.name}
      </Link>
      <nav className={styles.links} aria-label="Primary">
        {onHome &&
          sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {t({ en: s.en, ar: s.ar })}
            </a>
          ))}
        {!onHome && (
          <Link to="/#featured">{t({ en: 'Work', ar: 'أعمال' })}</Link>
        )}
      </nav>
      <div className={styles.lang} role="group" aria-label="Language">
        <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
          EN
        </button>
        <button type="button" aria-pressed={lang === 'ar'} onClick={() => setLang('ar')}>
          ع
        </button>
      </div>
    </header>
  )
}
```

`src/components/Nav/Nav.module.css`:

```css
.nav {
  position: sticky;
  top: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-height: var(--nav-h);
  padding: 0.75rem clamp(1rem, 4vw, 3rem);
  background: rgba(13, 13, 13, 0.82);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
}

.brand {
  font-family: var(--font-display);
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-inline-end: auto;
}

.links {
  display: none;
  gap: 1.25rem;
  font-size: 0.9rem;
  color: var(--fg-muted);
}

.links a:hover {
  color: var(--fg);
}

.lang {
  display: flex;
  gap: 0.35rem;
}

.lang button {
  min-width: 2.25rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid transparent;
  color: var(--fg-muted);
}

.lang button[aria-pressed='true'] {
  color: var(--fg);
  border-color: var(--line);
}

@media (min-width: 800px) {
  .links {
    display: flex;
  }
}
```

`src/pages/Home.tsx` (placeholder sections for now):

```tsx
export function Home() {
  return (
    <>
      <section id="hero" style={{ minHeight: '100vh', padding: '4rem 1.5rem' }}>
        <h1>Abdelmalek Marwan</h1>
      </section>
      <section id="about" style={{ minHeight: '50vh', padding: '4rem 1.5rem' }}>
        About
      </section>
      <section id="reels" style={{ minHeight: '50vh', padding: '4rem 1.5rem' }}>
        Reels
      </section>
      <section id="featured" style={{ minHeight: '50vh', padding: '4rem 1.5rem' }}>
        Work
      </section>
      <section id="contact" style={{ minHeight: '40vh', padding: '4rem 1.5rem' }}>
        Contact
      </section>
    </>
  )
}
```

`src/pages/Work.tsx`:

```tsx
import { Link, useParams } from 'react-router-dom'
import { getFilmBySlug } from '../content/films'
import { useLocale } from '../i18n/useLocale'

export function Work() {
  const { slug = '' } = useParams()
  const { t } = useLocale()
  const film = getFilmBySlug(slug)

  if (!film) {
    return (
      <main style={{ padding: '4rem 1.5rem' }}>
        <p>Not found</p>
        <Link to="/">Home</Link>
      </main>
    )
  }

  return (
    <main style={{ padding: '4rem 1.5rem' }}>
      <h1>{t(film.title)}</h1>
      <Link to="/#featured">Back</Link>
    </main>
  )
}
```

`src/pages/NotFound.tsx`:

```tsx
import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main style={{ padding: '4rem 1.5rem' }}>
      <h1>404</h1>
      <Link to="/">Home</Link>
    </main>
  )
}
```

`src/App.tsx`:

```tsx
import { Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav/Nav'
import { LocaleProvider } from './i18n/LocaleContext'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Work } from './pages/Work'
import './styles/global.css'

export default function App() {
  return (
    <LocaleProvider>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/work/:slug" element={<Work />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LocaleProvider>
  )
}
```

`src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```

Expected: PASS

- [ ] **Step 5: Manual check**

```bash
npm run dev
```

Verify: sticky nav, EN/ع toggles `dir`, `/work/night-drive` renders title, hash links exist.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/main.tsx src/components src/pages
git commit -m "feat: add routing, nav language toggle, cover and video player"
```

---

### Task 5: Homepage sections — Hero, About, Reels, Featured, Contact

**Files:**
- Create: all files under `src/sections/{Hero,About,Reels,Featured,Contact}/`
- Modify: `src/pages/Home.tsx`
- Test: `src/sections/Featured/Featured.test.tsx`, `src/sections/Reels/Reels.test.tsx`

**Interfaces:**
- Consumes: `site`, `reels`, `films`, `useLocale`, `VideoPlayer`, `CoverImage`
- Produces: fully wired Home journey; hide Reels/Featured when arrays empty

- [ ] **Step 1: Write failing section tests**

`src/sections/Reels/Reels.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { Reels } from './Reels'

vi.mock('../../content/reels', () => ({
  reels: [],
}))

describe('Reels', () => {
  it('renders nothing when empty', () => {
    const { container } = render(
      <LocaleProvider>
        <Reels />
      </LocaleProvider>,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
```

`src/sections/Featured/Featured.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../../i18n/LocaleContext'
import { Featured } from './Featured'

describe('Featured', () => {
  it('links each film to its work page', () => {
    render(
      <MemoryRouter>
        <LocaleProvider>
          <Featured />
        </LocaleProvider>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /night drive/i })).toHaveAttribute(
      'href',
      '/work/night-drive',
    )
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```

Expected: FAIL — sections missing.

- [ ] **Step 3: Implement sections (structure + styling; motion later)**

Implement each section with dark editorial spacing. Key behaviors:

**Hero** — full viewport, `site.name`, `t(site.role)`, scroll line + text “Scroll” / “مرر”, mount point `div` with `data-hero-canvas` for WebGL later.

**About** — `id="about"`, heading + `t(site.about)`.

**Reels** — if `reels.length === 0` return `null`; else horizontal scroll strip of `VideoPlayer` cards.

**Featured** — if `films.length === 0` return `null`; else sorted cards linking to `/work/:slug` with `CoverImage` + title + hook.

**Contact** — mailto `site.email`, map `site.socials` as text links, closing line bilingual.

Wire them in `Home.tsx` in order: Hero → About → Reels → Featured → Contact.

Example `Featured.tsx` core:

```tsx
import { Link } from 'react-router-dom'
import { films } from '../../content/films'
import { useLocale } from '../../i18n/useLocale'
import { CoverImage } from '../../components/CoverImage/CoverImage'
import styles from './Featured.module.css'

export function Featured() {
  const { t } = useLocale()
  const list = [...films].sort((a, b) => a.sortOrder - b.sortOrder)
  if (list.length === 0) return null

  return (
    <section id="featured" className={styles.section}>
      <h2 className={styles.heading}>{t({ en: 'Selected films', ar: 'أفلام مختارة' })}</h2>
      <ul className={styles.list}>
        {list.map((film) => (
          <li key={film.slug}>
            <Link to={`/work/${film.slug}`} className={styles.card} aria-label={t(film.title)}>
              <div className={styles.media}>
                <CoverImage cover={film.cover} title={t(film.title)} />
              </div>
              <div className={styles.meta}>
                <h3>{t(film.title)}</h3>
                <p>{t(film.hook)}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

Style sections with large display type (`Syne`), generous vertical padding (`clamp(5rem, 14vh, 9rem)`), muted rules, no cards-as-chrome except interactive reel/film surfaces.

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test
```

- [ ] **Step 5: Visual pass**

```bash
npm run dev
```

Check EN/AR copy, empty-section hide by temporarily emptying arrays, featured links work.

- [ ] **Step 6: Commit**

```bash
git add src/sections src/pages/Home.tsx
git commit -m "feat: build homepage hero, about, reels, featured, and contact sections"
```

---

### Task 6: Film project page (Work)

**Files:**
- Modify: `src/pages/Work.tsx`, create `src/pages/Work.module.css`
- Test: `src/pages/Work.test.tsx`

**Interfaces:**
- Consumes: `getFilmBySlug`, `getAdjacentFilms`, `VideoPlayer`, `CoverImage`, `useLocale`
- Produces: full film page with cover, story, role, player, stills, back + prev/next

- [ ] **Step 1: Write failing test**

`src/pages/Work.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { LocaleProvider } from '../i18n/LocaleContext'
import { Work } from './Work'

function renderWork(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/work/${slug}`]}>
      <LocaleProvider>
        <Routes>
          <Route path="/work/:slug" element={<Work />} />
        </Routes>
      </LocaleProvider>
    </MemoryRouter>,
  )
}

describe('Work page', () => {
  it('renders film story and navigation', () => {
    renderWork('night-drive')
    expect(screen.getByRole('heading', { name: /night drive/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute('href', '/#featured')
    expect(screen.getByRole('link', { name: /brand pulse/i })).toHaveAttribute(
      'href',
      '/work/brand-pulse',
    )
  })

  it('shows not found for unknown slug', () => {
    renderWork('missing')
    expect(screen.getByText(/not found/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run — expect FAIL** (incomplete Work page)

- [ ] **Step 3: Implement full Work page**

Include:
- Full-bleed cover via `CoverImage`
- Title, hook, story, optional role
- `VideoPlayer` for the film
- Stills grid if `stills.length > 0`
- `Link to="/#featured"` labeled via `t({ en: 'Back to work', ar: 'العودة للأعمال' })`
- Prev/next from `getAdjacentFilms`

- [ ] **Step 4: Run tests — PASS**

- [ ] **Step 5: Commit**

```bash
git add src/pages/Work.tsx src/pages/Work.module.css src/pages/Work.test.tsx
git commit -m "feat: complete film project pages with player and adjacent navigation"
```

---

### Task 7: Lenis smooth scroll + GSAP section reveals

**Files:**
- Create: `src/hooks/useLenis.ts`, `src/hooks/useGsapContext.ts`, `src/hooks/useSectionReveal.ts`
- Modify: `src/pages/Home.tsx`, section components as needed
- Test: `src/lib/reducedMotion.test.ts`

**Interfaces:**
- Produces: Lenis on Home when motion allowed; GSAP fade/rise for section headings; cleanup on unmount; no-op when `prefersReducedMotion()`

- [ ] **Step 1: Write reduced-motion test**

`src/lib/reducedMotion.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { prefersReducedMotion } from './reducedMotion'

describe('prefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads matchMedia', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
    )
    expect(prefersReducedMotion()).toBe(true)
  })
})
```

- [ ] **Step 2: Implement hooks**

`useLenis.ts` — create Lenis in `useEffect`, `requestAnimationFrame` loop, destroy on cleanup; skip if reduced motion.

`useGsapContext.ts` — wrap `gsap.context` + ScrollTrigger, revert on cleanup.

`useSectionReveal.ts` — query `[data-reveal]` children and animate `opacity/y` with ScrollTrigger; skip if reduced motion.

Wire `useLenis()` and section reveals from `Home`.

Register ScrollTrigger once:

```ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)
```

- [ ] **Step 3: Manual check** — scroll feels smooth; with OS reduced motion, no Lenis/GSAP theater.

- [ ] **Step 4: Commit**

```bash
git add src/hooks src/lib/reducedMotion.test.ts src/pages/Home.tsx src/sections
git commit -m "feat: add Lenis smooth scroll and GSAP section reveals with reduced-motion gate"
```

---

### Task 8: Light WebGL hero atmosphere

**Files:**
- Create: `src/components/webgl/HeroScene.tsx`, `src/components/webgl/useWebglEnabled.ts`
- Modify: `src/sections/Hero/Hero.tsx`

**Interfaces:**
- Produces: R3F canvas behind hero type — soft gradient plane + slow noise/displacement or drifting particles; pauses when `document.hidden`; disabled when `prefersReducedMotion()` or WebGL unavailable

- [ ] **Step 1: Implement `useWebglEnabled`**

```ts
import { prefersReducedMotion } from '../../lib/reducedMotion'

export function useWebglEnabled(): boolean {
  if (typeof window === 'undefined') return false
  if (prefersReducedMotion()) return false
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
  } catch {
    return false
  }
}
```

- [ ] **Step 2: Implement `HeroScene`**

Minimal R3F scene:
- Orthographic or perspective camera
- Dark plane + custom shader material with slow time uniform (soft light smear / noise)
- `frameloop={hidden ? 'never' : 'always'}` via visibility listener
- `dpr={[1, 1.5]}` and low-cost geometry

- [ ] **Step 3: Mount in Hero** absolutely behind typography; pointer-events none; keep type crisp above canvas.

- [ ] **Step 4: Manual check** — hero feels premium; GPU usage modest; reduced motion shows static CSS gradient fallback instead.

- [ ] **Step 5: Commit**

```bash
git add src/components/webgl src/sections/Hero
git commit -m "feat: add light WebGL hero atmosphere with reduced-motion fallback"
```

---

### Task 9: Cover hover WebGL treatment (optional polish on Featured cards)

**Files:**
- Create: `src/components/webgl/CoverTransition.tsx`
- Modify: `src/sections/Featured/Featured.tsx`

**Interfaces:**
- Produces: on desktop hover (and when WebGL enabled), subtle displacement/crossfade on cover; otherwise CSS scale/opacity only

- [ ] **Step 1: Implement lightweight hover effect**

Prefer a CSS-first fallback (`transform: scale(1.03)` + opacity). If WebGL enabled and not touch device, wrap cover in `CoverTransition` that swaps/displaces between cover texture and darkened twin — keep shader tiny.

If time/risk is high, ship CSS-only hover and leave `CoverTransition` as a thin wrapper that currently applies CSS — still satisfies “light WebGL where it earns cost” because hero already has WebGL. Document that choice in the commit message if CSS-only.

- [ ] **Step 2: Manual check on desktop + phone**

- [ ] **Step 3: Commit**

```bash
git add src/components/webgl src/sections/Featured
git commit -m "feat: add featured cover hover treatment with WebGL gated polish"
```

---

### Task 10: Placeholder assets, SEO shell, production build QA

**Files:**
- Create: `public/images/covers/.gitkeep`, `public/favicon.svg`
- Modify: `index.html` (title, meta description, og tags), optionally point content covers to `/images/covers/...` when real assets arrive
- Test: production build

- [ ] **Step 1: Update `index.html` meta**

```html
<title>Abdelmalek Marwan — Video Editor</title>
<meta name="description" content="Portfolio of Abdelmalek Marwan — video editor. Selected reels and films." />
<meta property="og:title" content="Abdelmalek Marwan — Video Editor" />
<meta property="og:description" content="Selected reels and films." />
<meta property="og:type" content="website" />
```

- [ ] **Step 2: Production build**

```bash
npm run build
npm run preview
```

Expected: build succeeds; preview serves `/` and `/work/night-drive`.

- [ ] **Step 3: QA checklist (manual)**

- [ ] Hero loads; name + role visible EN/AR
- [ ] Language toggle persists after refresh
- [ ] Arabic sets RTL
- [ ] Reels click-to-play YouTube and Vimeo
- [ ] Featured → Work page → Back + next film
- [ ] Contact mailto + social links
- [ ] Reduced motion: no smooth-scroll theater / no WebGL
- [ ] Empty reels/films hide sections (quick temp edit)

- [ ] **Step 4: Commit**

```bash
git add index.html public src
git commit -m "chore: add SEO meta, public asset hooks, and verify production build"
```

---

## Spec coverage (self-review)

| Spec requirement | Task |
|------------------|------|
| React + Vite + React Router static SPA | 1, 4 |
| GSAP + ScrollTrigger + Lenis | 7 |
| Light Three.js / R3F hero + cover treatment | 8, 9 |
| Bilingual EN/AR + RTL + localStorage | 3, 4 |
| Home journey sections | 5 |
| `/work/:slug` film pages | 4, 6 |
| Static content model | 2 |
| YouTube + Vimeo cover-first embeds | 3, 4 |
| Email + social contact, no form | 5 |
| No icons / no DB / no heavy 3D | Global + 8 |
| Empty lists hide sections | 5 |
| Reduced motion + hide WebGL when tab hidden | 7, 8 |
| Error: unavailable embed | 4 |
| Placeholder content until real assets | 2, 10 |

**Placeholder scan:** no TBD/TODO left in tasks.  
**Type consistency:** `Lang`, `LocaleString`, `Reel`, `Film`, `toEmbedSrc`, `getFilmBySlug`, `getAdjacentFilms` aligned across tasks.

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-24-abdelmalek-portfolio.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration  
2. **Inline Execution** — execute tasks in this session with executing-plans and checkpoints  

Which approach?
