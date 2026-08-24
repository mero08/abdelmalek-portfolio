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
