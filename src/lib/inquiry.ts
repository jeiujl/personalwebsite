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
