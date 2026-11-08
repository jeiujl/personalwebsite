// Options for "What do you need?" on the contact form. Services link to the
// form with one of these preselected (see `inquiryType` in services/*.yaml).
export const inquiryTypes = [
  'Lead follow-up system',
  'AI agents',
  'Website & lead generation',
  'App',
  'Not sure yet',
] as const;

export type InquiryType = (typeof inquiryTypes)[number];

export const budgetRanges = [
  'Under $2,500',
  '$2,500 – $5,000',
  '$5,000 – $10,000',
  '$10,000+',
  'Not sure yet',
] as const;

export const timelines = ['As soon as possible', 'Within a month', '1–3 months', 'Just exploring'] as const;

// What Chinese visitors see for each option. The English value is still what's
// submitted, so inquiry emails read the same in both languages.
export const optionLabelsZh: Record<string, string> = {
  'Lead follow-up system': '潜在客户跟进系统',
  'AI agents': 'AI 智能体',
  'Website & lead generation': '网站与获客',
  App: '应用开发',
  'Not sure yet': '还不确定',
  'Under $2,500': '$2,500 以下',
  '$2,500 – $5,000': '$2,500 – $5,000',
  '$5,000 – $10,000': '$5,000 – $10,000',
  '$10,000+': '$10,000 以上',
  'As soon as possible': '越快越好',
  'Within a month': '一个月内',
  '1–3 months': '1–3 个月',
  'Just exploring': '先了解一下',
};
