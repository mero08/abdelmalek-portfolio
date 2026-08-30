import type { SiteContent } from './types'

export const site: SiteContent = {
  name: 'Abdelmalek Marwan',
  role: {
    en: 'Video Editor',
    ar: 'مونتير فيديو',
  },
  hero: {
    label: {
      en: 'Abdelmalek Marwan',
      ar: 'عبدالملك مروان',
    },
    lines: [
      { en: 'CUTTING', ar: 'نقطع' },
      { en: 'STORIES', ar: 'قصصاً' },
      { en: 'THAT', ar: 'تصل' },
      { en: 'LAND', ar: 'حقاً' },
    ],
    altLines: [
      { en: 'FINDING', ar: 'نبحث' },
      { en: 'MOMENTS', ar: 'عن لحظات' },
      { en: 'THAT', ar: 'تضرب' },
      { en: 'HIT', ar: 'بقوة' },
    ],
    accentLineIndexes: [1],
    altAccentLineIndexes: [1],
  },
  about: {
    en: 'Professional Editor. Skilled Videographer. A partner focused on one thing — getting you the results you want.',
    ar: 'مونتير محترف. فيديوجرافر متمكن. شريك يركز على هدف واحد — إيصالك للنتيجة التي تريدها.',
  },
  aboutAlt: {
    en: 'Where ideas find their light.',
    ar: 'حيث تجد الأفكار نورها.',
  },
  aboutStats: [
    {
      id: 'edits',
      value: 1000,
      suffix: '+',
      format: 'frames',
      label: { en: 'Videos edited', ar: 'فيديوهات مُعدّة' },
      detail: { en: 'Commercial, brand, and narrative', ar: 'تجاري، علامات، وسرد' },
    },
    {
      id: 'years',
      value: 7,
      format: 'timecode',
      label: { en: 'Years in the cut', ar: 'سنوات في المونتاج' },
      detail: { en: 'Pace, rhythm, and intent', ar: 'إيقاع ونبض وقصد' },
    },
    {
      id: 'clients',
      value: 50,
      suffix: '+',
      format: 'count',
      label: { en: 'Clients & collaborators', ar: 'عملاء وشركاء' },
      detail: { en: 'Studios, agencies, creators', ar: 'استوديوهات ووكالات ومبدعون' },
    },
  ],
  email: 'abdelmalekmarawan123@gmail.com',
  phone: '+20 1154085914',
  phoneE164: '+201154085914',
  socials: [
    {
      id: 'instagram',
      label: 'Instagram',
      url: 'https://www.instagram.com/abdelmalek.marawan/',
    },
    { id: 'facebook', label: 'Facebook', url: 'https://facebook.com/' },
    { id: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/201154085914' },
  ],
}
