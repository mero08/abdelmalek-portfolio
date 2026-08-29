import type { Film } from './types'

export const films: Film[] = [
  {
    slug: 'shams-w-hawa',
    title: { en: 'Shams W Hawa', ar: 'شمس وهوا' },
    hook: {
      en: 'Music film — rhythm-led cut with warm grade.',
      ar: 'فيلم موسيقي — مونتاج على الإيقاع وتدرج دافئ.',
    },
    story: {
      en: 'Performance-led piece built around vocal phrasing and light shifts in the grade.',
      ar: 'عمل مبني على الأداء وإيقاع الصوت وتغيرات الضوء في التصحيح.',
    },
    role: { en: 'Editor', ar: 'مونتير' },
    cover: null,
    stills: [],
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=sUpNxFQkyQg',
    sortOrder: 1,
  },
  {
    slug: 'azbet-el-khanazir',
    title: { en: 'Azbet El Khanazir', ar: 'عزبة الخنازير' },
    hook: {
      en: 'Action beat — hard cuts and impact frames.',
      ar: 'مشهد أكشن — قطع حادة ولقطات صادمة.',
    },
    story: {
      en: 'Short-form fight sequence edited for clarity and hit timing.',
      ar: 'تسلسل قتال قصير مونتاجه من أجل الوضوح وتوقيت الضربات.',
    },
    role: { en: 'Edit & finishing', ar: 'مونتاج وإنهاء' },
    cover: null,
    stills: [],
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=ZvOucenhvmI',
    sortOrder: 2,
  },
  {
    slug: 'samurai-seven',
    title: { en: 'Samurai Seven', ar: 'الساموراى السبعة' },
    hook: {
      en: 'Anime reel — kinetic montage and score sync.',
      ar: 'ريل أنمي — مونتاج حركي ومواءمة مع الموسيقى.',
    },
    story: {
      en: 'High-energy sequence cut to music hits and character beats.',
      ar: 'مشهد عالي الطاقة مقطوع على إيقاعات الموسيقى ولحظات الشخصيات.',
    },
    role: { en: 'Editor', ar: 'مونتير' },
    cover: null,
    stills: [],
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=7Z1FKSqVJYg',
    sortOrder: 3,
  },
  {
    slug: 'baltafsil-waleed',
    title: { en: 'Baltafsil — Waleed El Sisi', ar: 'بالتفصيل — وليد السيسي' },
    hook: {
      en: 'Podcast excerpt — long-form interview, tight mid-roll cut.',
      ar: 'مقطع بودكاست — مقابلة طويلة، قطع مركز دقيق.',
    },
    story: {
      en: 'Selected clip from Atheer’s Baltafsil podcast for narrative pacing tests.',
      ar: 'مقطع مختار من بودكاست بالتفصيل على أثير لاختبار إيقاع السرد.',
    },
    role: { en: 'Editor', ar: 'مونتير' },
    cover: null,
    stills: [],
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=045VJIe1fnU',
    sortOrder: 4,
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
