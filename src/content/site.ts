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
      ar: 'عبد المالك مروان',
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
    en: 'I craft paced, emotional edits that make brands and stories feel intentional. Selective work. Clear communication. Delivery you can trust.',
    ar: 'أصنع مونتاجاً متزناً وعاطفياً يجعل العلامات والقصص تبدو مقصودة. عمل انتقائي. تواصل واضح. تسليم يمكنك الوثوق به.',
  },
  aboutAlt: {
    en: 'I cut until the feeling is obvious. No noise. No filler. Just the line that lands.',
    ar: 'أقطع حتى يظهر الإحساس. بلا ضجيج. بلا حشو. السطر الذي يصل فقط.',
  },
  aboutStats: [
    {
      id: 'edits',
      value: 120,
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
      value: 34,
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
