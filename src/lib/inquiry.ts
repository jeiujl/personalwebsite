// Options for "What do you need?" on the contact form. Services link to the
// form with one of these preselected (see `inquiryType` in services/*.yaml).
export const inquiryTypes = [
  'Website',
  'App design',
  'CRM platform',
  'AI automation',
  'Not sure yet',
] as const;

export type InquiryType = (typeof inquiryTypes)[number];

export const budgetRanges = [
  'Under $1,000',
  '$1,000 – $3,000',
  '$3,000 – $7,500',
  '$7,500+',
  'Not sure yet',
] as const;

export const timelines = ['As soon as possible', 'Within a month', '1–3 months', 'Just exploring'] as const;

// What Chinese visitors see for each option. The English value is still what's
// submitted, so inquiry emails read the same in both languages.
export const optionLabelsZh: Record<string, string> = {
  Website: '网站',
  'App design': '应用设计',
  'CRM platform': 'CRM 平台',
  'AI automation': 'AI 自动化',
  'Not sure yet': '还不确定',
  'Under $1,000': '$1,000 以下',
  '$1,000 – $3,000': '$1,000 – $3,000',
  '$3,000 – $7,500': '$3,000 – $7,500',
  '$7,500+': '$7,500 以上',
  'As soon as possible': '越快越好',
  'Within a month': '一个月内',
  '1–3 months': '1–3 个月',
  'Just exploring': '先了解一下',
};
