import type { Film } from './types'

export const films: Film[] = [
  {
    slug: 'balbaa',
    title: { en: 'Balbaa', ar: 'بلبع' },
    hook: {
      en: 'Short cut — twenty seconds, tight pacing.',
      ar: 'مقطع قصير — عشرون ثانية، إيقاع محكم.',
    },
    story: {
      en: 'Compact edit focused on rhythm and a clean finish in under half a minute.',
      ar: 'مونتاج مكثف يركز على الإيقاع ونهاية نظيفة في أقل من نصف دقيقة.',
    },
    role: { en: 'Editor', ar: 'مونتير' },
    cover: null,
    stills: [],
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=WYwJRndsxGc',
    sortOrder: 1,
  },
  {
    slug: 'aziz-el-sham-opening',
    title: { en: 'Aziz El Sham opening', ar: 'افتتاحية عزيز الشام' },
    hook: {
      en: 'Opening sequence — set the mood before the story lands.',
      ar: 'تسلسل افتتاحي — يضبط المزاج قبل أن تبدأ القصة.',
    },
    story: {
      en: 'Title-and-atmosphere open cut to introduce Aziz El Sham with clear beat and grade.',
      ar: 'افتتاحية جو وعنوان لعمل عزيز الشام بإيقاع واضح وتصحيح لوني.',
    },
    role: { en: 'Editor', ar: 'مونتير' },
    cover: null,
    stills: [],
    provider: 'youtube',
    url: 'https://www.youtube.com/watch?v=NyILPGqIHd0',
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
