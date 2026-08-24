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
    accentLineIndexes: [1],
  },
  about: {
    en: 'I craft paced, emotional edits that make brands and stories feel intentional. Selective work. Clear communication. Delivery you can trust.',
    ar: 'أصنع مونتاجاً متزناً وعاطفياً يجعل العلامات والقصص تبدو مقصودة. عمل انتقائي. تواصل واضح. تسليم يمكنك الوثوق به.',
  },
  aboutAlt: {
    en: 'I cut until the feeling is obvious. No noise. No filler. Just the line that lands.',
    ar: 'أقطع حتى يظهر الإحساس. بلا ضجيج. بلا حشو. السطر الذي يصل فقط.',
  },
  email: 'hello@abdelmalek.studio',
  socials: [
    { label: 'Instagram', url: 'https://instagram.com/' },
    { label: 'Vimeo', url: 'https://vimeo.com/' },
  ],
}
